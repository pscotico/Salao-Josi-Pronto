import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';

import {
  updateServico,
  addServico,
  saveServico,
  allServicos,
  removeArquivo,
  resetServico,
  removeServico,
} from '../../store/modules/servico/actions';
import util from '../../services/util';
import { notification } from '../../services/rsuite';

import { DatePicker, Drawer, Uploader, Button, Tag, Modal } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';

import Table from '../../components/Table';

const requiredFields = [
  'titulo',
  'preco',
  'comissao',
  'duracao',
  'descricao',
  'status',
];

const normalizeServico = (servico) => ({
  ...servico,
  arquivos: servico.arquivos || [],
  duracao: servico.duracao ? new Date(servico.duracao) : null,
});

const ServicosProdutos = () => {
  const dispatch = useDispatch();
  const { servico, servicos, form, components, behavior } = useSelector(
    (state) => state.servico
  );

  const setServico = (key, value) => {
    dispatch(
      updateServico({
        servico: { ...servico, [key]: value },
      })
    );
  };

  const setComponents = (component, state) => {
    dispatch(
      updateServico({
        components: { ...components, [component]: state },
      })
    );
  };

  const openCreateDrawer = () => {
    dispatch(resetServico());
    dispatch(
      updateServico({
        behavior: 'create',
        components: { ...components, drawer: true },
      })
    );
  };

  const edit = (selectedServico) => {
    dispatch(
      updateServico({
        servico: normalizeServico(selectedServico),
        behavior: 'update',
      })
    );

    setComponents('drawer', true);
  };

  const save = () => {
    if (!util.allFields(servico, requiredFields)) {
      notification('error', {
        placement: 'topStart',
        title: 'Calma la!',
        description: 'Antes de prosseguir, preencha todos os campos!',
      });
      return false;
    }

    if (behavior === 'create') {
      dispatch(addServico());
    } else {
      dispatch(saveServico());
    }
  };

  const remove = () => {
    dispatch(removeServico());
  };

  useEffect(() => {
    dispatch(allServicos());
  }, [dispatch]);

  return (
    <div className="col p-5 overflow-auto h-100">
      <Drawer
        open={components.drawer}
        size="sm"
        onClose={() => setComponents('drawer', false)}
      >
        <Drawer.Body>
          <h3>{behavior === 'create' ? 'Criar novo' : 'Alterar'} servico</h3>

          <div className="row mt-3">
            <div className="form-group col-6">
              <b>Titulo</b>
              <input
                type="text"
                className="form-control"
                placeholder="Titulo do servico"
                value={servico.titulo}
                onChange={(e) => setServico('titulo', e.target.value)}
              />
            </div>

            <div className="form-group col-3">
              <b>R$ Preco</b>
              <input
                type="number"
                className="form-control"
                placeholder="Preco"
                value={servico.preco}
                onChange={(e) => setServico('preco', e.target.value)}
              />
            </div>

            <div className="form-group col-3">
              <b>Recorr. (dias)</b>
              <input
                type="number"
                className="form-control"
                placeholder="Recorrencia"
                value={servico.recorrencia}
                onChange={(e) => setServico('recorrencia', e.target.value)}
              />
            </div>

            <div className="form-group col-4">
              <b>% Comissao</b>
              <input
                type="number"
                className="form-control"
                placeholder="Comissao"
                value={servico.comissao}
                onChange={(e) => setServico('comissao', e.target.value)}
              />
            </div>

            <div className="form-group col-4">
              <b className="d-block">Duracao</b>
              <DatePicker
                block
                format="HH:mm"
                value={servico.duracao}
                hideMinutes={(min) => ![0, 30].includes(min)}
                onChange={(value) => setServico('duracao', value)}
              />
            </div>

            <div className="form-group col-4">
              <b>Status</b>
              <select
                className="form-control"
                value={servico.status}
                onChange={(e) => setServico('status', e.target.value)}
              >
                <option value="A">Ativo</option>
                <option value="I">Inativo</option>
              </select>
            </div>

            <div className="form-group col-12">
              <b>Descricao</b>
              <textarea
                rows="5"
                className="form-control"
                placeholder="Descricao do servico..."
                value={servico.descricao}
                onChange={(e) => setServico('descricao', e.target.value)}
              />
            </div>

            <div className="form-group col-12">
              <b className="d-block">Imagens do servico</b>
              <Uploader
                multiple
                autoUpload={false}
                listType="picture"
                defaultFileList={(servico.arquivos || [])
                  .filter((arquivo) => arquivo?.caminho)
                  .map((arquivo, i) => ({
                    name: arquivo.caminho,
                    fileKey: i,
                    url: `${util.AWS.bucketURL}/${arquivo.caminho}`,
                  }))}
                onChange={(files) => {
                  const arquivos = files
                    .map((file) => {
                      if (file.blobFile) {
                        return file.blobFile;
                      }

                      if (file.name) {
                        return { caminho: file.name };
                      }

                      return null;
                    })
                    .filter(Boolean);

                  setServico('arquivos', arquivos);
                }}
                onRemove={(file) => {
                  if (behavior === 'update' && file.url) {
                    dispatch(removeArquivo(file.name));
                  }
                }}
              >
                <button>
                  <span className="mdi mdi-camera"></span>
                </button>
              </Uploader>
            </div>
          </div>

          <Button
            loading={form.saving}
            appearance="primary"
            color={behavior === 'create' ? 'green' : 'blue'}
            size="lg"
            block
            onClick={save}
            className="mt-3"
          >
            <span>
              {behavior === 'create' ? 'Salvar Servico' : 'Alterar Servico'}
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
              <span>Remover Servico</span>
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
            style={{ color: '#ffb300', fontSize: 24 }}
          />
          {'  '} Tem certeza que deseja excluir? Essa acao sera irreversivel!
        </Modal.Body>
        <Modal.Footer>
          <Button
            loading={form.saving}
            appearance="primary"
            onClick={remove}
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
            <h2 className="mb-4 mt-0">Servicos e Produtos</h2>
            <div>
              <button onClick={openCreateDrawer} className="btn btn-primary btn-lg">
                <span className="mdi mdi-plus"></span> Novo Servico
              </button>
            </div>
          </div>

          <Table
            data={servicos}
            loading={form.filtering}
            config={[
              {
                label: 'Titulo',
                key: 'titulo',
                sortable: true,
                fixed: true,
                width: 200,
              },
              {
                label: 'R$ Preco',
                key: 'preco',
                content: (item) =>
                  item.preco ? `R$ ${Number(item.preco).toFixed(2)}` : '',
                sortable: true,
              },
              {
                label: '% Comissao',
                key: 'comissao',
                content: (item) =>
                  item.comissao || item.comissao === 0
                    ? `${item.comissao}%`
                    : '',
                sortable: true,
              },
              {
                label: 'Recorrencia (dias)',
                key: 'recorrencia',
                content: (item) =>
                  item.recorrencia ? `${item.recorrencia} dias` : '',
                sortable: true,
              },
              {
                label: 'Duracao',
                key: 'duracao',
                sortable: true,
                content: (item) =>
                  item.duracao ? moment(item.duracao).format('HH:mm') : '',
              },
              {
                label: 'Status',
                key: 'status',
                content: (item) => (
                  <Tag color={item.status === 'A' ? 'green' : 'red'}>
                    {item.status === 'A' ? 'Ativo' : 'Inativo'}
                  </Tag>
                ),
                sortable: true,
              },
              {
                label: 'Data de cadastro',
                key: 'dataCadastro',
                content: (item) =>
                  item.dataCadastro
                    ? moment(item.dataCadastro).format('DD/MM/YYYY')
                    : '',
                sortable: true,
                width: 200,
              },
            ]}
            actions={(item) => (
              <Button
                color="blue"
                appearance="primary"
                size="xs"
                onClick={() => edit(item)}
              >
                <span>Ver informacoes</span>
              </Button>
            )}
            onRowClick={(item) => edit(item)}
          />
        </div>
      </div>
    </div>
  );
};

export default ServicosProdutos;
