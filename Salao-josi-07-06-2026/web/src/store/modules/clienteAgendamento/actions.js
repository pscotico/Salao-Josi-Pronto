import types from './types';

export function getSalaoPublico() {
  return { type: types.GET_SALAO_PUBLICO };
}

export function allServicosPublicos() {
  return { type: types.ALL_SERVICOS_PUBLICOS };
}

export function filterAgendaPublica() {
  return { type: types.FILTER_AGENDA_PUBLICA };
}

export function saveAgendamentoPublico() {
  return { type: types.SAVE_AGENDAMENTO_PUBLICO };
}

export function updateClienteAgendamento(payload) {
  return { type: types.UPDATE_CLIENTE_AGENDAMENTO, payload };
}

export function updateAgendamentoPublico(key, value) {
  return { type: types.UPDATE_AGENDAMENTO_PUBLICO, key, value };
}

export function updateClientePublico(key, value) {
  return { type: types.UPDATE_CLIENTE_PUBLICO, key, value };
}

export function updateFormPublico(key, value) {
  return { type: types.UPDATE_FORM_PUBLICO, key, value };
}

export function resetAgendamentoPublico(fullReset = false) {
  return { type: types.RESET_AGENDAMENTO_PUBLICO, fullReset };
}
