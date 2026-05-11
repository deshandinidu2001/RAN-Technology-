import { Router } from 'express';
import multer from 'multer';
import { uploadImage, uploadImages } from '../controllers/uploadController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// In-memory storage — buffers stream straight to Cloudinary, no disk writes.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB per file
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image uploads are allowed'));
    }
  },
});

router.post('/image', optionalAuth, upload.single('file'), uploadImage);
router.post('/images', optionalAuth, upload.array('files', 10), uploadImages);

export default router;
