const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const salaoCliente = new Schema({

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

salaoCliente.index({ salaoId: 1, clienteId: 1 }, { unique: true });
 
module.exports = mongoose.model('SalaoCliente', salaoCliente );
