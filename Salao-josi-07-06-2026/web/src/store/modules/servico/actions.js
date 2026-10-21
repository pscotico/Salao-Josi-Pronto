import types from './types';

export function updateServico(payload) {
  return {
    type: types.UPDATE_SERVICO,
    payload,
  };
}

export function resetServico() {
  return {
    type: types.RESET_SERVICO,
  };
}

export function allServicos() {
  return {
    type: types.ALL_SERVICOS,
  };
}

export function addServico() {
  return {
    type: types.ADD_SERVICO,
  };
}

export function saveServico() {
  return {
    type: types.SAVE_SERVICO,
  };
}

export function removeServico(servicoId) {
  return {
    type: types.REMOVE_SERVICO,
    servicoId,
  };
}

export function removeArquivo(arquivo) {
  return {
    type: types.REMOVE_ARQUIVO,
    arquivo,
  };
}
