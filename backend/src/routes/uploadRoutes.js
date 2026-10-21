import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { upload } from '../middleware/upload.js';
import { isCloudinaryConfigured, uploadToCloudinary } from '../config/cloudinary.js';
import { requireAuth } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const router = express.Router();

router.post('/', (req, res, next) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Image file too large. Maximum allowed size is 25MB.',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Error processing uploaded file',
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please upload an image file' });
      }

      const folder = (req.body.folder || 'ecoconnect').replace(/[^a-zA-Z0-9_-]/g, '');

      if (isCloudinaryConfigured()) {
        try {
          const result = await uploadToCloudinary(req.file.buffer, folder);
          return res.status(200).json({
            success: true,
            message: 'Image uploaded to Cloudinary successfully',
            url: result.url,
            publicId: result.publicId,
          });
        } catch (cloudErr) {
          console.warn('Cloudinary upload failed, falling back to local file storage:', cloudErr.message);
        }
      }

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Save file to server disk
      const ext = (path.extname(req.file.originalname || '') || '.jpg').toLowerCase();
      const filename = `${folder}-${Date.now()}-${Math.floor(Math.random() * 10000)}${ext}`;
      const filePath = path.join(uploadsDir, filename);
      await fs.promises.writeFile(filePath, req.file.buffer);

      const fileUrl = `/uploads/${filename}`;
      return res.status(200).json({
        success: true,
        message: 'Image saved to local uploads storage',
        url: fileUrl,
        publicId: filename,
      });
    } catch (routeErr) {
      console.error('File storage error:', routeErr);
      return res.status(500).json({
        success: false,
        message: routeErr.message || 'Failed to save uploaded image to disk',
      });
    }
  });
});

export default router;
