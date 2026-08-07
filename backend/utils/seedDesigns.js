require('dotenv').config();
const mongoose = require('mongoose');
const HeadstoneDesign = require('../models/HeadstoneDesign');

const designs = [
  { name: 'Classic Arch', category: 'Traditional', imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80' },
  { name: 'Garden Stone', category: 'Nature', imageUrl: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=800&q=80' },
  { name: 'Modern Tribute', category: 'Contemporary', imageUrl: 'https://images.unsplash.com/photo-1518014174518-3418f8cce6d6?auto=format&fit=crop&w=800&q=80' }
];
mongoose.connect(process.env.MONGODB_URI).then(async () => { await HeadstoneDesign.deleteMany({}); await HeadstoneDesign.insertMany(designs); console.log('Seeded headstone designs.'); await mongoose.disconnect(); });
