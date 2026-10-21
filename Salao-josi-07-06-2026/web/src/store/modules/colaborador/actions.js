import types from './types';

export function updateColaborador(payload) {
  return {
    type: types.UPDATE_COLABORADOR,
    payload,
  };
}

export function resetColaborador() {
  return {
    type: types.RESET_COLABORADOR,
  };
}

export function allColaboradores() {
  return {
    type: types.ALL_COLABORADORES,
  };
}

export function filterColaborador(filters) {
  return {
    type: types.FILTER_COLABORADOR,
    filters,
  };
}

export function addColaborador() {
  return {
    type: types.ADD_COLABORADOR,
  };
}

export function saveColaborador() {
  return {
    type: types.SAVE_COLABORADOR,
  };
}

export function unlinkColaborador() {
  return {
    type: types.UNLINK_COLABORADOR,
  };
}

export function allServicos() {
  return {
    type: types.ALL_SERVICOS,
  };
}
