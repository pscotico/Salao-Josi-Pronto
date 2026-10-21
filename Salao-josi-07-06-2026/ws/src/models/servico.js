const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const servico = new Schema({
  
    
    
        salaoId: {
            type: mongoose.Types.ObjectId,
            ref:'Salao',
            required: true,
        },
        titulo: {
            type: String,
            required: true,
        },
         preco: {
            type: Number,
            required: true,
        },
         comissao: {
            type: Number, // % de comissao sobre o preco
            required: true,
        },
         duracao: {
            type: Date, // guilherme #3 3:18:57 tava como number //
            required: true,
        },
         recorrencia: {
            type: Number, // periodo de refacao  do servico em dias
            required: true,
        },
        descricao: {
            type: String,
            required: true,
        },
        arquivos: [
            {
                caminho: String,
            },
        ],
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

 
module.exports = mongoose.model('Servico', servico ); 
