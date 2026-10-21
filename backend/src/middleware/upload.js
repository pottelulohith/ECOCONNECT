import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();

const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.jfif', '.heic', '.heif', '.gif', '.bmp', '.svg'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const isImageMime = file.mimetype && (file.mimetype.startsWith('image/') || file.mimetype === 'application/octet-stream');
  const isImageExt = ALLOWED_EXTS.includes(ext);

  if (isImageMime || isImageExt) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WEBP, HEIC, GIF, BMP) are allowed!'), false);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit for modern mobile camera captures
  },
  fileFilter,
});
