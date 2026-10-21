import { produce } from 'immer';
import types from './types';

const emptyServico = {
  titulo: '',
  preco: '',
  comissao: '',
  duracao: null,
  recorrencia: '',
  descricao: '',
  status: 'A',
  arquivos: [],
};

const INITIAL_STATE = {
  behavior: 'create',
  components: {
    confirmDelete: false,
    drawer: false,
    tab: 'dados-cadastrais',
  },
  form: {
    filtering: false,
    disabled: false,
    saving: false,
  },
  servico: emptyServico,
  servicos: [],
};

function servico(state = INITIAL_STATE, action) {
  switch (action.type) {
    case types.UPDATE_SERVICO:
      return produce(state, (draft) => {
        Object.assign(draft, action.payload);
      });
    case types.RESET_SERVICO:
      return produce(state, (draft) => {
        draft.behavior = 'create';
        draft.form = { ...INITIAL_STATE.form };
        draft.servico = { ...emptyServico, arquivos: [] };
      });
    default:
      return state;
  }
}

export default servico;
