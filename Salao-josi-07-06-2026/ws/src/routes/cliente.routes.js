
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Cliente = require('../models/cliente');
const SalaoCliente = require('../models/relationship/salaoCliente');
const pagarme = require('../services/pagarme');
const keys = require('../data/keys.json');

router.post('/', async (req, res) => {
  try {
    const { cliente, salaoId } = req.body;
    const {
      _id: ignoredId,
      vinculoId: ignoredVinculoId,
      dataCadastro: ignoredDataCadastro,
      customerId: ignoredCustomerId,
      ...clienteData
    } = cliente;

    const existentCliente = await Cliente.findOne({
      $or: [
        { email: clienteData.email },
        { telefone: clienteData.telefone },
        { 'documento.numero': clienteData.documento?.numero },
      ],
    });

    let savedCliente = existentCliente;

    if (!savedCliente) {
      const _id = new mongoose.Types.ObjectId();
      let customerId = `local_${_id}`;

      if (keys.api_key) {
        const pagarmeCustomer = await pagarme('/customers', {
          external_id: String(_id),
          name: clienteData.nome,
          type: clienteData.documento.tipo === 'cpf' ? 'individual' : 'corporation',
          country: clienteData.endereco.pais,
          email: clienteData.email,
          documents: [
            {
              type: clienteData.documento.tipo,
              number: clienteData.documento.numero,
            },
          ],
          phone_numbers: [clienteData.telefone],
          birthday: clienteData.dataNascimento,
        });

        if (pagarmeCustomer.error) {
          throw pagarmeCustomer;
        }

        customerId = pagarmeCustomer.data.id;
      }

      savedCliente = await new Cliente({
        _id,
        ...clienteData,
        customerId,
      }).save();
    }

    let existentRelationship = await SalaoCliente.findOne({
      salaoId,
      clienteId: savedCliente._id,
    });

    if (!existentRelationship) {
      existentRelationship = await new SalaoCliente({
        salaoId,
        clienteId: savedCliente._id,
        status: clienteData.vinculo || 'A',
      }).save();
    } else if (existentRelationship.status === 'E') {
      existentRelationship = await SalaoCliente.findByIdAndUpdate(
        existentRelationship._id,
        { status: clienteData.vinculo || 'A' },
        { new: true }
      );
    }

    res.json({
      error: false,
      cliente: {
        ...savedCliente._doc,
        vinculoId: existentRelationship._id,
        vinculo: existentRelationship.status,
      },
    });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.post('/filter', async (req, res) => {
  try {
    const clientes = await Cliente.find(req.body.filters);

    res.json({ error: false, clientes });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.put('/:clienteId', async (req, res) => {
  try {
    const { cliente, salaoId } = req.body;
    const { clienteId } = req.params;

    const updatedCliente = await Cliente.findByIdAndUpdate(
      clienteId,
      {
        nome: cliente.nome,
        telefone: cliente.telefone,
        email: cliente.email,
        dataNascimento: cliente.dataNascimento,
        sexo: cliente.sexo,
        documento: cliente.documento,
        endereco: cliente.endereco,
      },
      { new: true }
    );

    if (!updatedCliente) {
      return res.json({ error: true, message: 'Cliente nao encontrado.' });
    }

    const existentRelationship = await SalaoCliente.findOne({
      salaoId,
      clienteId: updatedCliente._id,
    });

    res.json({
      error: false,
      cliente: {
        ...updatedCliente._doc,
        vinculoId: existentRelationship?._id,
        vinculo: existentRelationship?.status,
      },
    });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.get('/salao/:salaoId', async (req, res) => {
  try {
    const { salaoId } = req.params;

    const clientes = await SalaoCliente.find({
      salaoId,
      status: { $ne: 'E' },
    })
      .populate('clienteId')
      .select('clienteId dataCadastro');

    res.json({
      error: false,
      clients: clientes.map((vinculo) => ({
        ...vinculo.clienteId._doc,
        vinculoId: vinculo._id,
        dataCadastro: vinculo.dataCadastro,
      })),
    });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.delete('/vinculo/:id', async (req, res) => {
  try {
    await SalaoCliente.findByIdAndUpdate(req.params.id, { status: 'E' });

    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

module.exports = router;
