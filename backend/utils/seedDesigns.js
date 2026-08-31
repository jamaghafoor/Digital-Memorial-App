require('dotenv').config();
const mongoose = require('mongoose');
const HeadstoneDesign = require('../models/HeadstoneDesign');

const designs = [
  { name: 'Floral Heart', category: 'Heart', imageUrl: '/headstone-designs/01_heart_headstone.jpg', tags: ['heart', 'floral', 'grey granite'], sortOrder: 10 },
  { name: 'Classic Bronze Urn', category: 'Urn', imageUrl: '/headstone-designs/03_bronze_urn.jpg', tags: ['urn', 'bronze', 'classic'], sortOrder: 20 },
  { name: 'Bronze Memorial Vase', category: 'Urn', imageUrl: '/headstone-designs/03_bronze_vase.jpg', tags: ['vase', 'bronze', 'classic'], sortOrder: 30 },
  { name: 'Red Granite Arch', category: 'Traditional', imageUrl: '/headstone-designs/04_red_arch_headstone.jpg', tags: ['arch', 'red granite', 'traditional'], sortOrder: 40 },
  { name: 'Garden Fairy', category: 'Sculptural', imageUrl: '/headstone-designs/05_fairy_headstone.jpg', tags: ['fairy', 'garden', 'green granite'], sortOrder: 50 },
  { name: 'Open Book', category: 'Book', imageUrl: '/headstone-designs/06_open_book_headstone.jpg', tags: ['book', 'grey granite', 'traditional'], sortOrder: 60 },
  { name: 'Rose Granite Arch', category: 'Traditional', imageUrl: '/headstone-designs/07_pink_arch_headstone.jpg', tags: ['arch', 'rose granite', 'traditional'], sortOrder: 70 }
];

async function seedDesigns() {
  await mongoose.connect(process.env.MONGODB_URI);

  try {
    // Reuse existing IDs so memorials with a selected design keep a valid
    // reference while the old library is replaced by the new collection.
    const existingDesigns = await HeadstoneDesign.find().sort('sortOrder category name');

    for (let index = 0; index < designs.length; index += 1) {
      const existing = existingDesigns[index];
      if (existing) {
        await HeadstoneDesign.replaceOne(
          { _id: existing._id },
          { ...designs[index], isActive: true },
          { runValidators: true }
        );
      } else {
        await HeadstoneDesign.create(designs[index]);
      }
    }

    const obsoleteIds = existingDesigns.slice(designs.length).map((design) => design._id);
    if (obsoleteIds.length) await HeadstoneDesign.deleteMany({ _id: { $in: obsoleteIds } });

    console.log(`Seeded ${designs.length} headstone designs.`);
  } finally {
    await mongoose.disconnect();
  }
}

seedDesigns().catch((error) => {
  console.error('Unable to seed headstone designs:', error.message);
  process.exitCode = 1;
});
