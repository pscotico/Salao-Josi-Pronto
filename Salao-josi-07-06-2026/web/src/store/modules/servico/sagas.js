import { takeLatest, all, call, put, select } from 'redux-saga/effects';
import {
  updateServico,
  resetServico,
  allServicos as allServicosAction,
} from './actions';
import types from './types';
import api from '../../../services/api';
import { notification } from '../../../services/rsuite';
import consts from '../../../consts';

const buildServicoFormData = (servico) => {
  const formData = new FormData();
  const arquivosAtuais = [];

  Object.entries(servico).forEach(([key, value]) => {
    if (key === 'arquivos' || key === '_id' || value === undefined || value === null) {
      return;
    }

    formData.append(key, value instanceof Date ? value.toISOString() : value);
  });

  (servico.arquivos || []).forEach((arquivo) => {
    if (arquivo?.caminho) {
      arquivosAtuais.push(arquivo);
      return;
    }

    formData.append('arquivos', arquivo);
  });

  formData.append('arquivosAtuais', JSON.stringify(arquivosAtuais));
  formData.append('salaoId', consts.salaoId);

  return formData;
};

export function* addServico() {
  const { servico, form, components } = yield select((state) => state.servico);

  try {
    yield put(updateServico({ form: { ...form, saving: true } }));

    const { data: res } = yield call(
      api.post,
      '/servico',
      buildServicoFormData(servico)
    );

    yield put(updateServico({ form: { ...form, saving: false } }));

    if (res.error) {
      notification('error', {
        placement: 'topStart',
        title: 'Ops...',
        description: res.message,
      });
      return false;
    }

    yield put(allServicosAction());
    yield put(updateServico({ components: { ...components, drawer: false } }));
    yield put(resetServico());

    notification('success', {
      placement: 'topStart',
      title: 'Feitoooo!!',
      description: 'Servico salvo com sucesso!',
    });
  } catch (err) {
    yield put(updateServico({ form: { ...form, saving: false } }));
    notification('error', {
      placement: 'topStart',
      title: 'Ops...',
      description: err.message,
    });
  }
}

export function* allServicos() {
  const { form } = yield select((state) => state.servico);

  try {
    yield put(updateServico({ form: { ...form, filtering: true } }));

    const { data: res } = yield call(
      api.get,
      `/servico/salao/${consts.salaoId}`
    );

    yield put(updateServico({ form: { ...form, filtering: false } }));

    if (res.error) {
      notification('error', {
        placement: 'topStart',
        title: 'Ops...',
        description: res.message,
      });
      return false;
    }

    yield put(
      updateServico({
        servicos: res.servicos.map((servico) => ({
          ...servico,
          arquivos: servico.arquivos || [],
        })),
      })
    );
  } catch (err) {
    yield put(updateServico({ form: { ...form, filtering: false } }));
    notification('error', {
      placement: 'topStart',
      title: 'Ops...',
      description: err.message,
    });
  }
}

export function* saveServico() {
  const { servico, form, components } = yield select((state) => state.servico);

  try {
    yield put(updateServico({ form: { ...form, saving: true } }));

    const { data: res } = yield call(
      api.put,
      `/servico/${servico._id}`,
      buildServicoFormData(servico)
    );

    yield put(updateServico({ form: { ...form, saving: false } }));

    if (res.error) {
      notification('error', {
        placement: 'topStart',
        title: 'Ops...',
        description: res.message,
      });
      return false;
    }

    yield put(allServicosAction());
    yield put(
      updateServico({
        components: { ...components, drawer: false, confirmDelete: false },
      })
    );
    yield put(resetServico());

    notification('success', {
      placement: 'topStart',
      title: 'Tudo certo',
      description: 'Servico alterado com sucesso!',
    });
  } catch (err) {
    yield put(updateServico({ form: { ...form, saving: false } }));
    notification('error', {
      placement: 'topStart',
      title: 'Ops...',
      description: err.message,
    });
  }
}

export function* removeServico({ servicoId }) {
  const { servico, form, components } = yield select((state) => state.servico);
  const id = servicoId || servico._id;

  try {
    yield put(updateServico({ form: { ...form, saving: true } }));

    const { data: res } = yield call(api.delete, `/servico/${id}`);

    yield put(updateServico({ form: { ...form, saving: false } }));

    if (res.error) {
      notification('error', {
        placement: 'topStart',
        title: 'Ops...',
        description: res.message,
      });
      return false;
    }

    yield put(allServicosAction());
    yield put(
      updateServico({
        components: { ...components, drawer: false, confirmDelete: false },
      })
    );
    yield put(resetServico());

    notification('success', {
      placement: 'topStart',
      title: 'Tudo certo',
      description: 'Servico removido com sucesso!',
    });
  } catch (err) {
    yield put(updateServico({ form: { ...form, saving: false } }));
    notification('error', {
      placement: 'topStart',
      title: 'Ops...',
      description: err.message,
    });
  }
}

export function* removeArquivo({ arquivo }) {
  const { servico } = yield select((state) => state.servico);
  const arquivos = servico.arquivos.filter((item) => item.caminho !== arquivo);

  yield put(updateServico({ servico: { ...servico, arquivos } }));
}

export default all([
  takeLatest(types.ADD_SERVICO, addServico),
  takeLatest(types.ALL_SERVICOS, allServicos),
  takeLatest(types.SAVE_SERVICO, saveServico),
  takeLatest(types.REMOVE_SERVICO, removeServico),
  takeLatest(types.REMOVE_ARQUIVO, removeArquivo),
]);
