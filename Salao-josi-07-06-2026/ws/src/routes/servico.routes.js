const express = require('express');
const router = express.Router();
const Salao = require('../models/salao');
const Servico = require('../models/servico');
const Horario = require('../models/horario');
const turf = require('@turf/turf');
const util = require('../services/util');
const aws = require('../services/aws');
const fs = require('fs');
const path = require('path');

const asArray = (value) => {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

const sanitizeFileName = (filename) =>
  filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-');

const parseArquivosAtuais = (arquivosAtuais) => {
  if (!arquivosAtuais) {
    return [];
  }

  try {
    const parsed = JSON.parse(arquivosAtuais);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
};

const hasAwsCredentials = () =>
  Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

const saveLocalFile = async (file, caminho) => {
  const uploadPath = path.resolve(__dirname, '..', '..', 'public', 'uploads', caminho);

  await fs.promises.mkdir(path.dirname(uploadPath), { recursive: true });
  await fs.promises.writeFile(uploadPath, file.data);
};

const saveServicoFile = async (file, caminho) => {
  if (!hasAwsCredentials()) {
    await saveLocalFile(file, caminho);
    return { error: false };
  }

  return aws.uploadToS3(file, caminho);
};

const buildServicoPayload = async (req) => {
  const body = { ...req.body };
  const arquivos = parseArquivosAtuais(body.arquivosAtuais);
  const files = asArray(req.files?.arquivos);

  delete body.arquivos;
  delete body.arquivosAtuais;

  for (const file of files) {
    const filename = sanitizeFileName(file.filename || file.name || 'arquivo');
    const caminho = `servicos/${body.salaoId}/${Date.now()}-${filename}`;
    const upload = await saveServicoFile(file, caminho);

    if (upload.error) {
      return { error: true, message: upload.message };
    }

    arquivos.push({ caminho });
  }

  return {
    error: false,
    servico: {
      ...body,
      arquivos,
    },
  };
};

router.post('/', async (req, res) => {
  try {
    const payload = await buildServicoPayload(req);

    if (payload.error) {
      return res.json({ error: true, message: payload.message });
    }

    const servico = await new Servico(payload.servico).save();
    res.json({ error: false, servico });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.get('/salao/:salaoId', async (req, res) => {
  try {
    const { salaoId } = req.params;
    const servicos = await Servico.find({
      salaoId,
      status: { $ne: 'E' },
    }).sort({ dataCadastro: -1 });

    res.json({ error: false, servicos });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.put('/:servicoId', async (req, res) => {
  try {
    const { servicoId } = req.params;
    const payload = await buildServicoPayload(req);

    if (payload.error) {
      return res.json({ error: true, message: payload.message });
    }

    const servico = await Servico.findByIdAndUpdate(servicoId, payload.servico, {
      new: true,
    });

    res.json({ error: false, servico });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.delete('/:servicoId', async (req, res) => {
  try {
    const { servicoId } = req.params;
    const servico = await Servico.findByIdAndUpdate(
      servicoId,
      { status: 'E' },
      { new: true }
    );

    res.json({ error: false, servico });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.get('/servicos/:salaoId', async (req, res) => {
  try {
    const { salaoId } = req.params;
    const servicos = await Servico.find({
      salaoId,
      status: 'A',
    }).select('_id titulo');

    res.json({
      error: false,
      servicos: servicos.map((s) => ({ label: s.titulo, value: s._id })),
    });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.post('/filter/:id', async (req, res) => {
  try {
    const salao = await Salao.findById(req.params.id).select(req.body.fields);

    const distance = turf
      .distance(
        turf.point(salao.geo.coordinates),
        turf.point([-30.043858, -51.103487])
      )
      .toFixed(2);

    const horarios = await Horario.find({
      salaoId: req.params.id,
    }).select('dias inicio fim');

    const isOpened = await util.isOpened(horarios);

    res.json({ error: false, salao: { ...salao._doc, distance, isOpened } });
 
  } catch (err) {
    res.json({ error: true, message: err.message });
  }

});

module.exports = router;
