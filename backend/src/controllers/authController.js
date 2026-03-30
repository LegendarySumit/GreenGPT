import { adminDb } from '../config/firebaseAdmin.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';
import { hashUserId, logError } from '../utils/logging.js';
import { normalizePlanId } from '../config/plans.js';
import { readPlanAndUsage } from '../services/quotaService.js';

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private (requires Firebase auth token)
export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user data from Firestore
    const userDocSnap = await adminDb.collection('users').doc(userId).get();

    if (!userDocSnap.exists) {
      return sendError(res, {
        status: 404,
        message: 'User not found in Firestore',
        code: 'USER_NOT_FOUND',
      });
    }

    const userData = userDocSnap.data();

    const { plan, usage, remaining } = readPlanAndUsage(userData);

    return sendSuccess(res, {
      user: {
        id: userId,
        email: userData.email,
        name: userData.name,
        photoURL: userData.photoURL || null,
        analysisCount: userData.analysisCount || 0,
        createdAt: userData.createdAt,
        plan,
        usage,
        remaining,
      },
    }, 200);
  } catch (error) {
    logError('auth_get_me_failed', error, {
      requestId: req.requestId,
      userHash: hashUserId(req.user?.id),
    });
    return sendError(res, {
      status: 500,
      message: 'Error fetching user data',
      code: 'AUTH_PROFILE_FAILED',
    });
  }
};

// @desc    Get current quota usage and limits
// @route   GET /api/auth/quota
// @access  Private
export const getQuota = async (req, res) => {
  try {
    const userId = req.user.id;
    const userDoc = req.userDoc || (await adminDb.collection('users').doc(userId).get()).data();
    const { plan, usage, remaining } = readPlanAndUsage(userDoc || {});

    return sendSuccess(res, {
      quota: {
        plan,
        usage,
        remaining,
      },
    });
  } catch (error) {
    logError('auth_get_quota_failed', error, {
      requestId: req.requestId,
      userHash: hashUserId(req.user?.id),
    });
    return sendError(res, {
      status: 500,
      message: 'Error fetching quota data',
      code: 'AUTH_QUOTA_FAILED',
    });
  }
};

// @desc    Update user plan
// @route   PATCH /api/auth/plan
// @access  Private
export const updatePlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const requestedPlanId = normalizePlanId(req.body?.planId);

    if (!req.body?.planId || requestedPlanId !== String(req.body.planId).toLowerCase()) {
      return sendError(res, {
        status: 400,
        message: 'Invalid planId',
        code: 'VALIDATION_ERROR',
      });
    }

    const userRef = adminDb.collection('users').doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return sendError(res, {
        status: 404,
        message: 'User not found in Firestore',
        code: 'USER_NOT_FOUND',
      });
    }

    await userRef.update({
      planId: requestedPlanId,
      planUpdatedAt: new Date(),
    });

    const updatedData = (await userRef.get()).data() || {};
    const { plan, usage, remaining } = readPlanAndUsage(updatedData);

    return sendSuccess(res, {
      plan,
      usage,
      remaining,
    });
  } catch (error) {
    logError('auth_update_plan_failed', error, {
      requestId: req.requestId,
      userHash: hashUserId(req.user?.id),
    });
    return sendError(res, {
      status: 500,
      message: 'Failed to update plan',
      code: 'AUTH_PLAN_UPDATE_FAILED',
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

