import {
    BrowserRouter as Router,
    Routes as RouterRoutes,
    Route,
    Navigate,
    useLocation,
} from 'react-router-dom';

import './styles.css';

import Header from './components/Header';
import Sidebar from './components/Sidebar';

import Agendamentos  from './pages/Agendamentos';
import Clientes from './pages/Clientes';
import Colaboradores from './pages/Colaboradores';
import ServicosProdutos from './pages/ServicosProdutos';
import HorariosAtendimento from './pages/HorariosAtendimento';
import Salao from './pages/Salao';
import ClienteAgendamento from './pages/ClienteAgendamento';
import ClientePerfil from './pages/ClientePerfil';
import Login from './pages/Login';
import { useAuth } from './contexts/AuthContext';

const PrivateRoute = ({ accessType, children }) => {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (accessType && auth.accessType !== accessType) {
    return (
      <Navigate
        to={auth.accessType === 'admin' ? '/' : '/cliente'}
        replace
        state={{ message: 'Acesso administrativo necessario.' }}
      />
    );
  }

  return children;
};

const AdminLayout = () => (
  <>
    <Header />
    <div className="container-fluid h-100">
      <div className=" row h-100">
        <Sidebar />
        <RouterRoutes>
          <Route path="/" exact element={<Agendamentos />} />
          <Route path="/admin" exact element={<Agendamentos />} />
          <Route path="/dashboard" exact element={<Agendamentos />} />
          <Route path="/painel" exact element={<Agendamentos />} />
          <Route path="/clientes" exact element={<Clientes />} />
          <Route path="/colaboradores" exact element={<Colaboradores />} />
          <Route path="/servicos-produtos" exact element={<ServicosProdutos />} />
          <Route path="/horarios-atendimento" exact element={<HorariosAtendimento />} />
          <Route path="/salao" exact element={<Salao />} />
        </RouterRoutes>
      </div>
    </div>
  </>
);

const Routes = () => { 
    return (
      <Router>
        <RouterRoutes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/cliente"
            element={
              <PrivateRoute accessType="cliente">
                <ClienteAgendamento />
              </PrivateRoute>
            }
          />
          <Route
            path="/agendamentos"
            element={
              <PrivateRoute accessType="cliente">
                <ClienteAgendamento />
              </PrivateRoute>
            }
          />
          <Route
            path="/servicos"
            element={
              <PrivateRoute accessType="cliente">
                <ClienteAgendamento />
              </PrivateRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <PrivateRoute accessType="cliente">
                <ClientePerfil />
              </PrivateRoute>
            }
          />
          <Route
            path="/*"
            element={
              <PrivateRoute accessType="admin">
                <AdminLayout />
              </PrivateRoute>
            }
          />
        </RouterRoutes>
      </Router>
    );
};

export default Routes;
