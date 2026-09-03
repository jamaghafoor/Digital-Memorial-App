import type { ErrorRequestHandler } from 'express';
import { MulterError } from 'multer';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);
  if (error instanceof MulterError) {
    res.status(400).json({ message: error.message });
    return;
  }
  const message = error instanceof Error ? error.message : 'Unexpected server error';
  res.status(500).json({ message });
};
