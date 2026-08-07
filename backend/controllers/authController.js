const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signTokens = (user) => ({
  accessToken: jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' }),
  refreshToken: jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' })
});
const safeUser = (user) => ({ id: user._id, email: user.email, name: user.name, preferredLanguage: user.preferredLanguage });

exports.register = async (req, res, next) => {
  try {
    const { email, password, name, preferredLanguage } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
    const user = await User.create({ email, password, name, preferredLanguage });
    const tokens = signTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });
    res.status(201).json({ user: safeUser(user), ...tokens });
  } catch (error) { next(error); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() }).select('+password +refreshToken');
    if (!user || !(await user.comparePassword(password || ''))) return res.status(401).json({ message: 'Incorrect email or password.' });
    const tokens = signTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });
    res.json({ user: safeUser(user), ...tokens });
  } catch (error) { next(error); }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) return res.status(401).json({ message: 'Refresh token is invalid.' });
    const tokens = signTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });
    res.json({ user: safeUser(user), ...tokens });
  } catch (error) { next(error); }
};

exports.logout = async (req, res, next) => {
  try { req.user.refreshToken = undefined; await req.user.save({ validateBeforeSave: false }); res.status(204).send(); } catch (error) { next(error); }
};

exports.me = async (req, res) => res.json({ user: safeUser(req.user) });

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, preferredLanguage } = req.body;
    if (name !== undefined) req.user.name = name;
    if (preferredLanguage !== undefined) req.user.preferredLanguage = preferredLanguage;
    await req.user.save();
    res.json({ user: safeUser(req.user) });
  } catch (error) { next(error); }
};
