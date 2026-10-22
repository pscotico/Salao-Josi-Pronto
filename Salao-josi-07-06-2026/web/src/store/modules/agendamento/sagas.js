import { takeLatest, all, call, put } from 'redux-saga/effects';
import { updateAgendamento } from './actions';
import  types from './types'
import api from '../../../services/api';
import consts from '../../../consts';

export function* filterAgendamento({ start, end }) {
  try {
    const { data: res } = yield call(api.post, '/agendamento/filter', {
      salaoId: consts.salaoId,
      range: {
        start,
        end,
      },
    });
    
  if (res.error) {
      alert(res.message);
      return false;
    }

    yield put(updateAgendamento(res.agendamentos));
  } catch (err) {
    alert(err.message);
  }
}

export default all([takeLatest(types.FILTER_AGENDAMENTOS , filterAgendamento)]);
