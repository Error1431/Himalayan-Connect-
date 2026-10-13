const multer = require('multer');
const path = require('path');

// ---------------------------------------------------------------------
// Why this exists: uploaded files (post photos/videos, product images,
// homestay photos, room images) were being written to local disk. That
// works fine on a machine that stays running, but Render's free tier has
// an EPHEMERAL filesystem — everything on disk is wiped whenever the
// service redeploys or spins down after being idle, even though the
// MongoDB records referencing those files are untouched (Atlas is
// persistent). This is exactly what caused "post details show up but the
// image/video is a black box" after logging back in later.
//
// Fix: store uploads on Cloudinary (a real, persistent, CDN-backed file
// host with a generous free tier) when it's configured, and keep local
// disk storage as a fallback for local development. Cloudinary URLs are
// full https:// URLs, and every place in this app that renders an
// uploaded file already checks `startsWith('http')` before deciding
// whether to prefix the backend's own origin — so no frontend changes
// are needed for this to work once Cloudinary is configured.
// ---------------------------------------------------------------------

const cloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

let upload;

if (cloudinaryConfigured) {
  const cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'himalaya-connect',
      resource_type: 'auto', // handles images AND videos
      public_id: (req, file) => `${Date.now()}-${path.parse(file.originalname).name}`,
    },
  });

  upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB (videos)
  console.log('📷 File uploads: using Cloudinary (persistent storage)');
} else {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}${ext}`);
    },
  });

  upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });
  console.log('⚠️  File uploads: using local disk (not persistent on Render free tier — set CLOUDINARY_* in .env to fix)');
}

// Cloudinary sets file.path to the full https:// URL; local disk storage
// sets file.path to a local filesystem path and file.filename to the bare
// name. This gives controllers one consistent way to get "the URL to save
// in the database" regardless of which backend is active.
function getFileUrl(file, subfolder = '') {
  if (!file) return undefined;
  if (file.path && file.path.startsWith('http')) return file.path; // Cloudinary
  return `/uploads/${subfolder ? subfolder + '/' : ''}${file.filename}`; // local disk
}

module.exports = upload;
module.exports.getFileUrl = getFileUrl;
