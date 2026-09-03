import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

const publicUser = (user: any) => ({ id: user.id, name: user.name, email: user.email, role: user.role, preferredLanguage: user.preferredLanguage });
const tokenFor = (user: any) => jwt.sign({ userId: user.id, role: user.role }, env.jwtSecret, { expiresIn: '7d' });

export const register = async (req: Request, res: Response) => {
  const { name, email, password, preferredLanguage = 'en' } = req.body;
  if (!name || !email || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ message: 'Name, valid email, and password of at least 8 characters are required' });
  }
  if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ message: 'Email is already registered' });
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 12), preferredLanguage });
  res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email ?? '').toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(String(password ?? ''), user.password))) return res.status(401).json({ message: 'Invalid email or password' });
  res.json({ token: tokenFor(user), user: publicUser(user) });
};
