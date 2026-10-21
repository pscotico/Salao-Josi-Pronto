const jwt = require('../services/jwt');

const auth = (allowedAccessTypes = []) => (req, res, next) => {
  try {
    const [, token] = String(req.headers.authorization || '').split(' ');
    const user = jwt.verify(token);

    if (allowedAccessTypes.length && !allowedAccessTypes.includes(user.accessType)) {
      return res.status(403).json({
        error: true,
        message: 'Acesso administrativo necessario.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      error: true,
      message: err.message === 'Sessao expirada.' ? err.message : 'Sessao expirada.',
    });
  }
};

module.exports = auth;
