import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './styles.css';

const ClientePerfil = () => {
  const { user, logout } = useAuth();

  useEffect(() => {
    document.body.classList.add('cliente-profile-page');

    return () => document.body.classList.remove('cliente-profile-page');
  }, []);

  return (
    <main className="cliente-perfil">
      <section className="cliente-perfil__panel">
        <div>
          <span className="cliente-perfil__eyebrow">Minha conta</span>
          <h1>{user?.nome || 'Cliente'}</h1>
          <p>{user?.email}</p>
        </div>

        <div className="cliente-perfil__actions">
          <Link to="/cliente">
            <span className="mdi mdi-calendar-plus" aria-hidden="true"></span>
            Agendar
          </Link>
          <Link to="/servicos">
            <span className="mdi mdi-auto-fix" aria-hidden="true"></span>
            Servicos
          </Link>
          <button type="button" onClick={logout}>
            <span className="mdi mdi-logout" aria-hidden="true"></span>
            Sair
          </button>
        </div>
      </section>
    </main>
  );
};

export default ClientePerfil;
