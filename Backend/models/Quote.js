const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail:    { type: String, required: true },
  service:      { type: String, required: true },
  origin:       { type: String, required: true },
  destination:  { type: String, required: true },
  cargo:        { type: String, default: '' },
  weight:       { type: String, default: '' },
  notes:        { type: String, default: '' },
  deadline:     { type: String, default: '' },
  userName:     { type: String, default: '' },
  userCompany:  { type: String, default: '' },
  status: {
    type: String,
    enum: ['soumis', 'devis_propose', 'confirme', 'en_cours', 'livre', 'refuse', 'annule'],
    default: 'soumis'
  },
  devisAmount:  { type: Number, default: null },
  adminNote:    { type: String, default: '' },
  progress:     { type: Number, default: 0, min: 0, max: 100 },
  updatedBy:    { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Quote', quoteSchema);