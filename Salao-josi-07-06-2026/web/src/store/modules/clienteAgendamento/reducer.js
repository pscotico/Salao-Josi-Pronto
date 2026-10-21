import { produce } from 'immer';
import types from './types';
import consts from '../../../consts';

const emptyAgendamento = {
  salaoId: consts.salaoId,
  servicoId: null,
  colaboradorId: null,
  data: null,
  ...(consts.clienteId ? { clienteId: consts.clienteId } : {}),
};

const emptyCliente = {
  nome: '',
  telefone: '',
  email: '',
  dataNascimento: '',
  sexo: 'F',
  documento: {
    tipo: 'cpf',
    numero: '',
  },
  endereco: {
    pais: 'br',
    uf: '',
    cidade: '',
    cep: '',
    logradouro: '',
    numero: '',
  },
};

const INITIAL_STATE = {
  salao: {},
  servicos: [],
  agenda: [],
  colaboradores: [],
  agendamento: emptyAgendamento,
  cliente: emptyCliente,
  form: {
    inputFiltro: '',
    selectedStep: 'servicos',
    loadingSalao: false,
    loadingServicos: false,
    loadingAgenda: false,
    saving: false,
    modalEspecialista: false,
    successMessage: '',
    errorMessage: '',
  },
};

function clienteAgendamento(state = INITIAL_STATE, action) {
  switch (action.type) {
    case types.UPDATE_CLIENTE_AGENDAMENTO: {
      return produce(state, (draft) => {
        Object.assign(draft, action.payload);
      });
    }
    case types.UPDATE_AGENDAMENTO_PUBLICO: {
      return produce(state, (draft) => {
        draft.agendamento[action.key] = action.value;
        draft.form.successMessage = '';
        draft.form.errorMessage = '';

        if (action.key === 'servicoId') {
          draft.form.selectedStep = 'servicos';
        }
      });
    }
    case types.UPDATE_CLIENTE_PUBLICO: {
      return produce(state, (draft) => {
        const path = action.key.split('.');
        let current = draft.cliente;

        path.slice(0, -1).forEach((key) => {
          if (!current[key]) {
            current[key] = {};
          }

          current = current[key];
        });

        current[path[path.length - 1]] = action.value;
        draft.form.successMessage = '';
        draft.form.errorMessage = '';
      });
    }
    case types.UPDATE_FORM_PUBLICO: {
      return produce(state, (draft) => {
        draft.form[action.key] = action.value;
      });
    }
    case types.RESET_AGENDAMENTO_PUBLICO: {
      return produce(state, (draft) => {
        draft.agenda = [];
        draft.colaboradores = [];
        draft.agendamento = {
          ...emptyAgendamento,
          ...(consts.clienteId ? { clienteId: consts.clienteId } : {}),
        };
        if (action.fullReset) {
          draft.cliente = {
            ...emptyCliente,
            documento: { ...emptyCliente.documento },
            endereco: { ...emptyCliente.endereco },
          };
          draft.form.inputFiltro = '';
        }
        draft.form.selectedStep = 'servicos';
        draft.form.loadingAgenda = false;
        draft.form.saving = false;
        draft.form.modalEspecialista = false;
        draft.form.successMessage = '';
        draft.form.errorMessage = '';
      });
    }
    default:
      return state;
  }
}

export default clienteAgendamento;
