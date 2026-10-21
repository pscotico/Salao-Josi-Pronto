const express = require('express');
const router = express.Router();
const Cliente = require('../models/cliente');
const Salao = require('../models/salao');
const SalaoCliente = require('../models/relationship/salaoCliente');
const jwt = require('../services/jwt');
const auth = require('../middlewares/auth');
const { sendPasswordRecoveryCode } = require('../services/mailer');

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@salaojosi.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const passwordRecoveryCodes = new Map();

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const emailQuery = (email) => new RegExp(`^${String(email).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
const onlyNumbers = (value) => String(value || '').replace(/\D/g, '');

const isValidPassword = (savedPassword, password) =>
  Boolean(savedPassword) && String(savedPassword) === String(password);

const sanitizeUser = (user, accessType) => ({
  _id: user._id,
  nome: user.nome,
  email: user.email,
  foto: user.foto,
  accessType,
});

const buildSession = (user, accessType, salaoId) => {
  const safeUser = sanitizeUser(user, accessType);
  const token = jwt.sign({
    sub: String(user._id),
    accessType,
    salaoId: accessType === 'admin' ? String(user._id) : salaoId,
  });

  return {
    error: false,
    token,
    user: safeUser,
    accessType,
  };
};

const generateRecoveryCode = () => String(Math.floor(100000 + Math.random() * 900000));

router.post('/login', async (req, res) => {
  try {
    const { email, senha, accessType, salaoId } = req.body;

    if (!['cliente', 'admin'].includes(accessType)) {
      return res.status(400).json({
        error: true,
        message: 'Selecione o tipo de acesso.',
      });
    }

    if (!normalizeEmail(email) || !senha) {
      return res.status(400).json({
        error: true,
        message: 'Informe e-mail e senha.',
      });
    }

    const isDefaultAdminLogin =
      accessType === 'admin' &&
      Boolean(ADMIN_PASSWORD) &&
      normalizeEmail(email) === DEFAULT_ADMIN_EMAIL &&
      String(senha) === ADMIN_PASSWORD;

    const Model = accessType === 'admin' ? Salao : Cliente;
    const query = accessType === 'admin'
      ? {
          ...(salaoId ? { _id: salaoId } : {}),
          ...(isDefaultAdminLogin ? {} : { email: emailQuery(normalizeEmail(email)) }),
        }
      : { email: emailQuery(normalizeEmail(email)), status: { $ne: 'I' } };

    const user = await Model.findOne(query);

    if (!user || (!isDefaultAdminLogin && !isValidPassword(user.senha, senha))) {
      return res.status(401).json({
        error: true,
        message: 'Usuario ou senha invalidos.',
      });
    }

    return res.json(buildSession(user, accessType, salaoId));
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message });
  }
});

router.post('/cliente/register', async (req, res) => {
  try {
    const { cliente, salaoId } = req.body;
    const documentoNumero = onlyNumbers(cliente?.documento?.numero);
    const telefone = onlyNumbers(cliente?.telefone);

    if (!cliente?.nome || !cliente?.email || !telefone || !cliente?.senha) {
      return res.status(400).json({
        error: true,
        message: 'Preencha nome, telefone, e-mail e senha.',
      });
    }

    if (!cliente?.dataNascimento || !cliente?.sexo || !documentoNumero) {
      return res.status(400).json({
        error: true,
        message: 'Preencha data de nascimento, sexo e CPF.',
      });
    }

    const existentCliente = await Cliente.findOne({
      $or: [
        { email: emailQuery(normalizeEmail(cliente.email)) },
        { telefone },
        { 'documento.numero': documentoNumero },
      ],
    });

    if (existentCliente?.senha) {
      return res.status(409).json({
        error: true,
        message: 'Ja existe uma conta com esses dados. Faca login.',
      });
    }

    const savedCliente = existentCliente
      ? await Cliente.findByIdAndUpdate(
          existentCliente._id,
          {
            nome: cliente.nome,
            telefone,
            email: normalizeEmail(cliente.email),
            senha: cliente.senha,
            dataNascimento: cliente.dataNascimento,
            sexo: cliente.sexo,
            documento: {
              tipo: 'cpf',
              numero: documentoNumero,
            },
            endereco: {
              ...(existentCliente.endereco || {}),
              pais: existentCliente.endereco?.pais || 'br',
            },
          },
          { new: true }
        )
      : await new Cliente({
          nome: cliente.nome,
          telefone,
          email: normalizeEmail(cliente.email),
          senha: cliente.senha,
          dataNascimento: cliente.dataNascimento,
          sexo: cliente.sexo,
          status: 'A',
          customerId: `local_${Date.now()}`,
          documento: {
            tipo: 'cpf',
            numero: documentoNumero,
          },
          endereco: {
            pais: 'br',
          },
        }).save();

    if (salaoId) {
      const existentRelationship = await SalaoCliente.findOne({
        salaoId,
        clienteId: savedCliente._id,
      });

      if (!existentRelationship) {
        await new SalaoCliente({
          salaoId,
          clienteId: savedCliente._id,
          status: 'A',
        }).save();
      }
    }

    return res.json(buildSession(savedCliente, 'cliente', salaoId));
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message });
  }
});

router.post('/cliente/password-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!normalizeEmail(email)) {
      return res.status(400).json({
        error: true,
        message: 'Informe o e-mail cadastrado.',
      });
    }

    const cliente = await Cliente.findOne({
      email: emailQuery(normalizeEmail(email)),
      status: { $ne: 'I' },
    });

    if (!cliente) {
      return res.status(404).json({
        error: true,
        message: 'Nao encontramos cliente com esse e-mail.',
      });
    }

    const code = generateRecoveryCode();
    passwordRecoveryCodes.set(normalizeEmail(email), {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
      clienteId: String(cliente._id),
    });

    const emailResult = await sendPasswordRecoveryCode({
      to: cliente.email,
      code,
    });

    return res.json({
      error: false,
      message: emailResult.sent
        ? 'Codigo enviado para seu e-mail.'
        : 'Codigo gerado. Configure o Gmail no servidor para envio real.',
      devCode: emailResult.sent ? undefined : code,
    });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message });
  }
});

router.post('/cliente/reset-password', async (req, res) => {
  try {
    const { email, codigo, novaSenha } = req.body;
    const recovery = passwordRecoveryCodes.get(normalizeEmail(email));

    if (!normalizeEmail(email) || !codigo || !novaSenha) {
      return res.status(400).json({
        error: true,
        message: 'Informe e-mail, codigo e nova senha.',
      });
    }

    if (!recovery || recovery.expiresAt < Date.now()) {
      passwordRecoveryCodes.delete(normalizeEmail(email));
      return res.status(400).json({
        error: true,
        message: 'Codigo expirado. Solicite um novo codigo.',
      });
    }

    if (String(codigo).trim() !== recovery.code) {
      return res.status(400).json({
        error: true,
        message: 'Codigo invalido.',
      });
    }

    if (String(novaSenha).trim().length < 4) {
      return res.status(400).json({
        error: true,
        message: 'Use uma senha com pelo menos 4 caracteres.',
      });
    }

    const cliente = await Cliente.findById(recovery.clienteId);

    if (!cliente) {
      return res.status(404).json({
        error: true,
        message: 'Cliente nao encontrado.',
      });
    }

    cliente.senha = String(novaSenha);
    await cliente.save();
    passwordRecoveryCodes.delete(normalizeEmail(email));

    return res.json({
      error: false,
      message: 'Senha atualizada com sucesso. Faca login com a nova senha.',
    });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message });
  }
});

router.get('/me', auth(), async (req, res) => {
  try {
    const Model = req.user.accessType === 'admin' ? Salao : Cliente;
    const user = await Model.findById(req.user.sub).select('-senha');

    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Sessao expirada.',
      });
    }

    return res.json({
      error: false,
      user: sanitizeUser(user, req.user.accessType),
      accessType: req.user.accessType,
    });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message });
  }
});

module.exports = router;
