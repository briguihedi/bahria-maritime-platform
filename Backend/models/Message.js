const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  firstName:    { type: String, required: true },
  lastName:     { type: String, default: '' },
  email:        { type: String, required: true },
  company:      { type: String, default: '' },
  service:      { type: String, default: '' },
  message:      { type: String, required: true },
  read:         { type: Boolean, default: false },
  treated:      { type: Boolean, default: false },
  employeeNote: { type: String, default: '' },
  treatedBy:    { type: String, default: '' },
  treatedAt:    { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);