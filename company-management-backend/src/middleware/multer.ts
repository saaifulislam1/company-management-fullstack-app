import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

// Use memory storage to handle the file as a buffer
const storage = multer.memoryStorage();

// File filter to validate size and type
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 }, // 500 KB limit
});
