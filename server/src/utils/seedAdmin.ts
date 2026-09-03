import bcrypt from 'bcryptjs';
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import { User } from '../models/User.js';

const run = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 8) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 8 characters)');
  await connectDatabase();
  await User.findOneAndUpdate({ email: email.toLowerCase() }, { name: 'Administrator', email, password: await bcrypt.hash(password, 12), role: 'ADMIN' }, { upsert: true, runValidators: true });
  console.log(`Admin ready: ${email}`);
  await mongoose.disconnect();
};
void run().catch((error) => { console.error(error); process.exit(1); });
