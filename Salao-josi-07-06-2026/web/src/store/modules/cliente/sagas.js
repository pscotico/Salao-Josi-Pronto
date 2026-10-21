import { all, call, put, select, takeLatest } from 'redux-saga/effects';

import consts from '../../../consts';
import api from '../../../services/api';
import {
  allClientes as allClientesAction,
  updateCliente,
  updateBehavior,
  updateComponents,
  updateForm,
  updateSelectedCliente,
} from './actions';
import types from './types';

export function* allClientes() {
  try {
    yield put(updateForm({ filtering: true }));

    const { data: res } = yield call(
      api.get,
      `/cliente/salao/${consts.salaoId}`
    );

    if (res.error) {
      alert(res.message);
      return false;
    }

    yield put(updateCliente(res.clients || []));
  } catch (err) {
    alert(err.message);
  } finally {
    yield put(updateForm({ filtering: false }));
  }
}

export function* filterClientes({ filters }) {
  try {
    const { cliente } = yield select((state) => state.cliente);

    yield put(updateForm({ filtering: true }));

    const { data: res } = yield call(api.post, '/cliente/filter', {
      filters: filters || {
        email: cliente.email,
        status: 'A',
      },
    });

    if (res.error) {
      alert(res.message);
      return false;
    }

    if (res.clientes.length > 0) {
      yield put(updateSelectedCliente(res.clientes[0]));
      yield put(updateForm({ disabled: true }));
    } else {
      yield put(updateForm({ disabled: false }));
    }
  } catch (err) {
    alert(err.message);
  } finally {
    yield put(updateForm({ filtering: false }));
  }
}

export function* saveCliente() {
  const { cliente } = yield select((state) => state.cliente);

  try {
    if (!cliente.nome || !cliente.email || !cliente.telefone || !cliente.dataNascimento) {
      alert('Preencha nome, e-mail, telefone e data de nascimento.');
      return false;
    }

    if (!cliente.documento?.numero) {
      alert('Preencha o CPF/CNPJ do cliente.');
      return false;
    }

    yield put(updateForm({ saving: true }));

    const { data: res } = yield call(api.post, '/cliente', {
      salaoId: consts.salaoId,
      cliente,
    });

    if (res.error) {
      alert(res.message);
      return false;
    }

    yield put(updateSelectedCliente(res.cliente));
    yield put(updateComponents({ drawer: false }));
    yield put(allClientesAction());
  } catch (err) {
    alert(err.message);
  } finally {
    yield put(updateForm({ saving: false }));
  }
}

export function* editCliente() {
  const { cliente } = yield select((state) => state.cliente);

  try {
    if (!cliente._id) {
      alert('Cliente sem identificador para alterar.');
      return false;
    }

    if (!cliente.nome || !cliente.email || !cliente.telefone || !cliente.dataNascimento) {
      alert('Preencha nome, e-mail, telefone e data de nascimento.');
      return false;
    }

    if (!cliente.documento?.numero) {
      alert('Preencha o CPF/CNPJ do cliente.');
      return false;
    }

    yield put(updateForm({ saving: true }));

    const { data: res } = yield call(api.put, `/cliente/${cliente._id}`, {
      salaoId: consts.salaoId,
      cliente,
    });

    if (res.error) {
      alert(res.message);
      return false;
    }

    yield put(updateSelectedCliente(res.cliente));
    yield put(updateForm({ dirty: false }));
    yield put(updateComponents({ drawer: false }));
    yield put(allClientesAction());
  } catch (err) {
    alert(err.message);
  } finally {
    yield put(updateForm({ saving: false }));
  }
}

export function* removeCliente() {
  const { cliente } = yield select((state) => state.cliente);

  try {
    if (!cliente.vinculoId) {
      alert('Cliente sem vinculo com o salao para remover.');
      return false;
    }

    yield put(updateForm({ saving: true }));

    const { data: res } = yield call(
      api.delete,
      `/cliente/vinculo/${cliente.vinculoId}`
    );

    if (res.error) {
      alert(res.message);
      return false;
    }

    yield put(updateComponents({ confirmDelete: false, drawer: false }));
    yield put(updateBehavior('create'));
    yield put(allClientesAction());
  } catch (err) {
    alert(err.message);
  } finally {
    yield put(updateForm({ saving: false }));
  }
}

export default all([
  takeLatest(types.ALL_CLIENTES, allClientes),
  takeLatest(types.FILTER_CLIENTES, filterClientes),
  takeLatest(types.SAVE_CLIENTE, saveCliente),
  takeLatest(types.EDIT_CLIENTE, editCliente),
  takeLatest(types.REMOVE_CLIENTE, removeCliente),
]);
