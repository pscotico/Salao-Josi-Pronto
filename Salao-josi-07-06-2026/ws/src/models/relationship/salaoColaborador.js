const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const salaoColaborador = new Schema({

     salaoId: {
                type: mongoose.Types.ObjectId,
                ref:'Salao',
                required: true,
            },
             colaboradorId: {
                type: mongoose.Types.ObjectId,
                ref:'Colaborador',
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

salaoColaborador.index({ salaoId: 1, colaboradorId: 1 }, { unique: true });
 
module.exports = mongoose.model('SalaoColaborador', salaoColaborador );
