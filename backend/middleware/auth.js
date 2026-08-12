const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ') && req.headers.authorization.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication required.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ message: 'Account no longer exists.' });
    if (req.user.isSuspended) return res.status(403).json({ message: 'This account has been suspended.' });
    next();
  } catch (_) {
    res.status(401).json({ message: 'Invalid or expired access token.' });
  }
};

exports.requireOwner = async (req, res, next) => {
  const card = req.card;
  if (!card.ownerId.equals(req.user._id)) return res.status(403).json({ message: 'You do not own this memory.' });
  next();
};

exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Administrator access required.' });
  next();
};
