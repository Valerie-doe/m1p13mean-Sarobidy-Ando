const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  // 🔹 Identité de la boutique
  name: { type: String, required: true },
  
  categoryId : { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },

  // 🔹 Localisation physique
  unitNumber: { type: String },
  floor: { type: Number },                       
  surface: { type: Number },                     
  phone: { type: String },
  email: { type: String },
//   rentAmount: { type: Number },      
//   charges: { type: Number },         
//   contractStartDate: { type: Date },
//   contractEndDate: { type: Date },
  status: {
    type: String,
    enum: ['active', 'closed', 'renovation'],
    default: 'active'
  },
  website: { type: String },
  openingHours: { type: String },
  description: { type: String },
  imageUrl: { type: String },

}, { timestamps: true }); // createdAt / updatedAt automatiques

module.exports = mongoose.model('Shop', shopSchema);

