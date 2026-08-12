const mongoose = require('mongoose');

const reminderLogSchema = new mongoose.Schema({
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'MemoryCard', required: true, index: true },
  recipient: { type: String, required: true },
  reminderDate: { type: String, required: true },
  scheduledFor: { type: Date, default: Date.now, index: true },
  status: { type: String, enum: ['scheduled', 'sent', 'failed', 'pending'], default: 'pending', index: true },
  providerId: String,
  error: { type: String, maxlength: 1000 }
}, { timestamps: true });

module.exports = mongoose.model('ReminderLog', reminderLogSchema);
