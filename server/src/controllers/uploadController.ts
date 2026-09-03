import type { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

cloudinary.config({ cloud_name: env.cloudinary.cloudName, api_key: env.cloudinary.apiKey, api_secret: env.cloudinary.apiSecret });

export const uploadPhoto = async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ message: 'Photo is required' });
  if (!env.cloudinary.cloudName) return res.status(503).json({ message: 'Cloudinary is not configured' });
  const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: 'memorials', resource_type: 'image', transformation: [{ width: 1200, height: 1200, crop: 'limit' }, { quality: 'auto', fetch_format: 'auto' }] }, (error, upload) => {
      if (error || !upload) reject(error ?? new Error('Upload failed'));
      else resolve(upload);
    });
    stream.end(req.file!.buffer);
  });
  res.status(201).json({ url: result.secure_url, publicId: result.public_id });
};
