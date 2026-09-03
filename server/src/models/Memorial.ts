import { Schema, model } from 'mongoose';

export const templates = ['christian', 'islamic', 'buddhist', 'floral', 'modern'] as const;

const memorialSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fullName: { type: String, required: true, trim: true, maxlength: 160 },
    photo: { type: String, required: true, trim: true },
    birthDate: { type: Date, required: true },
    deathDate: { type: Date, required: true },
    relationship: { type: String, required: true, trim: true, maxlength: 80 },
    religion: { type: String, required: true, trim: true, maxlength: 80 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    template: { type: String, enum: templates, required: true },
    reminderEnabled: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    slug: { type: String, unique: true, sparse: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

memorialSchema.index({ fullName: 'text' });
export const Memorial = model('Memorial', memorialSchema);
