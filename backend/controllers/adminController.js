const User = require('../models/User');
const GuestbookEntry = require('../models/GuestbookEntry');
const MemoryCard = require('../models/MemoryCard');
const HeadstoneDesign = require('../models/HeadstoneDesign');
const ReminderLog = require('../models/ReminderLog');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const pageOptions = (query) => ({ limit: Math.min(Math.max(Number(query.limit) || 50, 1), 100), skip: Math.max(Number(query.skip) || 0, 0) });
const safeUser = (user) => ({ id: user._id, name: user.name, email: user.email, preferredLanguage: user.preferredLanguage, role: user.role, isSuspended: user.isSuspended, suspendedAt: user.suspendedAt, suspensionReason: user.suspensionReason, createdAt: user.createdAt });

exports.overview = async (req, res, next) => {
  try {
    const [users, suspendedUsers, pendingTributes, reportedTributes, reportedMedia, reminderCounts] = await Promise.all([
      User.countDocuments(), User.countDocuments({ isSuspended: true }), GuestbookEntry.countDocuments({ moderationStatus: 'pending' }), GuestbookEntry.countDocuments({ reported: true, moderationStatus: { $ne: 'removed' } }), MemoryCard.countDocuments({ mediaReported: true, mediaModerationStatus: { $ne: 'removed' } }), ReminderLog.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
    ]);
    res.json({ users, suspendedUsers, pendingTributes, reportedTributes, reportedMedia, reminders: reminderCounts.reduce((result, item) => ({ ...result, [item._id]: item.count }), {}) });
  } catch (error) { next(error); }
};

exports.listUsers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.q) { const expression = new RegExp(escapeRegex(req.query.q), 'i'); filter.$or = [{ name: expression }, { email: expression }]; }
    if (req.query.status === 'suspended') filter.isSuspended = true;
    if (req.query.status === 'active') filter.isSuspended = false;
    const { limit, skip } = pageOptions(req.query);
    const [users, total] = await Promise.all([User.find(filter).sort('-createdAt').skip(skip).limit(limit), User.countDocuments(filter)]);
    res.json({ users: users.map(safeUser), total });
  } catch (error) { next(error); }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const { name, email, preferredLanguage, role } = req.body;
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email.toLowerCase();
    if (preferredLanguage !== undefined) user.preferredLanguage = preferredLanguage;
    if (role !== undefined && req.user._id.toString() !== user._id.toString()) user.role = role;
    await user.save(); res.json({ user: safeUser(user) });
  } catch (error) { next(error); }
};

exports.setUserSuspension = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (req.user._id.toString() === user._id.toString()) return res.status(400).json({ message: 'You cannot suspend your own account.' });
    user.isSuspended = Boolean(req.body.isSuspended); user.suspendedAt = user.isSuspended ? new Date() : undefined; user.suspensionReason = user.isSuspended ? (req.body.reason || '') : undefined;
    if (user.isSuspended) user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false }); res.json({ user: safeUser(user) });
  } catch (error) { next(error); }
};

exports.listModeration = async (req, res, next) => {
  try {
    const filter = req.query.type === 'media' ? { mediaReported: true } : { reported: true };
    if (req.query.type === 'tribute') filter.reported = true;
    const { limit, skip } = pageOptions(req.query);
    if (req.query.type === 'media') {
      const [items, total] = await Promise.all([MemoryCard.find(filter).select('name imageUrl mediaReportReason mediaReportedAt mediaModerationStatus ownerId').populate('ownerId', 'name email').sort('-mediaReportedAt').skip(skip).limit(limit), MemoryCard.countDocuments(filter)]);
      return res.json({ items, total });
    }
    const [items, total] = await Promise.all([GuestbookEntry.find(filter).populate('cardId', 'name').sort('-reportedAt').skip(skip).limit(limit), GuestbookEntry.countDocuments(filter)]);
    res.json({ items, total });
  } catch (error) { next(error); }
};

exports.moderateTribute = async (req, res, next) => {
  try {
    const entry = await GuestbookEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Tribute not found.' });
    const status = req.body.status;
    if (!['approved', 'hidden', 'removed'].includes(status)) return res.status(400).json({ message: 'Invalid moderation status.' });
    entry.moderationStatus = status; entry.approved = status === 'approved'; entry.reported = false;
    await entry.save(); res.json({ entry });
  } catch (error) { next(error); }
};

exports.moderateMedia = async (req, res, next) => {
  try {
    const card = await MemoryCard.findById(req.params.id);
    if (!card) return res.status(404).json({ message: 'Memory not found.' });
    const status = req.body.status;
    if (!['clear', 'hidden', 'removed'].includes(status)) return res.status(400).json({ message: 'Invalid moderation status.' });
    card.mediaModerationStatus = status; card.mediaReported = false;
    if (status === 'removed') card.imageUrl = '';
    await card.save(); res.json({ card });
  } catch (error) { next(error); }
};

exports.listDesigns = async (req, res, next) => { try { res.json({ designs: await HeadstoneDesign.find().sort('sortOrder category name') }); } catch (error) { next(error); } };
exports.listReminders = async (req, res, next) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const { limit, skip } = pageOptions(req.query);
    const [logs, logTotal, scheduledCards] = await Promise.all([
      ReminderLog.find(filter).populate('cardId', 'name').sort('-scheduledFor').skip(skip).limit(limit),
      ReminderLog.countDocuments(filter),
      (!req.query.status || req.query.status === 'scheduled') ? MemoryCard.find({ reminderDate: { $type: 'string', $ne: '' }, reminderPhone: { $type: 'string', $ne: '' } }).select('name reminderDate reminderPhone').limit(limit) : []
    ]);
    const now = new Date();
    const scheduled = scheduledCards.map((card) => {
      const [month, day] = card.reminderDate.split('-').map(Number);
      const scheduledFor = new Date(now.getFullYear(), month - 1, day, 9, 5);
      if (scheduledFor < now) scheduledFor.setFullYear(scheduledFor.getFullYear() + 1);
      return { _id: `scheduled-${card._id}`, cardId: { _id: card._id, name: card.name }, recipient: card.reminderPhone, reminderDate: card.reminderDate, scheduledFor, status: 'scheduled' };
    });
    res.json({ reminders: req.query.status === 'scheduled' ? scheduled : [...scheduled, ...logs].slice(0, limit), total: logTotal + scheduled.length });
  } catch (error) { next(error); }
};
