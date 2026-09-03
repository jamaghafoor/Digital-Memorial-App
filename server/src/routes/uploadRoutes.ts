import { Router } from 'express';
import multer from 'multer';
import { uploadPhoto } from '../controllers/uploadController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_req, file, callback) => callback(null, file.mimetype.startsWith('image/')) });
export const uploadRouter = Router();
uploadRouter.post('/', requireAuth, upload.single('photo'), asyncHandler(uploadPhoto));
