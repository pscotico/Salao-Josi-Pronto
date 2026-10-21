const nodemailer = require('nodemailer');

const getTransporter = () => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });
};

const sendPasswordRecoveryCode = async ({ to, code }) => {
  const transporter = getTransporter();

  if (!transporter) {
    return {
      sent: false,
      message: 'Gmail nao configurado no servidor.',
    };
  }

  await transporter.sendMail({
    from: `"Salao Josi" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Codigo para recuperar sua senha',
    text: `Seu codigo para recuperar a senha e ${code}. Ele expira em 10 minutos.`,
    html: `
      <div style="font-family:Arial,sans-serif;color:#1f2937">
        <h2>Recuperacao de senha</h2>
        <p>Use o codigo abaixo para criar uma nova senha no Salao Josi:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:4px">${code}</p>
        <p>Este codigo expira em 10 minutos.</p>
      </div>
    `,
  });

  return { sent: true };
};

module.exports = {
  sendPasswordRecoveryCode,
};
