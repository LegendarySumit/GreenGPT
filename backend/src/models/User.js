// This file is deprecated - User data is now stored in Firestore
// 
// Firestore User Document Structure:
// Collection: users
// Document ID: Firebase UID (from Firebase Authentication)
// Fields:
//   - email: string
//   - name: string
//   - photoURL: string | null
//   - createdAt: Timestamp
//   - analysisCount: number
//
// All user authentication is handled by Firebase Auth on the frontend.
// Backend only retrieves user data from Firestore using the verified UID.
//
// See backend/src/config/firebaseAdmin.js for Firestore initialization.
// See backend/src/middleware/auth.js for Firebase token verification.

export const getUserFromFirestore = async (adminDb, userId) => {
  const userDoc = await adminDb.collection('users').doc(userId).get();
  return userDoc.exists ? userDoc.data() : null;
};
