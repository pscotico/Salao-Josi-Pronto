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
        default: null, // guilherme #3 2:05:38 //
    },
    foto: {
        type: String, // Guilherme  apaguei o "required: true" #3 2:05:41 //
    },
    dataNascimento: {
        type: String, //YYYY-MM-DD
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
        enum: ['cpf', 'cnpj'], // guilherme  tive que alterar esse enum no video #3 1:55:53 o original estava assim enum: ['individual', 'corporantion'], //
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
    customerId: {    //GUILHERME #3 2:07:32 //
        type: String,
        required: true,

    }
});
 
module.exports = mongoose.model('Cliente', cliente );
