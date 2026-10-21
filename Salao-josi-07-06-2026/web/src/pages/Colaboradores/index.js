import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  filterColaborador,
  updateColaborador,
  addColaborador,
  resetColaborador,
  allColaboradores,
  unlinkColaborador,
  allServicos,
  saveColaborador,
} from '../../store/modules/colaborador/actions';
import util from '../../services/util';
import bancos from '../../data/bancos.json';

import {
  Message,
  Drawer,
  Checkbox,
  TagPicker,
  SelectPicker,
  Button,
  Tag,
  Modal,
} from 'rsuite';
import 'rsuite/dist/rsuite.min.css';

import Table from '../../components/Table';

const Colaboradores = () => {
  const dispatch = useDispatch();
  const { colaborador, colaboradores, servicos, form, components, behavior } =
    useSelector((state) => state.colaborador);
  const emptyContaBancaria = {
    titular: '',
    cpfCnpj: '',
    banco: '',
    tipo: 'conta_corrente',
    agencia: '',
    numero: '',
    dv: '',
  };

  const setColaborador = (key, value) => {
    dispatch(
      updateColaborador({
        colaborador: { ...colaborador, [key]: value },
      })
    );
  };

  const setContaBancaria = (key, value) => {
    dispatch(
      updateColaborador({
        colaborador: {
          ...colaborador,
          contaBancaria: { ...colaborador.contaBancaria, [key]: value },
        },
      })
    );
  };

  const setComponents = (component, state) => {
    dispatch(
      updateColaborador({
        components: { ...components, [component]: state },
      })
    );
  };

  const onRowClick = (colaborador) => {
    dispatch(
      updateColaborador({
        colaborador: {
          ...colaborador,
          contaBancaria: {
            ...emptyContaBancaria,
            ...colaborador.contaBancaria,
          },
          especialidades:
            colaborador.especialidades?.map((e) => e.servicoId) || [],
        },
        behavior: 'update',
        form: { ...form, disabled: false },
      })
    );
    setComponents('drawer', true);
  };

  const save = () => {
    if (
      !util.allFields(colaborador, [
        'email',
        'nome',
        'telefone',
        'dataNascimento',
        'sexo',
        'vinculo',
        'especialidades',
      ]) ||
      !util.allFields(colaborador.contaBancaria, [
        'titular',
        'cpfCnpj',
        'banco',
        'tipo',
        'agencia',
        'numero',
      ])
    ) {
      alert('Antes de prosseguir, preencha todos os campos!');
      return false;
    }

    if (behavior === 'create') {
      dispatch(addColaborador());
    } else {
      dispatch(saveColaborador());
    }
  };

  const remove = () => {
    dispatch(unlinkColaborador());
  };

  useEffect(() => {
    dispatch(allColaboradores());
    dispatch(allServicos());
  }, [dispatch]);

  return (
    <div className="col p-5 overflow-auto h-100" translate="no">
      <Drawer
        open={components.drawer}
        size="sm"
        onClose={() => setComponents('drawer', false)}
      >
        <Drawer.Body>
          <h3>
            <span>
              {behavior === 'create'
                ? 'Criar novo colaborador'
                : 'Alterar colaborador'}
            </span>
          </h3>

          <div className="row mt-3">
            <div className="form-group col-12">
              <b className="">E-mail</b>
              <div className="input-group mb-3">
                <input
                  disabled={form.disabled && behavior === 'create'}
                  type="email"
                  className="form-control"
                  placeholder="E-mail do Colaborador"
                  value={colaborador.email}
                  onChange={(e) => setColaborador('email', e.target.value)}
                />
                {behavior === 'create' && (
                  <div className="input-group-append">
                    <Button
                      appearance="primary"
                      loading={form.filtering}
                      disabled={form.filtering || !colaborador.email}
                      onClick={() => {
                        dispatch(
                          filterColaborador({
                            email: colaborador.email,
                            status: 'A',
                          })
                        );
                      }}
                    >
                      <span>Pesquisar</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="form-group col-6">
              <b className="">Nome</b>
              <input
                type="text"
                className="form-control"
                placeholder="Nome do Colaborador"
                disabled={form.disabled}
                value={colaborador.nome}
                onChange={(e) => setColaborador('nome', e.target.value)}
              />
            </div>
            <div className="form-group col-6">
              <b className="">Status</b>
              <select
                className="form-control"
                disabled={form.disabled && behavior === 'create'}
                value={colaborador.vinculo}
                onChange={(e) => setColaborador('vinculo', e.target.value)}
              >
                <option value="A">Ativo</option>
                <option value="I">Inativo</option>
              </select>
            </div>
            <div className="form-group col-4">
              <b className="">Telefone / Whatsapp</b>
              <input
                type="text"
                className="form-control"
                placeholder="Telefone / Whatsapp do Cliente"
                disabled={form.disabled}
                value={colaborador.telefone}
                onChange={(e) => setColaborador('telefone', e.target.value)}
              />
            </div>
            <div className="form-group col-4">
              <b className="">Data de Nascimento</b>
              <input
                type="date"
                className="form-control"
                placeholder="Data de Nascimento do cliente"
                disabled={form.disabled}
                value={colaborador.dataNascimento}
                onChange={(e) =>
                  setColaborador('dataNascimento', e.target.value)
                }
              />
            </div>
            <div className="form-group col-4">
              <b className="">Sexo</b>
              <select
                className="form-control"
                disabled={form.disabled}
                value={colaborador.sexo}
                onChange={(e) => setColaborador('sexo', e.target.value)}
              >
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>

            <div className="col-12">
              <b>Especialidades</b>
              <TagPicker
                size="lg"
                block
                data={servicos}
                disabled={form.disabled && behavior === 'create'}
                value={colaborador.especialidades}
                onChange={(value) => setColaborador('especialidades', value)}
              />
              <Checkbox
                checked={colaborador.especialidades?.length === servicos.length}
                disabled={
                  (form.disabled && behavior === 'create') ||
                  colaborador.especialidades?.length === servicos.length
                }
                onChange={(v, checked) => {
                  if (checked) {
                    setColaborador(
                      'especialidades',
                      servicos.map((s) => s.value)
                    );
                  } else {
                    setColaborador('especialidades', []);
                  }
                }}
              >
                {' '}
                Selecionar Todas
              </Checkbox>
            </div>
          </div>
          <Message showIcon className="my-4" type="info">
            Preencha corretamente as informacoes bancarias do colaborador.
          </Message>
          <div className="row">
            <div className="form-group col-6">
              <b className="">Titular da conta</b>
              <input
                type="text"
                className="form-control"
                placeholder="Nome do titular da conta"
                disabled={form.disabled}
                value={colaborador.contaBancaria.titular}
                onChange={(e) => setContaBancaria('titular', e.target.value)}
              />
            </div>
            <div className="form-group col-6">
              <b className="">CPF/CNPJ</b>
              <input
                type="text"
                className="form-control"
                placeholder="CPF/CNPJ do titular"
                disabled={form.disabled}
                value={colaborador.contaBancaria.cpfCnpj}
                onChange={(e) => setContaBancaria('cpfCnpj', e.target.value)}
              />
            </div>
            <div className="form-group col-6">
              <b className="">Banco</b>
              <SelectPicker
                disabled={form.disabled}
                value={colaborador.contaBancaria.banco}
                onChange={(value) => setContaBancaria('banco', value)}
                data={bancos}
                block
                size="lg"
              />
            </div>
            <div className="form-group col-6">
              <b className="">Tipo de Conta</b>
              <select
                className="form-control"
                disabled={form.disabled}
                value={colaborador.contaBancaria.tipo}
                onChange={(e) => setContaBancaria('tipo', e.target.value)}
              >
                <option value="conta_corrente">Conta Corrente</option>
                <option value="conta_poupanca">Conta Poupança</option>
              </select>
            </div>
            <div className="form-group col-6">
              <b className="">Agência</b>
              <input
                type="text"
                className="form-control"
                placeholder="Agência"
                disabled={form.disabled}
                value={colaborador.contaBancaria.agencia}
                onChange={(e) => setContaBancaria('agencia', e.target.value)}
              />
            </div>
            <div className="form-group col-4">
              <b className="">Número da Conta</b>
              <input
                type="text"
                className="form-control"
                placeholder="Número da Conta"
                disabled={form.disabled}
                value={colaborador.contaBancaria.numero}
                onChange={(e) => setContaBancaria('numero', e.target.value)}
              />
            </div>
            <div className="form-group col-2">
              <b className="">Dígito</b>
              <input
                type="text"
                className="form-control"
                placeholder="DV"
                disabled={form.disabled}
                value={colaborador.contaBancaria.dv}
                onChange={(e) => setContaBancaria('dv', e.target.value)}
              />
            </div>
          </div>
          <Button
            loading={form.saving}
            appearance="primary"
            color={behavior === 'create' ? 'green' : 'blue'}
            size="lg"
            block
            onClick={() => save()}
            className="mt-3"
          >
            <span>
              {behavior === 'create'
                ? 'Salvar Colaborador'
                : 'Alterar Colaborador'}
            </span>
          </Button>
          {behavior === 'update' && (
            <Button
              loading={form.saving}
              appearance="primary"
              color="red"
              size="lg"
              block
              onClick={() => setComponents('confirmDelete', true)}
              className="mt-1"
            >
              <span>Remover Colaborador</span>
            </Button>
          )}
        </Drawer.Body>
      </Drawer>

      <Modal
        open={components.confirmDelete}
        onClose={() => setComponents('confirmDelete', false)}
        size="xs"
      >
        <Modal.Body>
          <span
            className="mdi mdi-alert-circle"
            style={{
              color: '#ffb300',
              fontSize: 24,
            }}
          />
          {'  '} Tem certeza que deseja excluir? Essa ação será irreversível!
        </Modal.Body>
        <Modal.Footer>
          <Button
            loading={form.saving}
            appearance="primary"
            onClick={() => remove()}
            color="red"
          >
            <span>Sim, tenho certeza!</span>
          </Button>
          <Button
            onClick={() => setComponents('confirmDelete', false)}
            appearance="subtle"
          >
            <span>Cancelar</span>
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="row">
        <div className="col-12">
          <div className="w-100 d-flex justify-content-between">
            <h2 className="mb-4 mt-0">Colaboradores</h2>
            <div>
              <button
                onClick={() => {
                  dispatch(resetColaborador());
                  dispatch(
                    updateColaborador({
                      behavior: 'create',
                      components: {
                        ...components,
                        tab: 'dados-cadastrais',
                        drawer: true,
                      },
                    })
                  );
                }}
                className="btn btn-primary btn-lg"
              >
                <span className="mdi mdi-plus"></span> <span>Novo Colaborador</span>
              </button>
            </div>
          </div>

          <Table
            data={colaboradores}
            loading={form.filtering}
            config={[
              {
                label: 'Nome',
                key: 'nome',
                sortable: true,
                fixed: true,
                width: 200,
              },
              {
                label: 'E-mail',
                key: 'email',
                sortable: true,
                width: 200,
              },
              {
                label: 'Telefone / Whatsapp',
                key: 'telefone',
                sortable: true,
                width: 200,
              },
              {
                label: 'Especialidades',
                key: 'especialidades',
                content: (item) => item.especialidades?.length || 0,
                sortable: true,
              },
              {
                label: 'Status',
                key: 'vinculo',
                content: (item) => (
                  <Tag color={item.vinculo === 'A' ? 'green' : 'red'}>
                    {item.vinculo === 'A' ? 'Ativo' : 'Inativo'}
                  </Tag>
                ),
                sortable: true,
              },
              {
                label: 'Data de cadastro',
                key: 'dataCadastro',
                sortable: true,
                width: 200,
              },
            ]}
            actions={(item) => (
              <Button
                color="blue"
                size="xs"
              >
                <span>Ver informações</span>
              </Button>
            )}
            onRowClick={(c) => onRowClick(c)}
          />
        </div>
      </div>
    </div>
  );
};

export default Colaboradores;
