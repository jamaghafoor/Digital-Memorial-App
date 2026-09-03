import cron from 'node-cron';
import { Memorial } from '../models/Memorial.js';

export const processYearlyReminders = async (today = new Date()) => {
  const candidates = await Memorial.find({ reminderEnabled: true, status: 'approved' }).populate('userId', 'name email');
  const matches = candidates.filter((item) => item.deathDate.getUTCMonth() === today.getUTCMonth() && item.deathDate.getUTCDate() === today.getUTCDate());
  // Delivery intentionally stays behind this seam. Add FCM here once mobile device tokens and Firebase credentials are available.
  matches.forEach((item) => console.log(`Reminder due: Today we remember ${item.fullName} ❤️ (owner: ${item.userId})`));
  return matches;
};

export const startReminderJob = () => cron.schedule('0 8 * * *', () => void processYearlyReminders().catch(console.error), { timezone: 'UTC' });
