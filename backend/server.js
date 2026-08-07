require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { startReminderJob } = require('./utils/reminders');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cards', require('./routes/cardRoutes'));
app.use('/api/designs', require('./routes/designRoutes'));
app.use('/api/guestbook', require('./routes/guestbookRoutes'));
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => { console.log('MongoDB connected.'); startReminderJob(); app.listen(port, () => console.log(`API listening on :${port}`)); })
  .catch((error) => { console.error('MongoDB connection failed:', error.message); process.exit(1); });
