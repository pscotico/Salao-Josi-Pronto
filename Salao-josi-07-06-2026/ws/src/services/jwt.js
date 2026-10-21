const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET nao configurada. Defina a variavel no arquivo .env.');
}

const base64url = (input) =>
  Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const decodeBase64url = (input) => {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  return Buffer.from(padded, 'base64').toString('utf8');
};

const sign = (payload, expiresInSeconds = 60 * 60 * 8) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const unsignedToken = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(body))}`;
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(unsignedToken)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${unsignedToken}.${signature}`;
};

const verify = (token) => {
  const [header, payload, signature] = String(token || '').split('.');

  if (!header || !payload || !signature) {
    throw new Error('Token invalido.');
  }

  const unsignedToken = `${header}.${payload}`;
  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(unsignedToken)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (signature !== expectedSignature) {
    throw new Error('Token invalido.');
  }

  const decodedPayload = JSON.parse(decodeBase64url(payload));

  if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Sessao expirada.');
  }

  return decodedPayload;
};

module.exports = {
  sign,
  verify,
};
