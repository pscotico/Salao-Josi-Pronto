import { produce } from 'immer';
import types from './types';

const INITIAL_STATE = {
  behavior: 'create',
  components: {
    confirmDelete: false,
    drawer: false,
    tab: 'dados-cadastrais',
  },
  form: {
    filtering: false,
    disabled: true,
    dirty: false,
    saving: false,
  },
  clientes: [],
  cliente: {
    email: '',
    nome: '',
    telefone: '',
    dataNascimento: '',
    sexo: 'M',
    documento: {
      tipo: 'cpf',
      numero: '',
    },
    endereco: {
      cidade: '',
      uf: '',
      cep: '',
      logradouro: '',
      numero: '',
      pais: 'BR',
    },
  },
};

const emptyCliente = INITIAL_STATE.cliente;

function cliente(state = INITIAL_STATE, action) {
  switch (action.type) {
    case types.UPDATE_CLIENTE:
      return produce(state, (draft) => {
        draft.clientes = action.clientes;
      });
    case types.UPDATE_BEHAVIOR:
      return produce(state, (draft) => {
        draft.behavior = action.behavior;
      });
    case types.UPDATE_SELECTED_CLIENTE:
      return produce(state, (draft) => {
        draft.cliente = {
          ...draft.cliente,
          ...action.cliente,
          documento: {
            ...emptyCliente.documento,
            ...draft.cliente.documento,
            ...action.cliente.documento,
          },
          endereco: {
            ...emptyCliente.endereco,
            ...draft.cliente.endereco,
            ...action.cliente.endereco,
          },
        };
      });
    case types.UPDATE_COMPONENTS:
      return produce(state, (draft) => {
        draft.components = { ...draft.components, ...action.components };
      });
    case types.UPDATE_FORM:
      return produce(state, (draft) => {
        draft.form = { ...draft.form, ...action.form };
      });
    default:
      return state;
  }
}

export default cliente;
