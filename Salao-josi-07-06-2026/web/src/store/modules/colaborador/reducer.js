import { produce } from 'immer';
import types from './types';

const emptyColaborador = {
  email: '',
  nome: '',
  telefone: '',
  dataNascimento: '',
  sexo: 'M',
  vinculo: 'A',
  especialidades: [],
  contaBancaria: {
    titular: '',
    cpfCnpj: '',
    banco: '',
    tipo: 'conta_corrente',
    agencia: '',
    numero: '',
    dv: '',
  },
};

const INITIAL_STATE = {
  behavior: 'create',
  components: {
    confirmDelete: false,
    drawer: false,
    tab: 'dados-cadastrais',
  },
  form: {
    disabled: false,
    filtering: false,
    saving: false,
  },
  colaborador: emptyColaborador,
  colaboradores: [],
  servicos: [],
};

function colaborador(state = INITIAL_STATE, action) {
  switch (action.type) {
    case types.UPDATE_COLABORADOR:
      return produce(state, (draft) => {
        Object.assign(draft, action.payload);
      });
    case types.RESET_COLABORADOR:
      return produce(state, (draft) => {
        draft.behavior = 'create';
        draft.form = { ...INITIAL_STATE.form };
        draft.colaborador = { ...emptyColaborador, contaBancaria: { ...emptyColaborador.contaBancaria } };
      });
    default:
      return state;
  }
}

export default colaborador;
