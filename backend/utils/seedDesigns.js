require('dotenv').config();
const mongoose = require('mongoose');
const HeadstoneDesign = require('../models/HeadstoneDesign');

const designs = [
  { name: 'Floral Heart', category: 'Heart', imageUrl: '/headstone-designs/01_heart_headstone.jpg?v=cropped', tags: ['heart', 'floral', 'grey granite'], sortOrder: 10 },
  { name: 'Classic Bronze Urn', category: 'Urn', imageUrl: '/headstone-designs/02_bronze_urn.jpg?v=cropped', tags: ['urn', 'bronze', 'classic'], sortOrder: 20 },
  { name: 'Red Granite Arch', category: 'Traditional', imageUrl: '/headstone-designs/04_red_arch_headstone.jpg?v=cropped', tags: ['arch', 'red granite', 'traditional'], sortOrder: 40 },
  { name: 'Garden Fairy', category: 'Sculptural', imageUrl: '/headstone-designs/05_fairy_headstone.jpg?v=cropped', tags: ['fairy', 'garden', 'green granite'], sortOrder: 50 },
  { name: 'Open Book', category: 'Book', imageUrl: '/headstone-designs/06_open_book_headstone.jpg?v=cropped', tags: ['book', 'grey granite', 'traditional'], sortOrder: 60 },
  { name: 'Rose Granite Arch', category: 'Traditional', imageUrl: '/headstone-designs/07_pink_arch_headstone.jpg?v=cropped', tags: ['arch', 'rose granite', 'traditional'], sortOrder: 70 }
];

async function seedDesigns() {
  await mongoose.connect(process.env.MONGODB_URI);

  try {
    // Reuse existing IDs so memorials with a selected design keep a valid
    // reference while the old library is replaced by the new collection.
    const existingDesigns = await HeadstoneDesign.find().sort('sortOrder category name');

    const existingByName = new Map(existingDesigns.map((design) => [design.name, design]));

    for (const design of designs) {
      const existing = existingByName.get(design.name);
      if (existing) {
        await HeadstoneDesign.replaceOne(
          { _id: existing._id },
          { ...design, isActive: true },
          { runValidators: true }
        );
      } else {
        await HeadstoneDesign.create(design);
      }
    }

    const designNames = new Set(designs.map((design) => design.name));
    const obsoleteIds = existingDesigns
      .filter((design) => !designNames.has(design.name))
      .map((design) => design._id);
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
