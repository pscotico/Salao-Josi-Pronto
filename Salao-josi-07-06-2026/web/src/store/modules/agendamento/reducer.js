import types from './types';
import { produce } from 'immer';
const INITIAL_STATE = {
    agendamentos:[],
};

function agendamento(state = INITIAL_STATE, action) {
  switch (action.type) {
    case types.UPDATE_AGENDAMENTO: {
      return produce(state, (draft) => {
        draft.agendamentos = action.agendamentos; // Guilherme  guilherme #4 02::07:37  agendamento tava sem o s //
      });
    }
    default:
      return state;
  }
}

export default agendamento;
