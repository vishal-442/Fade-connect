const cloudinary = require('cloudinary').v2;

const isConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Uploads a local file buffer/path to Cloudinary.
 * Falls back to returning a local `/uploads/...` path when Cloudinary
 * credentials are not configured, so the app is usable out of the box in dev.
 */
const uploadImage = async (filePath, folder = 'fade-connect') => {
  if (!isConfigured) {
    // Dev fallback: file already saved to disk by multer, just return its public path.
    return { url: filePath, provider: 'local' };
  }
  const result = await cloudinary.uploader.upload(filePath, { folder });
  return { url: result.secure_url, publicId: result.public_id, provider: 'cloudinary' };
};

module.exports = { cloudinary, uploadImage, isConfigured };
