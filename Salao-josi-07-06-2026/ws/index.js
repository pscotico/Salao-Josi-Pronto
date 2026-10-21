const express = require('express'); 
require('dotenv').config();
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const busboy = require('connect-busboy');
const busboyBodyParser = require('busboy-body-parser');
const path = require('path');
require('./databese');
app.use(morgan('dev'));
app.use(express.json());
app.use(busboy());
app.use(busboyBodyParser());
app.use(cors());
app.use('/uploads', express.static(path.resolve(__dirname, 'public', 'uploads')));
app.set('port', 8000);
app.use('/servico', require('./src/routes/servico.routes'));
app.use('/salao', require('./src/routes/salao.routes'));
app.use('/horario', require('./src/routes/horario.routes'));
app.use('/colaborador', require('./src/routes/colaborador.routes'));
app.use('/cliente', require('./src/routes/cliente.routes'));
app.use('/agendamento', require('./src/routes/agendamento.routes'));
app.use('/auth', require('./src/routes/auth.routes'));

app.listen(app.get('port'), () => {
    console.log(`WS escutando na porta ${app.get('port')}`);
}) ; 
