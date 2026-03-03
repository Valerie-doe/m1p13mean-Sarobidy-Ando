const mongoose = require('mongoose');

const PaiementFactureSchema = new mongoose.Schema({
  factureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facture',
    required: true
  },
  datePaiement: {
    type: Date,
    required: true
  },
  montant: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('PaiementFacture', PaiementFactureSchema);