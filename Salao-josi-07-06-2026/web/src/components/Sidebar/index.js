import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png';

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="sidebar col-4 col-sm-3 col-lg-2 h-100">
      <img src={logo} className="img-fluid px-3 py-4" alt="Salao Josi" />
      <ul className="p-0 m-0">
        <li>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            <span className="mdi mdi-calendar-check"></span>
            <span>Agendamentos</span>
          </Link>
        </li>
        <li>
          <Link
            to="/clientes"
            className={location.pathname === '/clientes' ? 'active' : ''}
          >
            <span className="mdi mdi-account-multiple"></span>
            <span>Clientes</span>
          </Link>
        </li>
        <li>
          <Link
            to="/colaboradores"
            className={location.pathname === '/colaboradores' ? 'active' : ''}
          >
            <span className="mdi mdi-card-account-details-outline"></span>
            <span>Colaboradores</span>
          </Link>
        </li>
        <li>
          <Link
            to="/servicos-produtos"
            className={
              location.pathname === '/servicos-produtos' ? 'active' : ''
            }
          >
            <span className="mdi mdi-auto-fix"></span>
            <span>Servicos</span>
          </Link>
        </li>
        <li>
          <Link
            to="/horarios-atendimento"
            className={
              location.pathname === '/horarios-atendimento' ? 'active' : ''
            }
          >
            <span className="mdi mdi-clock-check-outline"></span>
            <span>Horarios</span>
          </Link>
        </li>
        <li>
          <Link
            to="/salao"
            className={location.pathname === '/salao' ? 'active' : ''}
          >
            <span className="mdi mdi-storefront-outline"></span>
            <span>Salao</span>
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
