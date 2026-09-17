const mongoose = require('mongoose');

const directMessageSchema = new mongoose.Schema({
  userId:    { type: String, required: true },
  userEmail: { type: String, required: true },
  userName:  { type: String, default: '' },
  content:   { type: String, required: true },
  subject:   { type: String, default: 'Question générale' },
  from:      { type: String, enum: ['client', 'team'], required: true },
  read:      { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('DirectMessage', directMessageSchema);