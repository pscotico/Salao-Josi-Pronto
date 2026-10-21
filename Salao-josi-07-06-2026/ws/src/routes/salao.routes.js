const express = require('express');
const router = express.Router();
const Salao = require('../models/salao');
const Servico = require('../models/servico');
const turf = require('@turf/turf');
const fs = require('fs');
const path = require('path');

const buildSalaoUpdate = (body) => ({
    nome: body.nome,
    foto: body.foto,
    capa: body.capa,
    logo: body.logo,
    email: body.email,
    telefone: body.telefone,
    endereco: body.endereco,
    site: body.site,
});

const sanitizeFileName = (filename) =>
  String(filename || 'imagem')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-');

const asPublicUploadUrl = (caminho) => `http://localhost:8000/uploads/${caminho}`;

const saveLocalFile = async (file, caminho) => {
  const uploadPath = path.resolve(__dirname, '..', '..', 'public', 'uploads', caminho);
  await fs.promises.mkdir(path.dirname(uploadPath), { recursive: true });
  await fs.promises.writeFile(uploadPath, file.data);
};

router.post('/', async (req, res) =>{
try{
    const salao = await new Salao(req.body).save();
     res.json({salao});
} catch (err){
    res.json({error: true, message: err.message});
}

});

router.get('/servicos/:salaoId', async(req, res)=>{
    try{
        const{salaoId} = req.params;
        const servicos = await Servico.find({
            salaoId,
            status: 'A'
        }).select('_id titulo');
        res.json({
            error: false,
            servicos: servicos.map((s)=> ({label: s.titulo, value: s._id})),
        });

    }catch(err){
      res.json({error: true, message: err.message})  ;
    }
});

router.get('/:salaoId', async (req, res) => {
  try {
    const salao = await Salao.findById(req.params.salaoId).select('-senha');

    if (!salao) {
      return res.status(404).json({ error: true, message: 'Salao nao encontrado.' });
    }

    res.json({ error: false, salao });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
});

router.put('/:salaoId', async (req, res) => {
  try {
    const salao = await Salao.findByIdAndUpdate(
      req.params.salaoId,
      buildSalaoUpdate(req.body),
      { new: true, runValidators: true }
    ).select('-senha');

    if (!salao) {
      return res.status(404).json({ error: true, message: 'Salao nao encontrado.' });
    }

    res.json({ error: false, salao });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
});

router.post('/:salaoId/upload/:field', async (req, res) => {
  try {
    const { salaoId, field } = req.params;
    const allowedFields = ['logo', 'foto', 'capa'];

    if (!allowedFields.includes(field)) {
      return res.status(400).json({ error: true, message: 'Campo de imagem invalido.' });
    }

    const file = req.files?.arquivo;

    if (!file) {
      return res.status(400).json({ error: true, message: 'Selecione uma imagem.' });
    }

    const filename = sanitizeFileName(file.filename || file.name);
    const caminho = `saloes/${salaoId}/${field}-${Date.now()}-${filename}`;

    await saveLocalFile(file, caminho);

    const imageUrl = asPublicUploadUrl(caminho);
    const salao = await Salao.findByIdAndUpdate(
      salaoId,
      { [field]: imageUrl },
      { new: true }
    ).select('-senha');

    if (!salao) {
      return res.status(404).json({ error: true, message: 'Salao nao encontrado.' });
    }

    res.json({ error: false, salao, imageUrl });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
});

module.exports = router;
