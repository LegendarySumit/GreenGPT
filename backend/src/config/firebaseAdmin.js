import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if running in production or development
const isProduction = process.env.NODE_ENV === 'production';
const requiredProdEnv = ['FIREBASE_PROJECT_ID', 'FIREBASE_SERVICE_ACCOUNT'];
const missingProdEnv = requiredProdEnv.filter((key) => !process.env[key]);

let serviceAccount;

if (isProduction && missingProdEnv.length > 0) {
  throw new Error(
    `Missing required Firebase environment variables in production: ${missingProdEnv.join(', ')}`
  );
}

if (isProduction && process.env.FIREBASE_SERVICE_ACCOUNT) {
  // For Render.com deployment: Use environment variable
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    throw new Error(`Error parsing FIREBASE_SERVICE_ACCOUNT: ${error.message}`);
  }
} else {
  // For local development: Use service account key file
  const keyPath = path.join(__dirname, '../../firebase-service-account.json');
  if (fs.existsSync(keyPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  } else {
    console.warn(
      'Firebase service account file not found. Firebase Admin SDK not initialized.'
    );
  }
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });

  console.log('Firebase Admin SDK initialized');
} else if (isProduction) {
  throw new Error('Firebase Admin SDK could not be initialized in production');
}

export const adminAuth = serviceAccount ? admin.auth() : null;
export const adminDb   = serviceAccount ? admin.firestore() : null;
export const isFirebaseReady = () => Boolean(adminAuth && adminDb);
export const firebaseBootState = {
  isProduction,
  initialized: Boolean(serviceAccount),
  hasProjectId: Boolean(process.env.FIREBASE_PROJECT_ID),
  missingProdEnv,
};

export default admin;
