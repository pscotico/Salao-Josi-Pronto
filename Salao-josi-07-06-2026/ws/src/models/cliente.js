const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cliente = new Schema({
    nome: {
        type: String,
        required: true
    },
    telefone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    senha: {
        type: String,
        default: null,
    },
    foto: {
        type: String,
    },
    dataNascimento: {
        type: String,
        required: true
    },
    sexo: {
        type: String,
        enum:['M', 'F'],
        required: true
    },
   status: {
    type: String,
    required: true,
    enum: ['A', 'I'],
    default: 'A'
},

    customerId: {
        type: String,
        required: true
    },
 
    
     dataCadastro: {
        type: Date,
        default: Date.now,

    },

    documento: {
       tipo:{
        type: String,
        enum: ['cpf', 'cnpj'],
        required: true              
        },
        numero:{
            type: String,
            required: true   
        },
    },
     endereco: {
        cidade: String,
        uf: String,
        cep: String,
        logradouro: String,
        numero: String,
        pais: String,
    },
    customerId: {
        type: String,
        required: true,

    }
});
 
module.exports = mongoose.model('Cliente', cliente );
