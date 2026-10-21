import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  TagPicker,
  Drawer,
  Modal,
  Checkbox,
  DatePicker,
  Button,
} from 'rsuite';
import 'rsuite/dist/rsuite.min.css';

import {
  allHorarios,
  addHorario,
  removeHorario,
  updateHorario,
  resetHorario,
  allServicos,
  filterColaboradores,
  saveHorario,
} from '../../store/modules/hoarario/actions';
import util from '../../services/util';
import { notification } from '../../services/rsuite';
import colors from '../../data/colors.json';

moment.locale('pt-br');
const localizer = momentLocalizer(moment);

const HorariosAtendimento = () => {
  const dispatch = useDispatch();
  const {
    horario,
    horarios,
    form,
    components,
    behavior,
    servicos,
    colaboradores,
  } = useSelector((state) => state.horario);

  const diasDaSemana = [
    'domingo',
    'segunda-feira',
    'terça-feira',
    'quarta-feira',
    'quinta-feira',
    'sexta-feira',
    'sábado',
  ];

  const diasSemanaData = [
    new Date(2026, 3, 11, 0, 0, 0, 0),
    new Date(2026, 3, 12, 0, 0, 0, 0),
    new Date(2026, 3, 13, 0, 0, 0, 0),
    new Date(2026, 3, 14, 0, 0, 0, 0),
    new Date(2026, 3, 15, 0, 0, 0, 0),
    new Date(2026, 3, 16, 0, 0, 0, 0),
    new Date(2026, 3, 17, 0, 0, 0, 0),
  ];

  const setHorario = (key, value) => {
    dispatch(
      updateHorario({
        horario: { ...horario, [key]: value },
      })
    );
  };

  const setEspecialidades = (especialidades) => {
    dispatch(
      updateHorario({
        horario: { ...horario, especialidades, colaboradores: [] },
      })
    );
  };

  const setComponents = (component, state) => {
    dispatch(
      updateHorario({
        components: { ...components, [component]: state },
      })
    );
  };

  const openCreateDrawer = () => {
    dispatch(resetHorario());
    dispatch(
      updateHorario({
        behavior: 'create',
        components: { ...components, drawer: true },
      })
    );
  };

  const onHorarioClick = (horario) => {
    dispatch(
      updateHorario({
        horario: {
          ...horario,
          inicio: horario.inicio ? new Date(horario.inicio) : '',
          fim: horario.fim ? new Date(horario.fim) : '',
        },
        behavior: 'update',
      })
    );
    setComponents('drawer', true);
  };

  const save = () => {
    if (
      !util.allFields(horario, [
        'dias',
        'inicio',
        'fim',
        'especialidades',
        'colaboradores',
      ])
    ) {
      notification('error', {
        placement: 'topStart',
        title: 'Calma lá!',
        description: 'Antes de prosseguir, preencha todos os campos!',
      });
      return false;
    }

    if (behavior === 'create') {
      dispatch(addHorario());
    } else {
      dispatch(saveHorario());
    }
  };

  const remove = () => {
    dispatch(removeHorario());
  };

  const formatEventos = () => {
    let listaEventos = [];

    horarios.forEach((hor, index) => {
      hor.dias.forEach((dia) => {
        const dataInicio = new Date(diasSemanaData[dia]);
        const dataFim = new Date(diasSemanaData[dia]);
        listaEventos.push({
          resource: {
            horario: hor,
            backgroundColor: colors[index % colors.length],
          },
          title: `${hor.especialidades.length} espec. e ${hor.colaboradores.length} colab. disponíveis`,
          start: new Date(
            dataInicio.setHours(
              parseInt(moment(hor.inicio).format('HH')),
              parseInt(moment(hor.inicio).format('mm'))
            )
          ),
          end: new Date(
            dataFim.setHours(
              parseInt(moment(hor.fim).format('HH')),
              parseInt(moment(hor.fim).format('mm'))
            )
          ),
        });
      });
    });

    return listaEventos;
  };

  useEffect(() => {
    dispatch(allHorarios());
    dispatch(allServicos());
  }, [dispatch]);

  useEffect(() => {
    if (horario.especialidades.length > 0) {
      dispatch(filterColaboradores());
    }
  }, [dispatch, horario.especialidades]);

  return (
    <div className="col p-5 overflow-auto h-100">
      <Drawer
        open={components.drawer}
        size="sm"
        onClose={() => setComponents('drawer', false)}
      >
        <Drawer.Body>
          <h3>Criar novo horario de atendimento</h3>
          <div className="row mt-3">
            <div className="col-12">
              <b>Dias da semana</b>
              <TagPicker
                size="lg"
                block
                value={horario.dias}
                data={diasDaSemana.map((label, value) => ({ label, value }))}
                onChange={(value) => {
                  setHorario('dias', value);
                }}
              />
              <Checkbox
                disabled={horario.dias.length === diasDaSemana.length}
                checked={horario.dias.length === diasDaSemana.length}
                onChange={(v, selected) => {
                  if (selected) {
                    setHorario(
                      'dias',
                      diasDaSemana.map((label, value) => value)
                    );
                  } else {
                    setHorario('dias', []);
                  }
                }}
              >
                <span>Selecionar Todos</span>
              </Checkbox>
            </div>
            <div className="col-6 mt-3">
              <b className="d-block">Horário Inicial</b>
              <DatePicker
                block
                format="HH:mm"
                hideMinutes={(min) => ![0, 30].includes(min)}
                value={horario.inicio}
                onChange={(e) => {
                  setHorario('inicio', e);
                }}
              />
            </div>
            <div className="col-6 mt-3">
              <b className="d-block">Horário Final</b>
              <DatePicker
                block
                format="HH:mm"
                hideMinutes={(min) => ![0, 30].includes(min)}
                value={horario.fim}
                onChange={(e) => {
                  setHorario('fim', e);
                }}
              />
            </div>
            <div className="col-12 mt-3">
              <b>Especialidades disponíveis</b>
              <TagPicker
                size="lg"
                block
                data={servicos}
                value={horario.especialidades}
                onChange={(e) => {
                  setEspecialidades(e);
                }}
              />
              <Checkbox
                disabled={horario.especialidades.length === servicos.length}
                checked={horario.especialidades.length === servicos.length}
                onChange={(v, selected) => {
                  if (selected) {
                    setEspecialidades(servicos.map((s) => s.value));
                  } else {
                    setEspecialidades([]);
                  }
                }}
              >
                <span>Selecionar Todas</span>
              </Checkbox>
            </div>
            <div className="col-12 mt-3">
              <b>Colaboradores disponíveis</b>
              <TagPicker
                size="lg"
                block
                data={colaboradores}
                disabled={horario.especialidades.length === 0}
                value={horario.colaboradores}
                onChange={(e) => {
                  setHorario('colaboradores', e);
                }}
              />
              <Checkbox
                disabled={horario.colaboradores.length === colaboradores.length}
                checked={horario.colaboradores.length === colaboradores.length}
                onChange={(v, selected) => {
                  if (selected) {
                    setHorario(
                      'colaboradores',
                      colaboradores.map((s) => s.value)
                    );
                  } else {
                    setHorario('colaboradores', []);
                  }
                }}
              >
                <span>Selecionar Todos</span>
              </Checkbox>
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
              {behavior === 'create'
                ? 'Salvar Horario de Atendimento'
                : 'Alterar Horario de Atendimento'}
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
              <span>Remover Horario de Atendimento</span>
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
            style={{
              color: '#ffb300',
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            !
          </span>
          <span> Tem certeza que deseja excluir? Essa acao sera irreversivel!</span>
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
            <h2 className="mb-4 mt-0">Horarios de Atendimento</h2>
            <div>
              <button
                onClick={openCreateDrawer}
                className="btn btn-primary btn-lg"
              >
                <span className="mdi mdi-plus"></span> Novo Horario
              </button>
            </div>
          </div>

          <Calendar
            localizer={localizer}
            onSelectEvent={(e) => {
              const { horario } = e.resource;
              onHorarioClick(horario);
            }}
            onSelectSlot={(slotInfo) => {
              const { start, end } = slotInfo;
              dispatch(
                updateHorario({
                  horario: {
                    ...horario,
                    dias: [moment(start).day()],
                    inicio: start,
                    fim: end,
                  },
                })
              );
              setComponents('drawer', true);
            }}
            formats={{
              dateFormat: 'dd',
              dayFormat: (date, culture, localizer) =>
                localizer.format(date, 'dddd', culture),
            }}
            events={formatEventos()}
            eventPropGetter={(event, start, end, isSelected) => {
              return {
                style: {
                  backgroundColor: event.resource.backgroundColor,
                  borderColor: event.resource.backgroundColor,
                },
              };
            }}
            date={diasSemanaData[moment().day()]}
            view={components.view}
            selectable={true}
            popup={true}
            toolbar={false}
            style={{ height: 600 }}
          />
        </div>
      </div>
    </div>
  );
};

export default HorariosAtendimento;
