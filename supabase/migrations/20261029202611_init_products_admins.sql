-- =============================================================================
-- Rafinha Tabacaria — estrutura inicial do Supabase
-- Migration: 20261029202611_init_products_admins
--
-- Cria:
--   1. public.products      (catálogo público da vitrine)
--   2. public.admins        (usuários autorizados a administrar, 1:1 com auth.users)
--   3. RLS + políticas de acesso
--   4. Bucket público "products" (5 MB, jpeg/png/webp) + políticas de Storage
--
-- NÃO executar manualmente sem revisão. Ainda não foi aplicada em nenhum banco.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Utilitário: manter updated_at sincronizado
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Preenche updated_at com now() antes de cada UPDATE. Uso interno via trigger.';

-- -----------------------------------------------------------------------------
-- 2. Tabela: products
-- -----------------------------------------------------------------------------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null,
  description text,
  price       numeric(10, 2) not null default 0,
  image_url   text,
  category    text,
  active      boolean     not null default true,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint products_name_not_blank check (length(btrim(name)) > 0),
  constraint products_price_non_negative check (price >= 0)
);

comment on table public.products is
  'Vitrine da loja. Leitura pública apenas de linhas com active = true.';
comment on column public.products.price is
  'Preço em BRL com 2 casas decimais. Formatação fica a cargo do frontend.';
comment on column public.products.image_url is
  'URL pública da imagem OU caminho dentro do bucket "products". Decisão final pendente.';
comment on column public.products.category is
  'Texto livre nesta etapa. Pode virar FK para uma tabela categories no futuro.';
comment on column public.products.sort_order is
  'Ordenação manual da vitrine (menor primeiro). Sem unicidade para permitir empates.';

create index if not exists products_active_sort_order_idx
  on public.products (active, sort_order);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row
  execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 3. Tabela: admins
--    Uma linha por administrador. NÃO existe coluna de papel/permissão de
--    propósito: todos os administradores têm exatamente as mesmas permissões.
--    Os IDs reais de auth.users NÃO são criados aqui (ver "decisões pendentes").
-- -----------------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.admins is
  'Allowlist de administradores. Todos têm permissões idênticas. Sem autopromoção via API.';
comment on column public.admins.user_id is
  'Referencia auth.users(id). Excluir o usuário no Auth remove o acesso de admin.';

-- -----------------------------------------------------------------------------
-- 4. Função de checagem de admin
--    SECURITY DEFINER para ler public.admins sem disparar RLS: evita recursão
--    infinita (política de admins -> admins -> admins...). O search_path fixo
--    impede sequestro de objetos por schema malicioso.
-- -----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins a
    where a.user_id = auth.uid()
  );
$$;

comment on function public.is_admin() is
  'true se o usuário autenticado estiver em public.admins. SECURITY DEFINER para evitar RLS recursiva.';

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- -----------------------------------------------------------------------------
-- 5. Privilégios de tabela (defesa em profundidade)
--    RLS é a barreira principal; os GRANTs limitam o que é sequer tentado.
-- -----------------------------------------------------------------------------
revoke all on public.products from anon;
grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;

-- Visitante não lê admins. Usuário comum não escreve em admins (sem GRANT e
-- sem política de INSERT/UPDATE/DELETE => autopromoção impossível).
revoke all on public.admins from anon;
revoke all on public.admins from authenticated;
grant select on public.admins to authenticated;

-- -----------------------------------------------------------------------------
-- 6. RLS
-- -----------------------------------------------------------------------------
alter table public.products enable row level security;
alter table public.admins enable row level security;

-- 6.1 products: leitura pública somente de itens ativos
drop policy if exists products_select_active_public on public.products;
create policy products_select_active_public
  on public.products
  for select
  to anon, authenticated
  using (active = true);

-- 6.2 products: administradores enxergam também os inativos (para gerenciar)
drop policy if exists products_select_admin on public.products;
create policy products_select_admin
  on public.products
  for select
  to authenticated
  using (public.is_admin());

-- 6.3 products: escrita exclusiva de administradores
drop policy if exists products_insert_admin on public.products;
create policy products_insert_admin
  on public.products
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists products_update_admin on public.products;
create policy products_update_admin
  on public.products
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists products_delete_admin on public.products;
create policy products_delete_admin
  on public.products
  for delete
  to authenticated
  using (public.is_admin());

-- 6.4 admins: cada administrador vê apenas a própria linha.
--     Nenhuma política de INSERT/UPDATE/DELETE => ninguém promove a si mesmo.
drop policy if exists admins_select_self on public.admins;
create policy admins_select_self
  on public.admins
  for select
  to authenticated
  using (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 7. Storage: bucket público "products"
--    Imagens acessíveis publicamente por URL, mas SEM listagem para visitantes.
--    Limites impostos pelo próprio bucket: 5 MB e apenas jpeg/png/webp.
--    Upload, substituição e exclusão somente por administradores.
-- -----------------------------------------------------------------------------
-- Upsert: cria o bucket se não existir e, se já existir, atualiza a configuração
-- (público, limite de tamanho e MIME types) sem gerar duplicata.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'products',
  'products',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 7.1 listagem restrita a administradores
--     Visitantes anônimos e usuários autenticados comuns NÃO conseguem listar
--     os arquivos do bucket. O acesso às imagens por URL pública continua
--     funcionando independentemente desta política.
drop policy if exists storage_products_read_admin on storage.objects;
create policy storage_products_read_admin
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'products' and public.is_admin());

-- 7.2 upload
drop policy if exists storage_products_insert_admin on storage.objects;
create policy storage_products_insert_admin
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'products' and public.is_admin());

-- 7.3 substituição de arquivo
drop policy if exists storage_products_update_admin on storage.objects;
create policy storage_products_update_admin
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'products' and public.is_admin())
  with check (bucket_id = 'products' and public.is_admin());

-- 7.4 exclusão
drop policy if exists storage_products_delete_admin on storage.objects;
create policy storage_products_delete_admin
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'products' and public.is_admin());

-- =============================================================================
-- DECISÕES PENDENTES (não resolvidas por falta de informação — nada foi inventado)
--
-- 1. Identidade dos administradores: nenhum usuário ou UUID foi criado. Após
--    criar as duas contas em Authentication > Users, inserir manualmente:
--      insert into public.admins (user_id) values ('<uuid-real-1>'), ('<uuid-real-2>');
--    Executar com service_role / SQL Editor, nunca pelo frontend.
--
-- 2. image_url: aceita URL completa ou caminho no bucket. Definir qual padrão
--    o frontend usará antes de popular dados.
--
-- 3. Exclusão de produto: imagens no Storage NÃO são removidas em cascata.
--    Decidir entre limpeza manual, trigger ou job.
--
-- 4. Categorias: texto livre por enquanto. Sem tabela própria nesta etapa.
--
-- Resolvido nesta revisão: bucket configurado como público, limite de 5 MB,
-- MIME types image/jpeg, image/png e image/webp. Listagem do bucket permitida
-- apenas para administradores autenticados; acesso por URL continua público.
-- =============================================================================
