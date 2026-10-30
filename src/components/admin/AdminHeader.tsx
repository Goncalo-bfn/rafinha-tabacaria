import { Link } from "react-router-dom";
import logo from "../../assets/logo-dark.png";

type AdminHeaderProps = {
  email?: string;
  onSignOut: () => void;
};

export function AdminHeader({ email, onSignOut }: AdminHeaderProps) {
  return (
    <header className="admin-header">
      <div className="admin-container admin-header__inner">
        <Link className="admin-brand" to="/admin">
          <img alt="" height="677" src={logo} width="512" />
          <span className="admin-brand__text">Painel</span>
        </Link>

        <nav aria-label="Navegação do painel" className="admin-nav">
          <a href="#resumo">Resumo</a>
          <a href="#produtos">Produtos</a>
          <Link to="/">Ver vitrine</Link>
          {email ? <span className="admin-nav__user">{email}</span> : null}
          <button onClick={onSignOut} type="button">
            Sair
          </button>
        </nav>
      </div>
    </header>
  );
}
