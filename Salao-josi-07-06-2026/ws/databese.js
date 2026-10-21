const mongoose = require('mongoose');

const URI = process.env.MONGODB_URI;

if (!URI) {
  console.error('MONGODB_URI nao configurada. Defina a variavel no arquivo .env.');
} else {
  mongoose.connect(URI)
    .then(() => console.log('Banco de dados conectado'))
    .catch((err) => console.error('Erro ao conectar ao banco:', err.message));
}
