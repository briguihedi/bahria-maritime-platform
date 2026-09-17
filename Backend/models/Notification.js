const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId:  { type: String, required: true },
  type:    { type: String, enum: ['success', 'info', 'warning'], default: 'info' },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  read:    { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);