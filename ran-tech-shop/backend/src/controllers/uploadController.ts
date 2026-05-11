import { Request, Response } from 'express';
import { uploadBuffer } from '../lib/cloudinary';

/**
 * Upload a single image to Cloudinary
 * POST /api/uploads/image
 *
 * Expects multipart/form-data with field name "file". Returns the secure URL
 * and the Cloudinary public_id (the latter useful for future deletion).
 */
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded. Use field name "file".' });
      return;
    }

    const result = await uploadBuffer(req.file.buffer, {
      // Optional: pass a target folder via form field e.g. folder=products
      folder: typeof req.body.folder === 'string' && req.body.folder
        ? req.body.folder
        : undefined,
    });

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    });
  } catch (error: any) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: error?.message || 'Failed to upload image' });
  }
};

/**
 * Upload multiple images
 * POST /api/uploads/images
 *
 * Expects multipart/form-data with field name "files" (one or many). Returns
 * an array of secure URLs in the same order as the uploaded files.
 */
export const uploadImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (files.length === 0) {
      res.status(400).json({ error: 'No files uploaded. Use field name "files".' });
      return;
    }

    const folder = typeof req.body.folder === 'string' && req.body.folder
      ? req.body.folder
      : undefined;

    const results = await Promise.all(
      files.map((f) => uploadBuffer(f.buffer, { folder }))
    );

    res.json({
      images: results.map((r) => ({
        url: r.secure_url,
        publicId: r.public_id,
        width: r.width,
        height: r.height,
        format: r.format,
        bytes: r.bytes,
      })),
    });
  } catch (error: any) {
    console.error('Upload images error:', error);
    res.status(500).json({ error: error?.message || 'Failed to upload images' });
  }
};
