import sharp from 'sharp';

/**
 * Compress an image buffer before uploading to Cloudinary.
 * - Resizes to max 1200×1200 (preserves aspect ratio, never upscales)
 * - Converts to WebP at quality 82 for smaller file sizes
 */
export async function compressImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
}
