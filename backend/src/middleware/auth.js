import { adminAuth } from '../config/firebaseAdmin.js';
import { adminDb } from '../config/firebaseAdmin.js';

export const protect = async (req, res, next) => {
  try {
    if (!adminAuth || !adminDb) {
      return res.status(503).json({
        success: false,
        message: 'Auth service unavailable — Firebase not configured on server'
      });
    }

    const authHeader = req.headers.authorization;
    const tokenMatch = typeof authHeader === 'string'
      ? authHeader.trim().match(/^Bearer\s+([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/)
      : null;
    const token = tokenMatch?.[1] || '__invalid_token__';

    try {
      // Verify Firebase ID token with timeout
      const decodedToken = await Promise.race([
        adminAuth.verifyIdToken(token),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase token verification timeout')), 8000))
      ]);
      
      // Check if user exists in Firestore (must have signed up)
      const userRef = adminDb.collection('users').doc(decodedToken.uid);
      const userDocSnap = await Promise.race([
        userRef.get(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore query timeout')), 5000))
      ]);
      
      if (!userDocSnap.exists) {
        return res.status(401).json({
          success: false,
          message: 'User not found. Please sign up first.'
        });
      }
      
      req.user = {
        id: decodedToken.uid,
        email: decodedToken.email || null,
        name: decodedToken.name || null,
      };
      req.userDocRef = userRef;
      req.userDoc = userDocSnap.data() || null;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};
