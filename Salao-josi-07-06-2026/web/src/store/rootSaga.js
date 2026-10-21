import { all } from 'redux-saga/effects';

import agendamento from './modules/agendamento/sagas';
import clientes from './modules/cliente/sagas';
import colaboradores from './modules/colaborador/sagas';
import servicos from './modules/servico/sagas';
import horario from './modules/hoarario/sagas';
import clienteAgendamento from './modules/clienteAgendamento/sagas';

export default function* rootSaga() {
  return yield all([
    agendamento,
    clientes,
    colaboradores,
    servicos,
    horario,
    clienteAgendamento,
  ]);
}
