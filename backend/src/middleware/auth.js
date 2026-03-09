import { adminAuth } from '../config/firebaseAdmin.js';
import { adminDb } from '../config/firebaseAdmin.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
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
      const userDocSnap = await adminDb.collection('users').doc(decodedToken.uid).get();
      
      if (!userDocSnap.exists()) {
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
