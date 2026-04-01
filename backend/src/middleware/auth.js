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

    let token;

    const authHeader = req.headers.authorization;
    if (typeof authHeader === 'string') {
      const [scheme, credentials] = authHeader.trim().split(/\s+/, 2);
      if (scheme === 'Bearer' && credentials) {
        token = credentials;
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify Firebase ID token
      const decodedToken = await adminAuth.verifyIdToken(token);
      
      // Check if user exists in Firestore (must have signed up)
      const userRef = adminDb.collection('users').doc(decodedToken.uid);
      const userDocSnap = await userRef.get();
      
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
