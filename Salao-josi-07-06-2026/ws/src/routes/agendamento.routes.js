const express = require('express');
const router = express.Router();
const Horario = require('../models/horario');
const Agendamento = require('../models/agendamento');
const Cliente = require('../models/cliente');
const Salao = require('../models/salao');
const Servico = require('../models/servico');
const Colaborador = require('../models/colaborador');
const SalaoCliente = require('../models/relationship/salaoCliente');
const moment = require('moment');
const mongoose = require('mongoose');
const _ = require('lodash');

const pagarme = require('../services/pagarme');
const keys = require('../data/keys.json');
const util = require('../services/util');

const getDuracaoEmMinutos = (duracao) => {
  if (duracao === undefined || duracao === null) {
    return 0;
  }

  if (typeof duracao === 'number') {
    return duracao;
  }

  if (typeof duracao === 'string' && /^\d+$/.test(duracao)) {
    return Number(duracao);
  }

  const duracaoMoment = moment(duracao);

  if (!duracaoMoment.isValid()) {
    return 0;
  }

  return duracaoMoment.hour() * 60 + duracaoMoment.minute();
};

const getOrCreateCliente = async (clienteData, salaoId) => {
  if (!clienteData) {
    return null;
  }

  const {
    _id: ignoredId,
    vinculoId: ignoredVinculoId,
    dataCadastro: ignoredDataCadastro,
    customerId: ignoredCustomerId,
    ...clientePayload
  } = clienteData;

  let cliente = await Cliente.findOne({
    $or: [
      { email: clientePayload.email },
      { telefone: clientePayload.telefone },
      { 'documento.numero': clientePayload.documento?.numero },
    ],
  });

  if (!cliente) {
    const _id = new mongoose.Types.ObjectId();
    cliente = await new Cliente({
      _id,
      ...clientePayload,
      customerId: `local_${_id}`,
    }).save();
  }

  const vinculo = await SalaoCliente.findOne({
    salaoId,
    clienteId: cliente._id,
  });

  if (!vinculo) {
    await new SalaoCliente({
      salaoId,
      clienteId: cliente._id,
      status: 'A',
    }).save();
  } else if (vinculo.status === 'E') {
    await SalaoCliente.findByIdAndUpdate(vinculo._id, { status: 'A' });
  }

  return cliente;
};

const getServiceWindow = (date, durationMinutes) => ({
  inicio: moment(date),
  fim: moment(date).add(durationMinutes, 'minutes'),
});

const hasTimeOverlap = (first, second) =>
  first.inicio.isBefore(second.fim) && second.inicio.isBefore(first.fim);

const getBusyWindows = async (salaoId, colaboradorId, date, ignoredAgendamentoId = null) => {
  const filters = {
    salaoId,
    colaboradorId,
    status: 'A',
    data: {
      $gte: moment(date).startOf('day'),
      $lte: moment(date).endOf('day'),
    },
  };

  if (ignoredAgendamentoId) {
    filters._id = { $ne: ignoredAgendamentoId };
  }

  const agendamentos = await Agendamento.find(filters)
    .populate({ path: 'servicoId', select: 'duracao' })
    .select('data servicoId');

  return agendamentos.map((agendamento) => {
    const duracao = getDuracaoEmMinutos(agendamento.servicoId?.duracao);
    return getServiceWindow(agendamento.data, duracao || util.SLOT_DURATION);
  });
};

const validateAvailability = async ({
  salaoId,
  servicoId,
  colaboradorId,
  data,
  ignoredAgendamentoId = null,
}) => {
  const servico = await Servico.findById(servicoId).select('duracao');
  const servicoDuracao = getDuracaoEmMinutos(servico?.duracao);

  if (!servicoDuracao) {
    return {
      available: false,
      message: 'Duracao do servico invalida.',
    };
  }

  const dataAgendamento = moment(data);

  if (!dataAgendamento.isValid()) {
    return {
      available: false,
      message: 'Data do agendamento invalida.',
    };
  }

  const horarios = await Horario.find({
    salaoId,
    dias: dataAgendamento.day(),
    especialidades: servicoId,
    colaboradores: colaboradorId,
  }).select('inicio fim');

  const requestedWindow = getServiceWindow(dataAgendamento, servicoDuracao);

  if (requestedWindow.inicio.isBefore(moment())) {
    return {
      available: false,
      message: 'Este horario ja passou. Escolha outro horario.',
    };
  }

  const fitsWorkingHours = horarios.some((horario) => {
    const inicio = util.mergeDateTime(dataAgendamento, horario.inicio);
    const fim = util.mergeDateTime(dataAgendamento, horario.fim);

    return (
      requestedWindow.inicio.isSameOrAfter(inicio) &&
      requestedWindow.fim.isSameOrBefore(fim)
    );
  });

  if (!fitsWorkingHours) {
    return {
      available: false,
      message: 'Este horario nao esta disponivel para o servico selecionado.',
    };
  }

  const busyWindows = await getBusyWindows(
    salaoId,
    colaboradorId,
    dataAgendamento,
    ignoredAgendamentoId
  );
  const hasOverlap = busyWindows.some((busyWindow) =>
    hasTimeOverlap(requestedWindow, busyWindow)
  );

  if (hasOverlap) {
    return {
      available: false,
      message: 'Este horario ja foi agendado. Escolha outro horario.',
    };
  }

  return {
    available: true,
    dataAgendamento: dataAgendamento.toDate(),
    servicoDuracao,
  };
};

router.post('/filter', async (req, res) => {
  try {
    const { range, salaoId } = req.body;

    const agendamentos = await Agendamento.find({
      status: 'A',
      salaoId,
      data: {
        $gte: moment(range.start).startOf('day'),
        $lte: moment(range.end).endOf('day'),
      },
    }).populate([
      { path: 'servicoId', select: 'titulo duracao' },
      { path: 'colaboradorId', select: 'nome' },
      { path: 'clienteId', select: 'nome' },
    ]);

    res.json({ error: false, agendamentos });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.post('/', async (req, res) => {
  let agendamentoCriado;

  try {
    let { clienteId } = req.body;
    const { salaoId, servicoId, colaboradorId, data, cliente: clientePayload } = req.body;

    const availability = await validateAvailability({
      salaoId,
      servicoId,
      colaboradorId,
      data,
    });

    if (!availability.available) {
      return res.status(409).json({
        error: true,
        message: availability.message,
      });
    }

    if (!clienteId && clientePayload) {
      const clienteCriado = await getOrCreateCliente(clientePayload, salaoId);
      clienteId = clienteCriado?._id;
    }

    const cliente = await Cliente.findById(clienteId).select(
      'nome endereco customerId'
    );
    const salao = await Salao.findById(salaoId).select('recipientId');
    const servico = await Servico.findById(servicoId).select(
      'preco titulo comissao'
    );
    const colaborador = await Colaborador.findById(colaboradorId).select(
      'recipientId'
    );

    const precoFinal = util.toCents(servico.preco);

    const colaboradoreSplitRule = {
      recipient_id: colaborador.recipientId,
      amount: parseInt(precoFinal * (servico.comissao / 100)),
    };

    if (!cliente) {
      return res.json({ error: true, message: 'Cliente nao encontrado.' });
    }

    agendamentoCriado = await new Agendamento({
      ...req.body,
      clienteId,
      cliente: undefined,
      data: availability.dataAgendamento,
      transactionId: `pending-${new mongoose.Types.ObjectId()}`,
      comissao: servico.comissao,
      valor: servico.preco,
    }).save();

    if (!keys.api_key) {
      agendamentoCriado.transactionId = `local-${agendamentoCriado._id}`;
      await agendamentoCriado.save();

      return res.json({ error: false, agendamento: agendamentoCriado });
    }

    const createPayment = await pagarme('/transactions', {
      amount: precoFinal,
      card_number: '4111111111111111',
      card_cvv: '123',
      card_expiration_date: '0922',
      card_holder_name: 'Morpheus Fishburne',
      customer: {
        id: cliente.customerId,
      },
      billing: {
        name: cliente.nome,
        address: {
          country: cliente.endereco.pais.toLowerCase(),
          state: cliente.endereco.uf.toLowerCase(),
          city: cliente.endereco.cidade,
          street: cliente.endereco.logradouro,
          street_number: cliente.endereco.numero,
          zipcode: cliente.endereco.cep,
        },
      },
      items: [
        {
          id: servicoId,
          title: servico.titulo,
          unit_price: precoFinal,
          quantity: 1,
          tangible: false,
        },
      ],
      split_rules: [
        {
          recipient_id: salao.recipientId,
          amount: precoFinal - keys.app_fee - colaboradoreSplitRule.amount,
        },
        colaboradoreSplitRule,
        {
          recipient_id: keys.recipient_id,
          amount: keys.app_fee,
          charge_processing_fee: false,
        },
      ],
    });

    if (createPayment.error) {
      throw { message: createPayment.message };
    }

    agendamentoCriado.transactionId = createPayment.data.id;
    await agendamentoCriado.save();

    res.json({ error: false, agendamento: createPayment.data });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        error: true,
        message: 'Este horario ja foi agendado. Escolha outro horario.',
      });
    }

    if (
      agendamentoCriado &&
      agendamentoCriado.transactionId.startsWith('pending-')
    ) {
      await Agendamento.deleteOne({ _id: agendamentoCriado._id });
    }

    res.json({ error: true, message: err.message });
  }
});

router.post('/dias-disponiveis', async (req, res) => {
  try {
    const { data, salaoId, servicoId } = req.body;
    const horarios = await Horario.find({ salaoId });
    const servico = await Servico.findById(servicoId).select('duracao');
    let colaboradores = [];

    const agenda = [];
    let lastDay = moment(data);

    const servicoDuracao = getDuracaoEmMinutos(servico.duracao);
    const servicoDuracaoSlots = Math.ceil(servicoDuracao / util.SLOT_DURATION);

    if (!servicoDuracao) {
      return res.json({
        error: true,
        message: 'Duracao do servico invalida.',
      });
    }

    for (let i = 0; i <= 365 && agenda.length < 7; i++) {
      const espacosValidos = horarios.filter((h) => {
        const diaSemanaDisponivel = h.dias.includes(moment(lastDay).day());
        const servicosDisponiveis = h.especialidades.some(
          (especialidade) => String(especialidade) === String(servicoId)
        );

        return diaSemanaDisponivel && servicosDisponiveis;
      });

      if (espacosValidos.length > 0) {
        let todosHorariosDia = {};

        for (const espaco of espacosValidos) {
          for (const colaborador of espaco.colaboradores) {
            const colaboradorId = String(colaborador._id || colaborador);

            if (!todosHorariosDia[colaboradorId]) {
              todosHorariosDia[colaboradorId] = [];
            }

            todosHorariosDia[colaboradorId] = [
              ...todosHorariosDia[colaboradorId],
              ...util.sliceMinutes(
                util.mergeDateTime(lastDay, espaco.inicio),
                util.mergeDateTime(lastDay, espaco.fim),
                util.SLOT_DURATION,
                false
              ),
            ];
          }
        }

        for (const colaboradorKey of Object.keys(todosHorariosDia)) {
          const agendamentos = await Agendamento.find({
            salaoId,
            colaboradorId: colaboradorKey,
            status: 'A',
            data: {
              $gte: moment(lastDay).startOf('day'),
              $lte: moment(lastDay).endOf('day'),
            },
          })
            .populate({ path: 'servicoId', select: 'duracao' })
            .select('data servicoId -_id');

          let horariosOcupado = agendamentos.map((a) =>
            getServiceWindow(
              a.data,
              getDuracaoEmMinutos(a.servicoId?.duracao) || util.SLOT_DURATION
            )
          );

          horariosOcupado = horariosOcupado
            .map((h) =>
              util.sliceMinutes(h.inicio, h.fim, util.SLOT_DURATION, false)
            )
            .flat();

          let horariosLivres = util.splitByValue(
            _.uniq(
              todosHorariosDia[colaboradorKey].map((h) =>
                horariosOcupado.includes(h) ||
                moment(`${moment(lastDay).format('YYYY-MM-DD')}T${h}`).isBefore(moment())
                  ? '-'
                  : h
              )
            ),
            '-'
          );

          horariosLivres = horariosLivres
            .filter((h) => h.length >= servicoDuracaoSlots)
            .map((slot) =>
              slot.filter(
                (horario, index) => slot.length - index >= servicoDuracaoSlots
              )
            )
            .flat();

          horariosLivres = _.chunk(horariosLivres, 2);

          if (horariosLivres.length === 0) {
            todosHorariosDia = _.omit(todosHorariosDia, colaboradorKey);
          } else {
            todosHorariosDia[colaboradorKey] = horariosLivres;
          }
        }

        const totalColaboradores = Object.keys(todosHorariosDia).length;

        if (totalColaboradores > 0) {
          colaboradores.push(Object.keys(todosHorariosDia));
          agenda.push({
            [moment(lastDay).format('YYYY-MM-DD')]: todosHorariosDia,
          });
        }
      }

      lastDay = moment(lastDay).add(1, 'day');
    }

    colaboradores = await Colaborador.find({
      _id: { $in: _.uniq(colaboradores.flat()) },
    }).select('nome foto');

    colaboradores = colaboradores.map((c) => ({
      ...c._doc,
      nome: c.nome.split(' ')[0],
    }));

    res.json({ error: false, colaboradores, agenda });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

module.exports = router;
