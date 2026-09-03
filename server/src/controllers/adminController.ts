import type { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import { Memorial } from '../models/Memorial.js';
import { User } from '../models/User.js';
import { uniqueSlug } from './memorialController.js';

export const listMemorials = async (req: Request, res: Response) => {
  const status = ['pending', 'approved', 'rejected'].includes(String(req.query.status)) ? req.query.status : undefined;
  const userId = isValidObjectId(String(req.query.userId ?? '')) ? String(req.query.userId) : undefined;
  res.json(await Memorial.find({ ...(status ? { status } : {}), ...(userId ? { userId } : {}) }).populate('userId', 'name email').sort({ createdAt: -1 }));
};

const findMemorial = async (id: string) => isValidObjectId(id) ? Memorial.findById(id) : null;

export const approveMemorial = async (req: Request, res: Response) => {
  const memorial = await findMemorial(String(req.params.id));
  if (!memorial) return res.status(404).json({ message: 'Memorial not found' });
  memorial.status = 'approved';
  memorial.slug = await uniqueSlug(memorial.fullName, memorial.id);
  await memorial.save();
  res.json(memorial);
};

export const rejectMemorial = async (req: Request, res: Response) => {
  const memorial = await findMemorial(String(req.params.id));
  if (!memorial) return res.status(404).json({ message: 'Memorial not found' });
  memorial.status = 'rejected';
  memorial.slug = undefined;
  await memorial.save();
  res.json(memorial);
};

export const adminUpdateMemorial = async (req: Request, res: Response) => {
  const allowed = ['fullName', 'birthDate', 'deathDate', 'relationship', 'religion', 'message', 'template', 'reminderEnabled', 'photo'];
  const update = Object.fromEntries(allowed.filter((key) => req.body[key] !== undefined).map((key) => [key, req.body[key]]));
  const memorial = await Memorial.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!memorial) return res.status(404).json({ message: 'Memorial not found' });
  res.json(memorial);
};

export const listUsers = async (req: Request, res: Response) => {
  const query = String(req.query.q ?? '').trim().slice(0, 100);
  const users = await User.find(query ? { $or: [{ name: { $regex: query, $options: 'i' } }, { email: { $regex: query, $options: 'i' } }] } : {}).select('-password').sort({ createdAt: -1 }).lean();
  const counts = await Memorial.aggregate([{ $group: { _id: '$userId', memorialCount: { $sum: 1 } } }]);
  const countMap = new Map(counts.map((item) => [String(item._id), item.memorialCount]));
  res.json(users.map((user) => ({ ...user, memorialCount: countMap.get(String(user._id)) ?? 0 })));
};
