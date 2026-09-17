const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  clientName:  { type: String, required: true },
  origin:      { type: String, required: true },
  destination: { type: String, required: true },
  status:      { type: String, enum: ['En attente', 'En transit', 'Dédouanement', 'Livré'], default: 'En attente' },
  progress:    { type: Number, default: 0, min: 0, max: 100 },
  eta:         { type: String, default: '' },
  cargo:       { type: String, default: '' },
  notes:       { type: String, default: '' },
  updatedBy:   { type: String, default: '' },
}, { timestamps: true });

// Auto-calculate status and progress based on ETA
shipmentSchema.methods.autoUpdateStatus = function () {
  if (!this.eta) return;

  const today   = new Date();
  today.setHours(0, 0, 0, 0);
  const etaDate = new Date(this.eta);
  etaDate.setHours(0, 0, 0, 0);

  const daysUntilEta = Math.ceil((etaDate - today) / (1000 * 60 * 60 * 24));
  const createdDate  = new Date(this.createdAt);
  const totalDays    = Math.ceil((etaDate - createdDate) / (1000 * 60 * 60 * 24));
  const elapsed      = Math.ceil((today - createdDate) / (1000 * 60 * 60 * 24));

  if (daysUntilEta < 0) {
    // ETA passed → Livré
    this.status   = 'Livré';
    this.progress = 100;
  } else if (daysUntilEta <= 3) {
    // 3 days before ETA → Dédouanement
    this.status   = 'Dédouanement';
    this.progress = Math.min(90, 70 + Math.round((3 - daysUntilEta) / 3 * 20));
  } else if (daysUntilEta <= 10) {
    // 10 days before ETA → En transit
    this.status   = 'En transit';
    this.progress = Math.min(70, 30 + Math.round((10 - daysUntilEta) / 7 * 40));
  } else {
    // Far from ETA → En attente
    this.status   = 'En attente';
    const rawProgress = totalDays > 0 ? Math.round((elapsed / totalDays) * 30) : 5;
    this.progress = Math.max(5, Math.min(30, rawProgress));
  }
};

module.exports = mongoose.model('Shipment', shipmentSchema);