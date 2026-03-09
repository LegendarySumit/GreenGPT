import { adminDb } from '../config/firebaseAdmin.js';

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private (requires Firebase auth token)
export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user data from Firestore
    const userDocSnap = await adminDb.collection('users').doc(userId).get();

    if (!userDocSnap.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found in Firestore'
      });
    }

    const userData = userDocSnap.data();

    res.status(200).json({
      success: true,
      user: {
        id: userId,
        email: userData.email,
        name: userData.name,
        photoURL: userData.photoURL || null,
        analysisCount: userData.analysisCount || 0,
        createdAt: userData.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
};

// NOTE: Signup and login are now handled on the frontend using Firebase SDK
// The frontend will:
// 1. Call Firebase Authentication APIs directly
// 2. Create user documents in Firestore
// 3. Get ID tokens from Firebase
// 4. Send ID tokens in Authorization header for API requests
//
// Backend only needs to verify tokens using adminAuth.verifyIdToken()
// See middleware/auth.js for token verification implementation

