import { useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import 'moment/locale/pt-br';
import { useDispatch, useSelector } from 'react-redux';
import {
  allServicosPublicos,
  filterAgendaPublica,
  getSalaoPublico,
  resetAgendamentoPublico,
  saveAgendamentoPublico,
  updateAgendamentoPublico,
  updateClientePublico,
  updateFormPublico,
} from '../../store/modules/clienteAgendamento/actions';
import util from '../../util';
import './styles.css';

moment.locale('pt-br');

const onlyNumbers = (value) => String(value || '').replace(/\D/g, '');
const capaSalao = '/images/salao-capa.jpg';
const telefoneSalaoLink = 'tel:+553784183573';

const formatMoney = (value) =>
  Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

const getDuracaoMinutos = (duracao) => {
  const date = moment(duracao);

  if (!date.isValid()) {
    return 0;
  }

  return date.hour() * 60 + date.minute();
};

const formatDuracao = (duracao) => {
  const minutos = getDuracaoMinutos(duracao);

  if (!minutos) {
    return 'Duracao nao informada';
  }

  if (minutos < 60) {
    return `${minutos} min`;
  }

  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;

  return resto ? `${horas}h ${resto}min` : `${horas}h`;
};

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const getValidation = (cliente) => {
  const telefone = onlyNumbers(cliente.telefone);
  const documento = onlyNumbers(cliente.documento?.numero);

  if (!cliente.nome.trim()) {
    return 'Informe seu nome.';
  }

  if (telefone.length < 10) {
    return 'Informe um telefone valido.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.email)) {
    return 'Informe um e-mail valido.';
  }

  if (!cliente.dataNascimento) {
    return 'Informe sua data de nascimento.';
  }

  if (documento.length !== 11) {
    return 'Informe um CPF com 11 digitos.';
  }

  return '';
};

const copyText = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const input = document.createElement('textarea');
  input.value = text;
  input.setAttribute('readonly', '');
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
};

const ClienteAgendamento = () => {
  const dispatch = useDispatch();
  const [shareFeedback, setShareFeedback] = useState('');
  const { salao, servicos, agenda, colaboradores, agendamento, cliente, form } =
    useSelector((state) => state.clienteAgendamento);

  const servicoSelecionado = servicos.find((item) => item._id === agendamento.servicoId);
  const dataSelecionada = agendamento.data
    ? moment(agendamento.data).format('YYYY-MM-DD')
    : null;
  const horaSelecionada = agendamento.data
    ? moment(agendamento.data).format('HH:mm')
    : null;
  const { horariosDisponiveis, colaboradoresDia } = util.selectAgendamento(
    agenda,
    dataSelecionada,
    agendamento.colaboradorId
  );
  const colaboradorSelecionado = colaboradores.find(
    (item) => item._id === agendamento.colaboradorId
  );
  const erroValidacao = getValidation(cliente);
  const loadingInicial = form.loadingSalao || form.loadingServicos;
  const enderecoSalao =
    salao.site?.enderecoTexto ||
    [
      salao.endereco?.logradouro,
      salao.endereco?.numero,
      salao.endereco?.cidade,
      salao.endereco?.uf,
      salao.endereco?.cep,
    ]
      .filter(Boolean)
      .join(', ') ||
    'R. Camilo Bernardes, 126 - Formiga, MG, 35570-222';
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(enderecoSalao)}`;
  const capa = salao.capa || capaSalao;
  const logoSalao = salao.logo || salao.foto;
  const telefoneLink = salao.site?.telefoneLink || telefoneSalaoLink;
  const botaoPrincipalTexto = salao.site?.botaoPrincipalTexto || 'Agendar agora';
  const botaoLigarTexto = salao.site?.botaoLigarTexto || 'Ligar';
  const botaoLocalizacaoTexto = salao.site?.botaoLocalizacaoTexto || 'Localizacao';
  const botaoCompartilharTexto = salao.site?.botaoCompartilharTexto || 'Compartilhar';

  const servicosFiltrados = useMemo(() => {
    const filtro = form.inputFiltro.toLowerCase().trim();

    if (!filtro) {
      return servicos;
    }

    return servicos.filter((servico) => {
      const titulo = String(servico.titulo || '').toLowerCase().trim();
      return filtro.split(' ').every((word) => titulo.includes(word));
    });
  }, [form.inputFiltro, servicos]);

  const profissionaisDoServico = useMemo(() => {
    const ids = new Set();

    agenda.forEach((dia) => {
      const data = Object.keys(dia)[0];
      Object.keys(dia[data] || {}).forEach((id) => ids.add(id));
    });

    return colaboradores.filter((colaborador) => ids.has(colaborador._id));
  }, [agenda, colaboradores]);

  const podeConfirmar =
    agendamento.servicoId &&
    agendamento.colaboradorId &&
    agendamento.data &&
    !erroValidacao &&
    !form.saving;

  useEffect(() => {
    document.body.classList.add('cliente-public-page');
    dispatch(getSalaoPublico());
    dispatch(allServicosPublicos());

    return () => {
      document.body.classList.remove('cliente-public-page');
    };
  }, [dispatch]);

  const selecionarServico = (servicoId) => {
    dispatch(resetAgendamentoPublico());
    dispatch(updateAgendamentoPublico('servicoId', servicoId));
    dispatch(filterAgendaPublica());
  };

  const selecionarColaborador = (colaboradorId) => {
    const diaDisponivel = agenda.find((dia) => {
      const dateISO = Object.keys(dia)[0];
      return dia[dateISO]?.[colaboradorId]?.flat()?.length > 0;
    });

    if (!diaDisponivel) {
      return;
    }

    const dateISO = Object.keys(diaDisponivel)[0];
    const primeiroHorario = diaDisponivel[dateISO][colaboradorId].flat()[0];

    dispatch(updateAgendamentoPublico('colaboradorId', colaboradorId));
    dispatch(updateAgendamentoPublico('data', moment(`${dateISO}T${primeiroHorario}`).format()));
  };

  const selecionarData = (data) => {
    const agendaData = util.selectAgendamento(agenda, data, agendamento.colaboradorId);
    let colaboradorId = agendamento.colaboradorId;
    let primeiroHorario = agendaData.horariosDisponiveis?.[0]?.[0];

    if (!primeiroHorario) {
      colaboradorId = Object.keys(agendaData.colaboradoresDia || {})[0];
      primeiroHorario = agendaData.colaboradoresDia?.[colaboradorId]?.[0]?.[0];
    }

    if (!primeiroHorario || !colaboradorId) {
      return;
    }

    dispatch(updateAgendamentoPublico('colaboradorId', colaboradorId));
    dispatch(updateAgendamentoPublico('data', moment(`${data}T${primeiroHorario}`).format()));
  };

  const selecionarHora = (horario) => {
    if (!dataSelecionada) {
      return;
    }

    dispatch(updateAgendamentoPublico('data', moment(`${dataSelecionada}T${horario}`).format()));

    const especialistaAindaDisponivel = colaboradoresDia?.[
      agendamento.colaboradorId
    ]?.flat(2).includes(horario);

    if (!especialistaAindaDisponivel) {
      const proximoColaborador = Object.keys(colaboradoresDia).find((colaboradorId) =>
        colaboradoresDia[colaboradorId].flat(2).includes(horario)
      );
      dispatch(updateAgendamentoPublico('colaboradorId', proximoColaborador));
    }
  };

  const updateCliente = (key) => (event) => {
    const rawValue = event.target.value;
    const value = ['telefone', 'documento.numero'].includes(key)
      ? onlyNumbers(rawValue)
      : rawValue;

    dispatch(updateClientePublico(key, value));
  };

  const scrollToClienteSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const finalizarAgendamento = () => {
    if (podeConfirmar) {
      dispatch(saveAgendamentoPublico());
      return;
    }

    scrollToClienteSection('cliente-finalizar');
  };

  const novoAgendamento = () => {
    dispatch(resetAgendamentoPublico(true));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const compartilharSalao = async () => {
    const title = salao.nome || 'Salao Josi';
    const url = window.location.href;
    const text = `${title}\n${enderecoSalao}`;

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        setShareFeedback('Compartilhado');
      } else {
        await copyText(`${text}\n${url}`);
        setShareFeedback('Link copiado');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setShareFeedback('Nao foi possivel compartilhar');
      }
    }

    window.setTimeout(() => setShareFeedback(''), 2200);
  };

  return (
    <main className="cliente-agendamento">
      <section
        className="cliente-agendamento__hero"
        style={{
          backgroundImage: capa
            ? `linear-gradient(180deg, rgba(24, 18, 28, .18), rgba(18, 16, 20, .88)), url(${capa})`
            : undefined,
        }}
      >
        <div className="cliente-agendamento__hero-content">
          <span
            className={`cliente-agendamento__status ${
              salao.isOpened ? 'is-open' : 'is-closed'
            }`}
          >
            {salao.isOpened ? 'Aberto agora' : 'Fechado agora'}
          </span>
          {logoSalao && (
            <img
              className="cliente-agendamento__logo"
              src={logoSalao}
              alt={salao.nome || 'Salao Josi'}
            />
          )}
          <h1>{salao.nome || 'Salao Josi'}</h1>
          <p>
            {enderecoSalao}
          </p>
          <div className="cliente-agendamento__actions" aria-label="Acoes do salao">
            <button
              type="button"
              className="cliente-agendamento__hero-cta"
              onClick={() => scrollToClienteSection('cliente-servicos')}
              aria-label="Agendar agora"
            >
              <span className="mdi mdi-calendar-check" />
              <strong>{botaoPrincipalTexto}</strong>
            </button>

            <div className="cliente-agendamento__quick-actions">
              <a
                href={telefoneLink}
                aria-label="Ligar para o salao"
                onClick={() => {
                  setShareFeedback('Abrindo discador');
                  window.setTimeout(() => setShareFeedback(''), 1600);
                }}
              >
                <span className="mdi mdi-phone" />
                {botaoLigarTexto}
              </a>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Abrir localizacao no Google Maps"
              >
                <span className="mdi mdi-map-marker-radius" />
                {botaoLocalizacaoTexto}
              </a>
              <button
                type="button"
                onClick={compartilharSalao}
                aria-label="Compartilhar salao"
              >
                <span className="mdi mdi-share-variant" />
                {botaoCompartilharTexto}
              </button>
            </div>

            {shareFeedback && (
              <span className="cliente-agendamento__share-feedback" role="status">
                {shareFeedback}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="cliente-agendamento__content">
        {form.errorMessage && (
          <div className="cliente-agendamento__alert is-error">{form.errorMessage}</div>
        )}
        {form.successMessage && (
          <div className="cliente-agendamento__alert is-success">{form.successMessage}</div>
        )}

        <div className="cliente-agendamento__main">
          <div className="cliente-agendamento__services" id="cliente-servicos">
            <div className="cliente-agendamento__section-header">
              <div>
                <span className="cliente-agendamento__eyebrow">Escolha o atendimento</span>
                <h2>Servicos</h2>
                <small>
                  {loadingInicial
                    ? 'Carregando opcoes'
                    : `${servicosFiltrados.length} disponiveis`}
                </small>
              </div>
              <input
                type="search"
                value={form.inputFiltro}
                onChange={(event) =>
                  dispatch(updateFormPublico('inputFiltro', event.target.value))
                }
                placeholder="Buscar servico"
                aria-label="Buscar servico"
              />
            </div>

            {form.loadingServicos && (
              <div className="cliente-agendamento__skeleton-list">
                <span />
                <span />
                <span />
              </div>
            )}

            {!form.loadingServicos && servicosFiltrados.length === 0 && (
              <p className="cliente-agendamento__empty">
                Nenhum servico encontrado. Tente buscar por outro nome.
              </p>
            )}

            <div className="cliente-agendamento__service-list">
              {servicosFiltrados.map((servico) => {
                const selected = servico._id === agendamento.servicoId;
                const arquivo = servico.arquivos?.[0];
                const image = util.getArquivoUrl(arquivo);

                return (
                  <button
                    className={`cliente-agendamento__service ${
                      selected ? 'is-selected' : ''
                    }`}
                    key={servico._id}
                    type="button"
                    onClick={() => selecionarServico(servico._id)}
                  >
                    <span
                      className="cliente-agendamento__service-image"
                      style={{ backgroundImage: image ? `url(${image})` : undefined }}
                    >
                      {!image && <span className="mdi mdi-content-cut" />}
                    </span>
                    <span>
                      <strong>{servico.titulo}</strong>
                      <small>
                        {formatMoney(servico.preco)} - {formatDuracao(servico.duracao)}
                      </small>
                    </span>
                    <span className="cliente-agendamento__service-cta">
                      {selected ? 'Escolhido' : 'AGENDAR'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="cliente-agendamento__booking" id="cliente-finalizar">
            {form.selectedStep === 'confirmado' ? (
              <div className="cliente-agendamento__confirmed">
                <span className="mdi mdi-check-circle-outline" />
                <h2>Agendamento confirmado</h2>
                <p>
                  {servicoSelecionado?.titulo} em{' '}
                  {moment(agendamento.data).format('DD/MM/YYYY [as] HH:mm')}
                  {colaboradorSelecionado?.nome
                    ? ` com ${colaboradorSelecionado.nome}`
                    : ''}
                  .
                </p>
                <button type="button" onClick={novoAgendamento}>
                  Fazer outro agendamento
                </button>
              </div>
            ) : (
              <>
                <div className="cliente-agendamento__booking-title">
                  <span className="cliente-agendamento__eyebrow">Finalize sem espera</span>
                  <h2>Seu horario</h2>
                </div>

                {!servicoSelecionado && (
                  <p className="cliente-agendamento__empty">
                    Escolha um servico para ver profissionais, datas e horarios.
                  </p>
                )}

                {servicoSelecionado && (
                  <>
                    <div className="cliente-agendamento__resume">
                      <strong>{servicoSelecionado.titulo}</strong>
                      <span>
                        {formatMoney(servicoSelecionado.preco)} -{' '}
                        {formatDuracao(servicoSelecionado.duracao)}
                      </span>
                    </div>

                    {form.loadingAgenda && (
                      <div className="cliente-agendamento__loading">
                        <span className="mdi mdi-loading mdi-spin" />
                        Buscando horarios disponiveis
                      </div>
                    )}

                    {!form.loadingAgenda && agenda.length > 0 && (
                      <>
                        <h3>Profissional</h3>
                        <div className="cliente-agendamento__specialists">
                          {profissionaisDoServico.map((colaborador) => {
                            const foto = util.getArquivoUrl(colaborador.foto);

                            return (
                              <button
                                type="button"
                                key={colaborador._id}
                                className={
                                  colaborador._id === agendamento.colaboradorId
                                    ? 'is-selected'
                                    : ''
                                }
                                onClick={() => selecionarColaborador(colaborador._id)}
                              >
                                <span
                                  style={{
                                    backgroundImage: foto ? `url(${foto})` : undefined,
                                  }}
                                >
                                  {!foto && getInitials(colaborador.nome)}
                                </span>
                                {colaborador.nome}
                              </button>
                            );
                          })}
                        </div>

                        <h3>Data</h3>
                        <div className="cliente-agendamento__dates">
                          {agenda.map((item) => {
                            const dateISO = Object.keys(item)[0];
                            const date = moment(dateISO);
                            const selected = dateISO === dataSelecionada;

                            return (
                              <button
                                type="button"
                                key={dateISO}
                                className={selected ? 'is-selected' : ''}
                                onClick={() => selecionarData(dateISO)}
                              >
                                <small>{util.diasSemana[date.day()]}</small>
                                <strong>{date.format('DD')}</strong>
                                <small>{date.format('MMM')}</small>
                              </button>
                            );
                          })}
                        </div>

                        <h3>Horario</h3>
                        <div className="cliente-agendamento__times">
                          {horariosDisponiveis.flat().map((horario, index) => (
                            <button
                              type="button"
                              key={`${horario}-${index}`}
                              className={horario === horaSelecionada ? 'is-selected' : ''}
                              onClick={() => selecionarHora(horario)}
                            >
                              {horario}
                            </button>
                          ))}
                        </div>

                        <h3>Seus dados</h3>
                        <div className="cliente-agendamento__form">
                          <label>
                            Nome
                            <input
                              value={cliente.nome}
                              onChange={updateCliente('nome')}
                              placeholder="Seu nome completo"
                              autoComplete="name"
                            />
                          </label>
                          <label>
                            Telefone
                            <input
                              value={cliente.telefone}
                              onChange={updateCliente('telefone')}
                              placeholder="DDD + telefone"
                              inputMode="numeric"
                              autoComplete="tel"
                            />
                          </label>
                          <label>
                            E-mail
                            <input
                              value={cliente.email}
                              onChange={updateCliente('email')}
                              placeholder="voce@email.com"
                              type="email"
                              autoComplete="email"
                            />
                          </label>
                          <label>
                            Nascimento
                            <input
                              value={cliente.dataNascimento}
                              onChange={updateCliente('dataNascimento')}
                              type="date"
                              autoComplete="bday"
                            />
                          </label>
                          <label>
                            Sexo
                            <select value={cliente.sexo} onChange={updateCliente('sexo')}>
                              <option value="F">Feminino</option>
                              <option value="M">Masculino</option>
                            </select>
                          </label>
                          <label>
                            CPF
                            <input
                              value={cliente.documento.numero}
                              onChange={updateCliente('documento.numero')}
                              placeholder="Somente numeros"
                              inputMode="numeric"
                            />
                          </label>
                        </div>

                        {erroValidacao && (
                          <p className="cliente-agendamento__validation">
                            {erroValidacao}
                          </p>
                        )}

                        <div className="cliente-agendamento__summary">
                          <span>
                            {moment(agendamento.data).format('DD/MM/YYYY [as] HH:mm')}
                          </span>
                          <span>{colaboradorSelecionado?.nome || 'Profissional'}</span>
                        </div>

                        <button
                          type="button"
                          className="cliente-agendamento__confirm"
                          disabled={!podeConfirmar}
                          onClick={() => dispatch(saveAgendamentoPublico())}
                        >
                          {form.saving ? (
                            <>
                              <span className="mdi mdi-loading mdi-spin" />
                              Confirmando
                            </>
                          ) : (
                            'Confirmar meu agendamento'
                          )}
                        </button>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </aside>
        </div>
      </section>

      {servicoSelecionado && form.selectedStep !== 'confirmado' && (
        <div className="cliente-agendamento__bottom-bar">
          <div>
            <strong>{servicoSelecionado.titulo}</strong>
            <span>
              {agendamento.data
                ? `${moment(agendamento.data).format('DD/MM [as] HH:mm')} - ${
                    colaboradorSelecionado?.nome || 'Escolha o profissional'
                  }`
                : 'Escolha profissional, data e horario'}
            </span>
          </div>
          <button type="button" onClick={finalizarAgendamento} disabled={form.saving}>
            {form.saving ? 'Confirmando...' : 'Finalizar Agendamento'}
          </button>
        </div>
      )}
    </main>
  );
};

export default ClienteAgendamento;
