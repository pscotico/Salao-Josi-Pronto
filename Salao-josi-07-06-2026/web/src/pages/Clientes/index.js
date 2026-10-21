import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { Button, Drawer, Message, Modal, Tag } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';

import Table from '../../components/Table';
import {
  allClientes,
  editCliente,
  filterClientes,
  removeCliente,
  saveCliente,
  updateBehavior,
  updateComponents,
  updateForm,
  updateSelectedCliente,
} from '../../store/modules/cliente/actions';

const emptyCliente = {
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
};

const requiredFields = [
  'email',
  'nome',
  'telefone',
  'dataNascimento',
  'sexo',
];

const Clientes = () => {
  const dispatch = useDispatch();
  const { cliente, clientes, form, components, behavior } = useSelector(
    (state) => state.cliente
  );

  const setCliente = (key, value) => {
    dispatch(updateSelectedCliente({ [key]: value }));
    if (behavior !== 'create') {
      dispatch(updateForm({ dirty: true }));
    }
  };

  const setComponents = (component, state) => {
    dispatch(updateComponents({ [component]: state }));
  };

  const onRowClick = (selectedCliente) => {
    dispatch(updateSelectedCliente(selectedCliente));
    dispatch(updateBehavior('update'));
    dispatch(updateForm({ disabled: false, dirty: false }));
    setComponents('drawer', true);
  };

  const openCreateDrawer = () => {
    dispatch(updateSelectedCliente(emptyCliente));
    dispatch(updateBehavior('create'));
    dispatch(updateForm({ disabled: false, dirty: false }));
    setComponents('drawer', true);
  };

  const search = () => {
    dispatch(filterClientes({ email: cliente.email, status: 'A' }));
  };

  const save = () => {
    const hasEmptyField = requiredFields.some((field) => !cliente[field]);

    if (hasEmptyField || !cliente.documento?.numero) {
      alert('Antes de prosseguir, preencha todos os campos obrigatórios.');
      return;
    }

    dispatch(saveCliente());
  };

  const remove = () => {
    dispatch(removeCliente());
  };

  const edit = () => {
    dispatch(editCliente());
  };

  useEffect(() => {
    dispatch(allClientes());
  }, [dispatch]);

  return (
    <div className="col p-5 overflow-auto h-100">
      <Drawer
        open={components.drawer}
        size="sm"
        onClose={() => setComponents('drawer', false)}
      >
        <Drawer.Body>
          <h3>{behavior === 'create' ? 'Criar novo' : 'Atualizar'} cliente</h3>
          <div className="row mt-3">
            {behavior !== 'create' && (
              <div className="col-12 my-3">
                <Message showIcon type="info">
                  Os dados cadastrais podem ser atualizados pela web.
                </Message>
              </div>
            )}

            <div className="form-group col-12">
              <b>E-mail</b>
              <div className="input-group mb-3">
                <input
                  type="email"
                  className="form-control"
                  placeholder="E-mail do cliente"
                  disabled={form.saving}
                  value={cliente.email}
                  onChange={(e) => setCliente('email', e.target.value)}
                />
                {behavior === 'create' && (
                  <div className="input-group-append">
                    <Button
                      appearance="primary"
                      loading={form.filtering}
                      disabled={form.filtering}
                      onClick={search}
                    >
                      Pesquisar
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group col-6">
              <b>Nome</b>
              <input
                type="text"
                className="form-control"
                placeholder="Nome do cliente"
                disabled={form.disabled}
                value={cliente.nome}
                onChange={(e) => setCliente('nome', e.target.value)}
              />
            </div>

            <div className="form-group col-6">
              <b>Telefone / Whatsapp</b>
              <input
                type="text"
                className="form-control"
                placeholder="+5511999999999"
                disabled={form.disabled}
                value={cliente.telefone}
                onChange={(e) => setCliente('telefone', e.target.value)}
              />
            </div>

            <div className="form-group col-6">
              <b>Data de nascimento</b>
              <input
                type="date"
                className="form-control"
                disabled={form.disabled}
                value={cliente.dataNascimento}
                onChange={(e) => setCliente('dataNascimento', e.target.value)}
              />
            </div>

            <div className="form-group col-6">
              <b>Sexo</b>
              <select
                disabled={form.disabled}
                className="form-control"
                value={cliente.sexo}
                onChange={(e) => setCliente('sexo', e.target.value)}
              >
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>

            <div className="form-group col-6">
              <b>Tipo de documento</b>
              <select
                disabled={form.disabled}
                className="form-control"
                value={cliente.documento?.tipo || 'cpf'}
                onChange={(e) =>
                  setCliente('documento', {
                    ...cliente.documento,
                    tipo: e.target.value,
                  })
                }
              >
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
              </select>
            </div>

            <div className="form-group col-6">
              <b>Número do documento</b>
              <input
                type="text"
                className="form-control"
                disabled={form.disabled}
                value={cliente.documento?.numero || ''}
                onChange={(e) =>
                  setCliente('documento', {
                    ...cliente.documento,
                    tipo: cliente.documento?.tipo || 'cpf',
                    numero: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group col-3">
              <b>CEP</b>
              <input
                type="text"
                className="form-control"
                placeholder="Digite o CEP"
                disabled={form.disabled}
                value={cliente.endereco?.cep || ''}
                onChange={(e) =>
                  setCliente('endereco', {
                    ...cliente.endereco,
                    cep: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group col-6">
              <b>Rua / Logradouro</b>
              <input
                type="text"
                className="form-control"
                placeholder="Rua / Logradouro"
                disabled={form.disabled}
                value={cliente.endereco?.logradouro || ''}
                onChange={(e) =>
                  setCliente('endereco', {
                    ...cliente.endereco,
                    logradouro: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group col-3">
              <b>Número</b>
              <input
                type="text"
                className="form-control"
                placeholder="Número"
                disabled={form.disabled}
                value={cliente.endereco?.numero || ''}
                onChange={(e) =>
                  setCliente('endereco', {
                    ...cliente.endereco,
                    numero: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group col-3">
              <b>UF</b>
              <input
                type="text"
                className="form-control"
                placeholder="UF"
                disabled={form.disabled}
                value={cliente.endereco?.uf || ''}
                onChange={(e) =>
                  setCliente('endereco', {
                    ...cliente.endereco,
                    uf: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group col-9">
              <b>Cidade</b>
              <input
                type="text"
                className="form-control"
                placeholder="Cidade"
                disabled={form.disabled}
                value={cliente.endereco?.cidade || ''}
                onChange={(e) =>
                  setCliente('endereco', {
                    ...cliente.endereco,
                    cidade: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <Button
            block
            className="btn-lg mt-3"
            color={behavior === 'create' || form.dirty ? 'green' : 'red'}
            appearance="primary"
            size="lg"
            loading={form.saving}
            onClick={() => {
              if (behavior === 'create') {
                save();
              } else if (form.dirty) {
                edit();
              } else {
                setComponents('confirmDelete', true);
              }
            }}
          >
            {behavior === 'create'
              ? 'Salvar'
              : form.dirty
                ? 'Alterar'
                : 'Remover'} cliente
          </Button>
        </Drawer.Body>
      </Drawer>

      <Modal
        open={components.confirmDelete}
        onClose={() => setComponents('confirmDelete', false)}
        size="xs"
      >
        <Modal.Body>
          Tem certeza que deseja excluir? Essa ação será irreversível!
        </Modal.Body>
        <Modal.Footer>
          <Button loading={form.saving} onClick={remove} color="red">
            Sim, tenho certeza!
          </Button>
          <Button
            onClick={() => setComponents('confirmDelete', false)}
            appearance="subtle"
          >
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="row">
        <div className="col-12">
          <div className="w-100 d-flex justify-content-between">
            <h2 className="mb-4 mt-0">Clientes</h2>
            <div>
              <button onClick={openCreateDrawer} className="btn btn-primary btn-lg">
                <span className="mdi mdi-plus"></span> Novo Cliente
              </button>
            </div>
          </div>

          <Table
            data={clientes}
            loading={form.filtering}
            config={[
              {
                label: 'Nome',
                key: 'nome',
                fixed: true,
                width: 200,
              },
              {
                label: 'E-mail',
                key: 'email',
                width: 200,
              },
              {
                label: 'Telefone / Whatsapp',
                key: 'telefone',
                width: 200,
              },
              {
                label: 'Sexo',
                key: 'sexo',
                content: (item) => (
                  <Tag color={item.sexo === 'M' ? 'blue' : 'violet'}>
                    {item.sexo === 'M' ? 'Masculino' : 'Feminino'}
                  </Tag>
                ),
                width: 160,
              },
              {
                label: 'Data de cadastro',
                key: 'dataCadastro',
                content: (item) =>
                  item.dataCadastro
                    ? moment(item.dataCadastro).format('DD/MM/YYYY')
                    : '',
                width: 200,
              },
            ]}
            actions={() => (
              <Button color="blue" appearance="primary" size="xs">
                Ver informações
              </Button>
            )}
            onRowClick={(item) => onRowClick(item)}
          />
        </div>
      </div>
    </div>
  );
};

export default Clientes;

