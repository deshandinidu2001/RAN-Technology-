import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.warn(
    '⚠️  Cloudinary env vars missing. Set CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET in backend/.env.'
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export const defaultFolder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'ran-tech-shop';

/**
 * Upload a buffer to Cloudinary using the upload_stream API. Returns the full
 * Cloudinary response — `secure_url` is the value to store in the DB.
 */
export const uploadBuffer = (
  buffer: Buffer,
  options: UploadApiOptions = {}
): Promise<UploadApiResponse> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: defaultFolder, resource_type: 'image', ...options },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload returned no result'));
          return;
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });

export { cloudinary };
