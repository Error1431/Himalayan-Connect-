// Verifies the Firebase ID token the frontend gets after a user completes
// real SMS OTP verification (Frontend/src/pages/Register.js, using
// Frontend/src/firebase.js). This is the server-side half of that flow —
// without it, the backend has no way to confirm the phone was genuinely
// verified by Firebase, since a Firebase ID token is a signed JWT that
// only Firebase's Admin SDK (with the right service account) can verify.
//
// Get a service account key from:
// Firebase Console → Project Settings → Service Accounts → Generate new private key
// It downloads as a JSON file — copy its three fields into .env (see below)
// rather than committing the JSON file itself.
let admin = null;
let initialized = false;

function getAdmin() {
  if (initialized) return admin;
  initialized = true;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Private keys in .env files need their escaped \n turned back into real
  // newlines — this is the #1 gotcha when wiring up firebase-admin.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.log('⚠️  Firebase Admin not configured — phone OTP verification will use the fallback SMS/OTP system instead (see Backend/.env.example).');
    return null;
  }

  const firebaseAdmin = require('firebase-admin');
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({ projectId, clientEmail, privateKey }),
  });
  admin = firebaseAdmin;
  console.log('📱 Firebase Admin initialized — real phone OTP verification active.');
  return admin;
}

const isFirebaseConfigured = () => !!getAdmin();

/**
 * Verifies a Firebase ID token (obtained by the frontend after the user
 * completes SMS OTP) and confirms its verified phone number matches the
 * phone being registered. Returns true/false — never throws.
 */
async function verifyFirebasePhoneToken(idToken, expectedPhone) {
  const fb = getAdmin();
  if (!fb || !idToken) return false;

  try {
    const decoded = await fb.auth().verifyIdToken(idToken);
    const verifiedPhone = (decoded.phone_number || '').replace(/\s/g, '');
    const targetPhone = (expectedPhone || '').replace(/\s/g, '');
    return !!verifiedPhone && verifiedPhone === targetPhone;
  } catch (error) {
    console.error('Firebase ID token verification failed:', error.message);
    return false;
  }
}

module.exports = { isFirebaseConfigured, verifyFirebasePhoneToken };
