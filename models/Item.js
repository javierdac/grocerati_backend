const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  list_id: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
  name: { type: String, required: true, trim: true },
  quantity: { type: Number, default: 1 },
  completed: { type: Boolean, default: false },
  added_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  completed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Item', itemSchema);
