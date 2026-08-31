const mongoose = require('mongoose');

const memoryCardSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 140, index: 'text' },
  bio: { type: String, trim: true, maxlength: 3000 },
  birthDate: Date,
  deathDate: Date,
  epitaph: { type: String, trim: true, maxlength: 500 },
  // Photos are stored as compressed image data URLs so no external object
  // storage provider is required. The limit keeps documents/API payloads safe.
  imageUrl: { type: String, trim: true, maxlength: [850000, 'Photo is too large.'] },
  mediaReported: { type: Boolean, default: false, index: true },
  mediaReportReason: { type: String, trim: true, maxlength: 500 },
  mediaReportedAt: Date,
  mediaModerationStatus: { type: String, enum: ['clear', 'hidden', 'removed'], default: 'clear', index: true },
  headstoneDesignId: { type: mongoose.Schema.Types.ObjectId, ref: 'HeadstoneDesign' },
  isPublic: { type: Boolean, default: true, index: true },
  shareToken: { type: String, unique: true, sparse: true },
  reminderDate: { type: String, trim: true }, // MM-DD for annual reminders
  reminderPhone: { type: String, trim: true }
}, { timestamps: true });

memoryCardSchema.index({ name: 'text', bio: 'text' });
module.exports = mongoose.model('MemoryCard', memoryCardSchema);
