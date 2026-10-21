const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const agendamento = new Schema({

    salaoId: {
                 type: mongoose.Types.ObjectId,
                ref:'Salao',
                required: true,
                },
             clienteId: {
                type: mongoose.Types.ObjectId,
                ref:'Cliente',
                required: true,
            },
            servicoId: {
                type: mongoose.Types.ObjectId,
                ref:'Servico',
                required: true,
            },
            colaboradorId: {
                type: mongoose.Types.ObjectId,
                ref:'Colaborador',
                required: true,
            },
            data:{
                type: Date,
                required: true,
            },
            comissao:{
                type: Number,
                required: true,
            },
            valor:{
                type: Number,
                required: true,
            },
            transactionId:{
                type: String,
                required: true,
            },
            status: {
                type: String,
                required: true,
                enum: ['A', 'I', 'E'],
                default: 'A'
            },
               
    dataCadastro: {
        type: Date,
        default: Date.now,

    },

    
});

agendamento.index(
    { salaoId: 1, colaboradorId: 1, data: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: 'A' } }
);
 
module.exports = mongoose.model('Agendamento', agendamento );
