const MemoryCard = require('../models/MemoryCard');
const GuestbookEntry = require('../models/GuestbookEntry');

exports.listPublic = async (req, res, next) => {
  try { const entries = await GuestbookEntry.find({ cardId: req.params.cardId, approved: true }).sort('-createdAt'); res.json({ entries }); } catch (error) { next(error); }
};
exports.create = async (req, res, next) => {
  try {
    const card = await MemoryCard.findById(req.params.cardId);
    if (!card || !card.isPublic) return res.status(404).json({ message: 'Memory not found.' });
    const entry = await GuestbookEntry.create({ cardId: card._id, authorName: req.body.authorName, message: req.body.message });
    res.status(201).json({ entry, message: 'Thank you. Your tribute is awaiting approval.' });
  } catch (error) { next(error); }
};
exports.listMine = async (req, res, next) => {
  try {
    const card = await MemoryCard.findOne({ _id: req.params.cardId, ownerId: req.user._id });
    if (!card) return res.status(404).json({ message: 'Memory not found.' });
    const entries = await GuestbookEntry.find({ cardId: card._id }).sort('-createdAt'); res.json({ entries });
  } catch (error) { next(error); }
};
exports.moderate = async (req, res, next) => {
  try {
    const entry = await GuestbookEntry.findById(req.params.entryId);
    const card = entry && await MemoryCard.findOne({ _id: entry.cardId, ownerId: req.user._id });
    if (!card) return res.status(404).json({ message: 'Tribute not found.' });
    entry.approved = Boolean(req.body.approved); entry.moderationStatus = entry.approved ? 'approved' : 'hidden'; await entry.save(); res.json({ entry });
  } catch (error) { next(error); }
};
exports.remove = async (req, res, next) => {
  try {
    const entry = await GuestbookEntry.findById(req.params.entryId);
    const card = entry && await MemoryCard.findOne({ _id: entry.cardId, ownerId: req.user._id });
    if (!card) return res.status(404).json({ message: 'Tribute not found.' });
    await entry.deleteOne(); res.status(204).send();
  } catch (error) { next(error); }
};

exports.report = async (req, res, next) => {
  try {
    const entry = await GuestbookEntry.findById(req.params.entryId);
    if (!entry) return res.status(404).json({ message: 'Tribute not found.' });
    entry.reported = true; entry.reportReason = req.body.reason || ''; entry.reportedAt = new Date();
    await entry.save(); res.json({ message: 'Thank you. This tribute has been reported for review.' });
  } catch (error) { next(error); }
};
