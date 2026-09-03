import cors from 'cors';
import express from 'express';
import type { RequestHandler } from 'express';
import { rateLimit } from 'express-rate-limit';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import helmetPackage, { type HelmetOptions } from 'helmet';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.js';
import { Memorial } from './models/Memorial.js';
import { adminRouter } from './routes/adminRoutes.js';
import { authRouter } from './routes/authRoutes.js';
import { memorialRouter } from './routes/memorialRoutes.js';
import { uploadRouter } from './routes/uploadRoutes.js';
import { processYearlyReminders } from './services/reminderService.js';
import { asyncHandler } from './utils/asyncHandler.js';

// Helmet 8 publishes separate ESM/CJS declarations. Vercel's Express builder can
// resolve the default import as a module namespace even though it is callable at
// runtime, so keep that compatibility cast at this package boundary.
const createHelmetMiddleware = helmetPackage as unknown as (options?: Readonly<HelmetOptions>) => RequestHandler;

export const app = express();
app.use(createHelmetMiddleware({ contentSecurityPolicy: { directives: { imgSrc: ["'self'", 'data:', 'https:'], styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'], fontSrc: ["'self'", 'https://fonts.gstatic.com'] } } }));
app.use(cors({ origin: env.webUrl.split(',').map((value) => value.trim()) }));
app.use(express.json({ limit: '1mb' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-8' }));
app.get('/api/cron/reminders', asyncHandler(async (req, res) => {
  if (!env.cronSecret || req.get('authorization') !== `Bearer ${env.cronSecret}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  await connectDatabase();
  const reminders = await processYearlyReminders();
  res.json({ processed: reminders.length });
}));
app.use('/api', async (_req, _res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    next(error);
  }
});
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRouter);
app.use('/api/memorials', memorialRouter);
app.use('/api/admin', adminRouter);
app.use('/api/upload', uploadRouter);

const webDist = fileURLToPath(new URL('../../web/dist', import.meta.url));
const webIndex = path.join(webDist, 'index.html');
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]!);

if (process.env.VERCEL !== '1') {
  app.get('/memorial/:slug', asyncHandler(async (req, res) => {
    const memorial = await Memorial.findOne({ slug: String(req.params.slug), status: 'approved' });
    if (!memorial) return res.status(404).send('Memorial not found');
    const title = `In Loving Memory of ${memorial.fullName}`;
    const canonicalUrl = `${env.webUrl.replace(/\/$/, '')}/memorial/${memorial.slug}`;
    const meta = `<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(memorial.message)}"><meta property="og:type" content="website"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(memorial.message)}"><meta property="og:image" content="${escapeHtml(memorial.photo)}"><meta property="og:url" content="${escapeHtml(canonicalUrl)}">`;
    const html = (await readFile(webIndex, 'utf8')).replace('<title>Evermore Memorials</title>', meta);
    res.type('html').send(html);
  }));
  app.use(express.static(webDist));
  app.get(/^\/(?:admin(?:\/.*)?)?$/, asyncHandler(async (_req, res) => res.type('html').send(await readFile(webIndex, 'utf8'))));
}
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

export default app;
