const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['ADMIN', 'BOUTIQUE', 'CLIENT'],
    default: 'CLIENT'
  },
  boutiqueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null }
}, { timestamps: true });

// Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

// Vérifier mot de passe
userSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Utilisateur', userSchema);
