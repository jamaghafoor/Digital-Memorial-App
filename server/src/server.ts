import { app } from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { startReminderJob } from './services/reminderService.js';

const start = async () => {
  await connectDatabase();
  startReminderJob();
  app.listen(env.port, () => console.log(`API listening on http://localhost:${env.port}`));
};
void start().catch((error) => { console.error(error); process.exit(1); });
