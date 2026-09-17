const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  priority:   { type: String, enum: ['haute', 'normale', 'basse'], default: 'normale' },
  status:     { type: String, enum: ['À faire', 'En cours', 'Terminé'], default: 'À faire' },
  assignedTo: { type: String, required: true },
  dueDate:    { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);