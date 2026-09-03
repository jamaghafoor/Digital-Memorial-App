import type { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import slugify from 'slugify';
import { Memorial, templates } from '../models/Memorial.js';

const editable = ['fullName', 'photo', 'birthDate', 'deathDate', 'relationship', 'religion', 'message', 'template', 'reminderEnabled'] as const;
const bodyFields = (body: Record<string, unknown>) => Object.fromEntries(editable.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]));
const validDates = (birthDate: unknown, deathDate: unknown) => !Number.isNaN(Date.parse(String(birthDate))) && !Number.isNaN(Date.parse(String(deathDate))) && new Date(String(birthDate)) <= new Date(String(deathDate));

export const createMemorial = async (req: Request, res: Response) => {
  const data = bodyFields(req.body);
  const required = ['fullName', 'photo', 'birthDate', 'deathDate', 'relationship', 'religion', 'message', 'template'];
  if (required.some((key) => !data[key]) || !templates.includes(data.template as any) || !validDates(data.birthDate, data.deathDate)) {
    return res.status(400).json({ message: 'Please provide all memorial fields and valid dates' });
  }
  const memorial = await Memorial.create({ ...data, userId: req.auth!.userId, status: 'pending' });
  res.status(201).json(memorial);
};

export const myMemorials = async (req: Request, res: Response) => res.json(await Memorial.find({ userId: req.auth!.userId }).sort({ createdAt: -1 }));

export const searchMemorials = async (req: Request, res: Response) => {
  const query = String(req.query.q ?? '').trim().slice(0, 100);
  const filter = query ? { status: 'approved', fullName: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } } : { status: 'approved' };
  res.json(await Memorial.find(filter).sort({ createdAt: -1 }).limit(30));
};

export const getMemorial = async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Memorial not found' });
  const memorial = await Memorial.findById(req.params.id);
  if (!memorial) return res.status(404).json({ message: 'Memorial not found' });
  if (memorial.userId.toString() !== req.auth!.userId && req.auth!.role !== 'ADMIN') return res.status(403).json({ message: 'Access denied' });
  res.json(memorial);
};

export const getPublicMemorial = async (req: Request, res: Response) => {
  const memorial = await Memorial.findOne({ slug: req.params.slug, status: 'approved' });
  if (!memorial) return res.status(404).json({ message: 'Memorial not found' });
  res.json(memorial);
};

export const updateMemorial = async (req: Request, res: Response) => {
  const memorial = isValidObjectId(req.params.id) ? await Memorial.findById(req.params.id) : null;
  if (!memorial) return res.status(404).json({ message: 'Memorial not found' });
  if (memorial.userId.toString() !== req.auth!.userId) return res.status(403).json({ message: 'Access denied' });
  Object.assign(memorial, bodyFields(req.body), { status: 'pending', slug: undefined });
  if (!validDates(memorial.birthDate, memorial.deathDate)) return res.status(400).json({ message: 'Birth date must be before death date' });
  await memorial.save();
  res.json(memorial);
};

export const deleteMemorial = async (req: Request, res: Response) => {
  const memorial = isValidObjectId(req.params.id) ? await Memorial.findOneAndDelete({ _id: req.params.id, userId: req.auth!.userId }) : null;
  if (!memorial) return res.status(404).json({ message: 'Memorial not found' });
  res.status(204).send();
};

export const uniqueSlug = async (fullName: string, id: string) => {
  const base = slugify(fullName, { lower: true, strict: true }) || 'memorial';
  let slug = base;
  let suffix = 1;
  while (await Memorial.exists({ slug, _id: { $ne: id } })) slug = `${base}-${++suffix}`;
  return slug;
};
