const mongoose = require('mongoose');

const headstoneDesignSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true, index: true },
  tags: [{ type: String, trim: true, maxlength: 40 }],
  sortOrder: { type: Number, default: 0, index: true },
  isActive: { type: Boolean, default: true, index: true }
}, { timestamps: true });

module.exports = mongoose.model('HeadstoneDesign', headstoneDesignSchema);
