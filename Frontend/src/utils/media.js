import { API_BASE_URL } from './api';

// Uploaded images (products, homestays, avatars) are stored as relative
// paths like "/uploads/homestay-123.jpg". These need the backend's origin
// prefixed to load correctly — without a CRA dev proxy configured, and in
// production (Vercel frontend / Render backend on different domains), a
// bare relative path resolves against the *frontend's* origin and 404s.
// External URLs (Google avatars, Unsplash fallbacks) are left untouched.
export const resolveImageUrl = (path, fallback = '') => {
  if (!path) return fallback;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};
