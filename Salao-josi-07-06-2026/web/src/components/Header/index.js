import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
      logout();
      navigate('/login', { replace: true });
    };

    return (
    <header className="container-fluid d-flex justify-content-end">
      <button type="button" className="admin-logout" onClick={handleLogout}>
        <span className="mdi mdi-logout" aria-hidden="true"></span>
        Sair
      </button>
      <div className="d-flex align-items-center">
        <div className="text-right mr-3">
          <span className="d-block m-0 p-0 text-white">{user?.nome || 'Administrativo'}</span>
          <small className="m-0 p-0">Plano Gold</small>
        </div>
        <img
          src="https://conteudo.imguol.com.br/c/entretenimento/d5/2020/10/07/homem-com-vergonha-1602098705397_v2_450x450.jpg"
          alt="Foto do perfil"
        />
        <span className="mdi mdi-chevron-down  text-white "></span>
      </div>
    </header>
  );
};

export default Header;
