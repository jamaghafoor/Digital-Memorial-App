require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { startReminderJob } = require('./utils/reminders');

const app = express();
const allowedOrigins = new Set([
  'http://localhost:3000',
  ...(process.env.FRONTEND_URL || '').split(','),
  ...(process.env.CORS_ORIGINS || '').split(',')
].map((origin) => origin.trim()).filter(Boolean));

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin) || /^https:\/\/[^/]+\.ngrok(?:-free)?\.(?:app|dev)$/i.test(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} is not allowed by CORS.`));
  }
}));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cards', require('./routes/cardRoutes'));
app.use('/api/designs', require('./routes/designRoutes'));
app.use('/api/guestbook', require('./routes/guestbookRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => { console.log('MongoDB connected.'); startReminderJob(); app.listen(port, () => console.log(`API listening on :${port}`)); })
  .catch((error) => { console.error('MongoDB connection failed:', error.message); process.exit(1); });
