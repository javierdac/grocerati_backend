const mongoose = require('mongoose');
const crypto = require('crypto');

const listSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  icon: { type: String, default: 'cart-outline' },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  invite_code: { type: String, unique: true },
  created_at: { type: Date, default: Date.now },
});

listSchema.pre('save', function (next) {
  if (!this.invite_code) {
    this.invite_code = crypto.randomBytes(4).toString('hex').toUpperCase();
  }
  next();
});

module.exports = mongoose.model('List', listSchema);
