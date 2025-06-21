const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  full_name: { type: String },
  avatar: { type: String },
  role: { type: String, enum: ['user', 'admin', 'editor', 'staff'], default: 'user' },
  status: { type: Number, default: 0 }, // 0: inactive, 1: active
  phone: { type: String },
  gender: { type: String, enum: ['Nam', 'Nữ', 'Khác'], default: 'Nam' },
  dob: { type: Date },
  address: { type: String },
  deleted: { type: Boolean, default: false },
  deleted_at: { type: Date },
  last_login: { type: Date },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },

  email_verify_token: { type: String, default: null },
  email_verified: { type: Boolean, default: false }
});

userSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
