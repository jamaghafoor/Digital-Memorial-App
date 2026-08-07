const mongoose = require('mongoose');

const headstoneDesignSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true, index: true }
}, { timestamps: true });

module.exports = mongoose.model('HeadstoneDesign', headstoneDesignSchema);
