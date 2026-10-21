const express = require('express');
const router = express.Router();
const _ = require('lodash');

const Horario = require('../models/horario');
const ColaboradorServico = require('../models/relationship/colaboradorServico');

router.post('/', async (req, res) => {
  try {
    const horario = await new Horario(req.body).save();
    res.json({ horario });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.get('/salao/:salaoId', async (req, res) => {
  try {
    const { salaoId } = req.params;
    const horarios = await Horario.find({ salaoId });

    res.json({ horarios });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.put('/:horarioId', async (req, res) => {
  try {
    const { horarioId } = req.params;

    await Horario.findByIdAndUpdate(horarioId, req.body);

    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.delete('/:horarioId', async (req, res) => {
  try {
    const { horarioId } = req.params;

    await Horario.findByIdAndDelete(horarioId);

    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.post('/colaboradores', async (req, res) => {
  try {
    const colaboradorServico = await ColaboradorServico.find({
      servicoId: { $in: req.body.especialidades },
      status: 'A',
    })
      .populate('colaboradorId', 'nome')
      .select('colaboradorId -_id');

    const colaboradores = _.uniqBy(colaboradorServico, (vinculo) =>
      vinculo.colaboradorId._id.toString()
    ).map((vinculo) => ({
      label: vinculo.colaboradorId.nome,
      value: vinculo.colaboradorId._id,
    }));

    res.json({ error: false, colaboradores });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

module.exports = router;
