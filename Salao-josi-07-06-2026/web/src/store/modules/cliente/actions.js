import types from './types';

export function allClientes() {
  return {
    type: types.ALL_CLIENTES,
  };
}

export function updateCliente(clientes) {
  return {
    type: types.UPDATE_CLIENTE,
    clientes,
  };
}

export function updateBehavior(behavior) {
  return {
    type: types.UPDATE_BEHAVIOR,
    behavior,
  };
}

export function updateSelectedCliente(cliente) {
  return {
    type: types.UPDATE_SELECTED_CLIENTE,
    cliente,
  };
}

export function updateComponents(components) {
  return {
    type: types.UPDATE_COMPONENTS,
    components,
  };
}

export function updateForm(form) {
  return {
    type: types.UPDATE_FORM,
    form,
  };
}

export function filterClientes(filters) {
  return {
    type: types.FILTER_CLIENTES,
    filters,
  };
}

export function saveCliente() {
  return {
    type: types.SAVE_CLIENTE,
  };
}

export function editCliente() {
  return {
    type: types.EDIT_CLIENTE,
  };
}

export function removeCliente() {
  return {
    type: types.REMOVE_CLIENTE,
  };
}
