const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const salao = new Schema({
    nome: {
        type: String,
        required:[true, 'Nome e obrigatorio'],
    },
    foto: String,
    capa: String,
    logo: String,
    email: {
        type: String,
        required:[true, 'E-mail e obrigatorio'],
    },
    senha: {
      type: String,
      default: null, 
    },
    telefone: String,
    recipientId: String,
    endereco: {
        cidade: String,
        uf: String,
        cep: String,
        logradouro: String,
        numero: String,
        pais: String,
    },
    site: {
        enderecoTexto: String,
        telefoneLink: String,
        whatsapp: String,
        instagram: String,
        botaoPrincipalTexto: String,
        botaoLigarTexto: String,
        botaoLocalizacaoTexto: String,
        botaoCompartilharTexto: String,
    },
    geo: {
        tipo: String,
        coordinates: [Number],
    },
    dataCadastro: {
        type: Date,
        default: Date.now,

    },

    
});

 salao.index({ geo: '2dsphere'  });
 
module.exports = mongoose.model('Salao', salao );
