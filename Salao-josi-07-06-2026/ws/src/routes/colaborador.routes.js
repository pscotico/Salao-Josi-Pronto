const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const pagarme = require('../services/pagarme');
const keys = require('../data/keys.json');
const Colaborador = require('../models/colaborador');
const SalaoColaborador = require('../models/relationship/salaoColaborador');
const ColaboradorServico = require('../models/relationship/colaboradorServico');

router.post('/', async (req, res) => {
  try {
    const { colaborador, salaoId } = req.body;
    let newColaborador = null;
    const colaboradorData = {
      ...colaborador,
      foto: colaborador.foto || 'https://placehold.co/300x300?text=Colaborador',
      status: colaborador.status || colaborador.vinculo || 'A',
    };

    const existentColaborador = await Colaborador.findOne({
      $or: [
        { email: colaboradorData.email },
        { telefone: colaboradorData.telefone },
      ],
    });

    if (!existentColaborador) {
      const _id = new mongoose.Types.ObjectId();
      let recipientId = `local_${_id}`;
      const { contaBancaria } = colaboradorData;

      if (keys.api_key) {
        const pagarmeBankAccount = await pagarme('/bank_accounts', {
          agencia: contaBancaria.agencia,
          bank_code: contaBancaria.banco,
          conta: contaBancaria.numero,
          conta_dv: contaBancaria.dv,
          document_number: contaBancaria.cpfCnpj,
          legal_name: contaBancaria.titular,
        });

        if (pagarmeBankAccount.error) {
          throw pagarmeBankAccount;
        }

        const pagarmeRecipient = await pagarme('/recipients', {
          transfer_interval: 'day',
          transfer_enabled: true,
          bank_account_id: pagarmeBankAccount.data.id,
        });

        if (pagarmeRecipient.error) {
          throw pagarmeRecipient;
        }

        recipientId = pagarmeRecipient.data.id;
      }

      newColaborador = await new Colaborador({
        _id,
        ...colaboradorData,
        recipientId,
      }).save();
    }

    const savedColaborador = existentColaborador || newColaborador;
    const colaboradorId = savedColaborador._id;

    const existentRelationship = await SalaoColaborador.findOne({
      salaoId,
      colaboradorId,
    });

    if (!existentRelationship) {
      await new SalaoColaborador({
        salaoId,
        colaboradorId,
        status: colaboradorData.vinculo || colaboradorData.status || 'A',
      }).save();
    } else {
      await SalaoColaborador.findByIdAndUpdate(existentRelationship._id, {
        status: colaboradorData.vinculo || colaboradorData.status || 'A',
      });
    }

    await ColaboradorServico.deleteMany({ colaboradorId });

    if (colaborador.especialidades?.length > 0) {
      await ColaboradorServico.insertMany(
        [...new Set(colaborador.especialidades)].map((servicoId) => ({
          servicoId,
          colaboradorId,
        }))
      );
    }

    res.json({
      error: false,
      colaborador: savedColaborador,
    });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.put('/:colaboradorId', async (req, res) => {
  try {
    const { colaborador = {}, vinculo, vinculoId, especialidades = [] } = req.body;
    const { colaboradorId } = req.params;

    const updateData = {
      nome: colaborador.nome,
      email: colaborador.email,
      telefone: colaborador.telefone,
      dataNascimento: colaborador.dataNascimento,
      sexo: colaborador.sexo,
      status: vinculo || colaborador.vinculo || colaborador.status || 'A',
      contaBancaria: colaborador.contaBancaria,
    };

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await Colaborador.findByIdAndUpdate(colaboradorId, updateData);

    if (vinculoId) {
      await SalaoColaborador.findByIdAndUpdate(vinculoId, {
        status: vinculo || colaborador.vinculo || 'A',
      });
    }

    await ColaboradorServico.deleteMany({ colaboradorId });

    if (especialidades.length > 0) {
      await ColaboradorServico.insertMany(
        [...new Set(especialidades)].map((servicoId) => ({
          servicoId,
          colaboradorId,
        }))
      );
    }

    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.delete('/vinculo/:id', async (req, res) => {
  try {
    await SalaoColaborador.findByIdAndUpdate(req.params.id, { status: 'E' });
    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.post('/filter', async (req, res) => {
  try {
    const filters = req.body.filters || {};

    if (Object.keys(filters).length === 0) {
      return res.json({ error: false, colaboradores: [] });
    }

    const colaboradores = await Colaborador.find(filters);
    res.json({ error: false, colaboradores });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.get('/salao/:salaoId', async (req, res) => {
  try {
    const { salaoId } = req.params;
    const listaColaboradores = [];

    const salaoColaboradores = await SalaoColaborador.find({
      salaoId,
      status: { $ne: 'E' },
    })
      .populate({ path: 'colaboradorId', select: '-senha -recipientId' })
      .select('colaboradorId dataCadastro status');

    for (const vinculo of salaoColaboradores) {
      const especialidades = await ColaboradorServico.find({
        colaboradorId: vinculo.colaboradorId._id,
      });

      listaColaboradores.push({
        ...vinculo._doc,
        especialidades,
      });
    }

    res.json({
      error: false,
      colaboradores: listaColaboradores.map((vinculo) => ({
        ...vinculo.colaboradorId._doc,
        vinculoId: vinculo._id,
        vinculo: vinculo.status,
        especialidades: vinculo.especialidades,
        dataCadastro: vinculo.dataCadastro,
      })),
    });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

module.exports = router;
