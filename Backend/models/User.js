const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName:         { type: String, required: true },
  lastName:          { type: String, default: '' },
  email:             { type: String, required: true, unique: true, lowercase: true },
  password:          { type: String, required: true },
  company:           { type: String, default: '' },
  role:              { type: String, enum: ['client', 'admin'], default: 'client' },
  active:            { type: Boolean, default: true },
  phone:             { type: String, default: '' },
  resetPasswordToken:   { type: String,  default: null },
  resetPasswordExpires: { type: Number,  default: null },
  isVerified:        { type: Boolean, default: false },
  verificationToken: { type: String, default: null },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

module.exports = mongoose.model('User', userSchema);