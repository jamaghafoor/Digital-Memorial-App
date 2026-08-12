const cron = require('node-cron');
const MemoryCard = require('../models/MemoryCard');
const ReminderLog = require('../models/ReminderLog');

const md = (date) => `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const sendReminders = async () => {
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const cards = await MemoryCard.find({ reminderDate: { $in: [md(today), md(tomorrow)] }, reminderPhone: { $exists: true, $ne: '' } });
  if (!cards.length) return;
  const logs = await Promise.all(cards.map((card) => ReminderLog.create({ cardId: card._id, recipient: card.reminderPhone, reminderDate: card.reminderDate, status: 'scheduled' })));
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_FROM_NUMBER) {
    console.log(`Reminder SMS skipped: Twilio is not configured (${cards.length} due).`);
    await Promise.all(logs.map((log) => { log.status = 'pending'; return log.save(); }));
    return;
  }
  const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  await Promise.all(cards.map(async (card, index) => {
    try {
      const message = await client.messages.create({ to: card.reminderPhone, from: process.env.TWILIO_FROM_NUMBER, body: `Memory Card reminder: ${card.name}'s anniversary is ${card.reminderDate === md(today) ? 'today' : 'tomorrow'}.` });
      logs[index].status = 'sent'; logs[index].providerId = message.sid;
    } catch (error) { logs[index].status = 'failed'; logs[index].error = error.message; }
    await logs[index].save();
  }));
};

exports.startReminderJob = () => {
  cron.schedule('5 9 * * *', () => sendReminders().catch((error) => console.error('Reminder job failed:', error.message)));
  console.log('Annual reminder job scheduled for 09:05 daily.');
};
