import moment from 'moment';
import { takeLatest, all, call, put, select } from 'redux-saga/effects';
import types from './types';
import api from '../../../services/api';
import consts from '../../../consts';
import util from '../../../util';
import {
  resetAgendamentoPublico,
  updateAgendamentoPublico,
  updateClienteAgendamento,
  updateFormPublico,
} from './actions';

const getErrorMessage = (err) =>
  err?.response?.data?.message ||
  err?.message ||
  'Nao foi possivel concluir a operacao. Tente novamente.';

const buildAgendamentoPayload = (agendamento, cliente) => {
  const payload = {
    ...agendamento,
    cliente,
  };

  if (!payload.clienteId) {
    delete payload.clienteId;
  }

  return payload;
};

export function* getSalaoPublico() {
  try {
    yield put(updateFormPublico('loadingSalao', true));
    yield put(updateFormPublico('errorMessage', ''));

    const { data: res } = yield call(api.post, `/servico/filter/${consts.salaoId}`, {
      fields: 'nome foto logo capa telefone endereco site geo',
    });

    yield put(updateFormPublico('loadingSalao', false));

    if (res.error) {
      yield put(updateFormPublico('errorMessage', res.message));
      return false;
    }

    yield put(updateClienteAgendamento({ salao: res.salao || {} }));
  } catch (err) {
    yield put(updateFormPublico('loadingSalao', false));
    yield put(updateFormPublico('errorMessage', getErrorMessage(err)));
  }
}

export function* allServicosPublicos() {
  try {
    yield put(updateFormPublico('loadingServicos', true));
    yield put(updateFormPublico('errorMessage', ''));

    const { data: res } = yield call(api.get, `/servico/salao/${consts.salaoId}`);

    yield put(updateFormPublico('loadingServicos', false));

    if (res.error) {
      yield put(updateFormPublico('errorMessage', res.message));
      return false;
    }

    yield put(updateClienteAgendamento({ servicos: res.servicos || [] }));
  } catch (err) {
    yield put(updateFormPublico('loadingServicos', false));
    yield put(updateFormPublico('errorMessage', getErrorMessage(err)));
  }
}

export function* filterAgendaPublica() {
  try {
    yield put(updateFormPublico('loadingAgenda', true));
    yield put(updateFormPublico('errorMessage', ''));

    const { agendamento, agenda } = yield select((state) => state.clienteAgendamento);

    if (!agendamento.servicoId) {
      yield put(updateFormPublico('loadingAgenda', false));
      return false;
    }

    const finalStartDate =
      agenda.length === 0 ? moment().format('YYYY-MM-DD') : Object.keys(agenda[0])[0];

    const { data: res } = yield call(api.post, '/agendamento/dias-disponiveis', {
      ...agendamento,
      data: finalStartDate,
    });

    yield put(updateFormPublico('loadingAgenda', false));

    if (res.error) {
      yield put(updateFormPublico('errorMessage', res.message));
      return false;
    }

    const { horariosDisponiveis, data, colaboradorId } = util.selectAgendamento(
      res.agenda || []
    );
    const finalDate = horariosDisponiveis?.[0]?.[0]
      ? moment(`${data}T${horariosDisponiveis[0][0]}`).format()
      : null;

    yield put(
      updateClienteAgendamento({
        agenda: res.agenda || [],
        colaboradores: res.colaboradores || [],
      })
    );

    if (finalDate) {
      yield put(updateAgendamentoPublico('data', finalDate));
      yield put(updateAgendamentoPublico('colaboradorId', colaboradorId));
      yield put(updateFormPublico('selectedStep', 'agenda'));
    } else {
      yield put(
        updateFormPublico(
          'errorMessage',
          'Nao encontramos horarios disponiveis para este servico.'
        )
      );
    }
  } catch (err) {
    yield put(updateFormPublico('loadingAgenda', false));
    yield put(updateFormPublico('errorMessage', getErrorMessage(err)));
  }
}

export function* saveAgendamentoPublico() {
  try {
    yield put(updateFormPublico('saving', true));
    yield put(updateFormPublico('errorMessage', ''));
    yield put(updateFormPublico('successMessage', ''));

    const { agendamento, cliente } = yield select((state) => state.clienteAgendamento);
    const { data: res } = yield call(
      api.post,
      '/agendamento',
      buildAgendamentoPayload(agendamento, cliente)
    );

    yield put(updateFormPublico('saving', false));

    if (res.error) {
      yield put(updateFormPublico('errorMessage', res.message));
      return false;
    }

    yield put(resetAgendamentoPublico(true));
    yield put(updateFormPublico('successMessage', 'Agendamento realizado com sucesso'));
  } catch (err) {
    yield put(updateFormPublico('saving', false));
    yield put(updateFormPublico('errorMessage', getErrorMessage(err)));
  }
}

export default all([
  takeLatest(types.GET_SALAO_PUBLICO, getSalaoPublico),
  takeLatest(types.ALL_SERVICOS_PUBLICOS, allServicosPublicos),
  takeLatest(types.FILTER_AGENDA_PUBLICA, filterAgendaPublica),
  takeLatest(types.SAVE_AGENDAMENTO_PUBLICO, saveAgendamentoPublico),
]);
