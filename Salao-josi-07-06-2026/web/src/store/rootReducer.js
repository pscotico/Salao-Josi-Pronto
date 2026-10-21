import { combineReducers } from 'redux';

import agendamento from './modules/agendamento/reducer';
import cliente from './modules/cliente/reducer';
import colaborador from './modules/colaborador/reducer';
import servico from './modules/servico/reducer';
import horario from './modules/hoarario/reducer';
import clienteAgendamento from './modules/clienteAgendamento/reducer';

export default combineReducers({
  agendamento,
  cliente,
  colaborador,
  servico,
  horario,
  clienteAgendamento,
});
