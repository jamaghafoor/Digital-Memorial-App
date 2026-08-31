const crypto = require('crypto');
const QRCode = require('qrcode');
const MemoryCard = require('../models/MemoryCard');
const GuestbookEntry = require('../models/GuestbookEntry');

const MAX_STORED_IMAGE_BYTES = 600 * 1024;
const IMAGE_DATA_URL = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/;

const validateImage = (value) => {
  if (!value) return;
  if (typeof value !== 'string') {
    const error = new Error('Photo data is invalid.');
    error.statusCode = 400;
    throw error;
  }
  // Keep previously saved external image URLs working when an older memory is
  // edited. New photos from the editor are always stored as data URLs.
  if (!value.startsWith('data:')) return;

  const match = value.match(IMAGE_DATA_URL);
  if (!match) {
    const error = new Error('Photo must be a JPEG, PNG, or WebP image.');
    error.statusCode = 400;
    throw error;
  }

  const imageBytes = Buffer.from(match[2], 'base64').length;
  if (!imageBytes || imageBytes > MAX_STORED_IMAGE_BYTES) {
    const error = new Error('Photo is too large. Please upload a smaller image.');
    error.statusCode = 413;
    throw error;
  }
};

const publicUrl = (card) => `${process.env.FRONTEND_URL || 'http://localhost:3000'}/memory/${card._id}`;
const withQr = async (card) => {
  const result = card.toObject();
  if (result.mediaModerationStatus && result.mediaModerationStatus !== 'clear') result.imageUrl = '';
  return { ...result, publicUrl: publicUrl(card), qrCode: await QRCode.toDataURL(publicUrl(card), { width: 360, margin: 2 }) };
};
const getCard = async (id) => MemoryCard.findById(id).populate('headstoneDesignId');

exports.listMine = async (req, res, next) => {
  try { const cards = await MemoryCard.find({ ownerId: req.user._id }).populate('headstoneDesignId').sort('-createdAt'); res.json({ cards }); } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    validateImage(req.body.imageUrl);
    const card = await MemoryCard.create({ ...req.body, ownerId: req.user._id, shareToken: crypto.randomBytes(20).toString('hex') });
    res.status(201).json({ card: await withQr(await card.populate('headstoneDesignId')) });
  } catch (error) { next(error); }
};

exports.publicCard = async (req, res, next) => {
  try {
    const card = await getCard(req.params.id);
    if (!card || (!card.isPublic && req.query.token !== card.shareToken)) return res.status(404).json({ message: 'This memory is unavailable.' });
    res.json({ card: await withQr(card) });
  } catch (error) { next(error); }
};

exports.getMine = async (req, res, next) => {
  try {
    const card = await getCard(req.params.id);
    if (!card) return res.status(404).json({ message: 'Memory not found.' });
    if (!card.ownerId.equals(req.user._id)) return res.status(403).json({ message: 'You do not own this memory.' });
    res.json({ card: await withQr(card) });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const card = await MemoryCard.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!card) return res.status(404).json({ message: 'Memory not found.' });
    if (req.body.imageUrl !== undefined) validateImage(req.body.imageUrl);
    const allowed = ['name', 'bio', 'birthDate', 'deathDate', 'epitaph', 'imageUrl', 'headstoneDesignId', 'isPublic', 'reminderDate', 'reminderPhone'];
    allowed.forEach((field) => { if (req.body[field] !== undefined) card[field] = req.body[field]; });
    await card.save();
    res.json({ card: await withQr(await card.populate('headstoneDesignId')) });
  } catch (error) { next(error); }
};

exports.remove = async (req, res, next) => {
  try {
    const card = await MemoryCard.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
    if (!card) return res.status(404).json({ message: 'Memory not found.' });
    await GuestbookEntry.deleteMany({ cardId: card._id });
    res.status(204).send();
  } catch (error) { next(error); }
};

exports.search = async (req, res, next) => {
  try {
    const { q, bornAfter, bornBefore, diedAfter, diedBefore } = req.query;
    const filter = { isPublic: true };
    if (q) filter.name = { $regex: q, $options: 'i' };
    if (bornAfter || bornBefore) filter.birthDate = { ...(bornAfter && { $gte: new Date(bornAfter) }), ...(bornBefore && { $lte: new Date(bornBefore) }) };
    if (diedAfter || diedBefore) filter.deathDate = { ...(diedAfter && { $gte: new Date(diedAfter) }), ...(diedBefore && { $lte: new Date(diedBefore) }) };
    const cards = await MemoryCard.find(filter).populate('headstoneDesignId').sort('-createdAt').limit(50);
    res.json({ cards });
  } catch (error) { next(error); }
};

exports.reportMedia = async (req, res, next) => {
  try {
    const card = await MemoryCard.findById(req.params.id);
    if (!card || !card.imageUrl) return res.status(404).json({ message: 'Media not found.' });
    card.mediaReported = true; card.mediaReportReason = req.body.reason || ''; card.mediaReportedAt = new Date();
    await card.save(); res.json({ message: 'Thank you. This media has been reported for review.' });
  } catch (error) { next(error); }
};
