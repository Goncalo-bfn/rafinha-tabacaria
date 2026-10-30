# Rafinha Tabacaria

Site público da Rafinha Tabacaria: vitrine carregada do Supabase, filtro por
categoria e carrinho que finaliza o pedido pelo WhatsApp. Inclui uma área
administrativa protegida para gerenciar os produtos.

## Requisitos

- Node.js 20.19+ ou 22.12+
- npm

## Configuração

Copie `.env.example` para `.env.local` e preencha:

- `VITE_SUPABASE_URL` — URL do projeto Supabase (`https://<project-ref>.supabase.co`)
- `VITE_SUPABASE_ANON_KEY` — chave pública (anon) do projeto

As variáveis são lidas em tempo de build por `src/lib/supabase.ts`. Sem elas a
aplicação falha ao iniciar com uma mensagem explicativa.

## Executar

```sh
npm install
npm run dev
```

## Build e preview

```sh
npm run build
npm run preview
```

O build executa `tsc --noEmit` antes do `vite build`.

## Como o site funciona

### Catálogo

- `src/services/products.ts` consulta a tabela `products` do Supabase, trazendo
  apenas registros com `active = true`, ordenados por `sort_order` e depois por
  `created_at`.
- `src/hooks/useProducts.ts` controla os estados `loading`, `error` e `ready`.
- `src/components/ProductShowcase.tsx` renderiza a vitrine. Em desenvolvimento,
  se a consulta falhar ou voltar vazia, são exibidos produtos de exemplo de
  `src/data/products.ts`; esse fallback nunca aparece em produção.
- Preços são formatados em BRL por `src/lib/format.ts`.

### Categorias

- As categorias são derivadas dos próprios produtos ativos em
  `src/lib/categories.ts`, em ordem alfabética (pt-BR). A opção "Todas" mostra o
  catálogo completo.
- Produtos sem categoria aparecem em "Todas", mas não geram uma opção própria.
- A interface do filtro fica em `src/components/CategoryFilter.tsx`.

### Carrinho

- Estado em `src/context/CartContext.tsx` e regras puras em `src/lib/cart.ts`.
- Persistência local em `localStorage` na chave `rafinha-tabacaria.cart.v1`,
  guardando apenas `id` e `quantity` de cada item.
- Nome e preço de cada linha são sempre derivados do catálogo atual do Supabase;
  itens desativados ou removidos deixam de ser exibidos.
- O checkout só é liberado quando o catálogo está `ready` e os preços foram
  reconferidos. A mensagem do pedido é montada com itens, quantidades, subtotais
  e total, e aberta no WhatsApp da loja.
- A interface é um drawer lateral em `src/components/CartDrawer.tsx`.

### Contatos

WhatsApp, telefone exibido e Instagram ficam centralizados em
`src/config/store.ts`.

### Área administrativa

- Rota `/admin` (`src/pages/AdminPage.tsx`), com login via Supabase Auth.
- O acesso é liberado apenas para usuários cujo UUID consta em `public.admins`,
  conforme `src/hooks/useAdminSession.ts`.
- O painel (`src/pages/AdminDashboard.tsx`) permite criar, editar,
  ativar/desativar e excluir produtos, além de enviar imagens para o bucket
  `products` (JPEG, PNG ou WebP, até 5 MB) — veja `src/services/storage.ts`.
- A proteção dos dados é feita por RLS no banco. A migration está em
  `supabase/migrations/`.

## Rotas

- `/` — site público
- `/admin` — painel administrativo
- Qualquer outra rota redireciona para `/`

## Publicação

- O site é uma SPA: a hospedagem precisa redirecionar rotas desconhecidas para
  `index.html` (necessário para acessar `/admin` diretamente).
- Os assets são gerados com caminhos absolutos (`/assets/...`), então o site
  deve ser publicado na raiz do domínio.
- As variáveis `VITE_*` precisam estar configuradas no ambiente de build da
  hospedagem.
