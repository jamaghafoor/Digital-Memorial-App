import { Schema, model } from 'mongoose';

export type UserRole = 'USER' | 'ADMIN';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    preferredLanguage: { type: String, enum: ['en', 'ro', 'hi', 'zh', 'es'], default: 'en' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const User = model('User', userSchema);
