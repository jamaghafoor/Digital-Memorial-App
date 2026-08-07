const mongoose = require('mongoose');

const memoryCardSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 140, index: 'text' },
  bio: { type: String, trim: true, maxlength: 3000 },
  birthDate: Date,
  deathDate: Date,
  epitaph: { type: String, trim: true, maxlength: 500 },
  imageUrl: { type: String, trim: true },
  headstoneDesignId: { type: mongoose.Schema.Types.ObjectId, ref: 'HeadstoneDesign' },
  isPublic: { type: Boolean, default: true, index: true },
  shareToken: { type: String, unique: true, sparse: true },
  reminderDate: { type: String, trim: true }, // MM-DD for annual reminders
  reminderPhone: { type: String, trim: true }
}, { timestamps: true });

memoryCardSchema.index({ name: 'text', bio: 'text' });
module.exports = mongoose.model('MemoryCard', memoryCardSchema);
