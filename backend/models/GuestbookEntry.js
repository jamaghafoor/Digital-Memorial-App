const mongoose = require('mongoose');

const guestbookEntrySchema = new mongoose.Schema({
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'MemoryCard', required: true, index: true },
  authorName: { type: String, required: true, trim: true, maxlength: 100 },
  message: { type: String, required: true, trim: true, maxlength: 1000 },
  approved: { type: Boolean, default: false, index: true },
  moderationStatus: { type: String, enum: ['pending', 'approved', 'hidden', 'removed'], default: 'pending', index: true },
  reported: { type: Boolean, default: false, index: true },
  reportReason: { type: String, trim: true, maxlength: 500 },
  reportedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('GuestbookEntry', guestbookEntrySchema);
