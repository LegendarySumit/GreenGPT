import express from 'express';
import { getMe, getQuota, updatePlan } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// NOTE: Signup and login routes removed
// Authentication is now handled on the frontend using Firebase SDK
// The frontend creates users in Firebase and sends ID tokens to the backend

// Get authenticated user data from Firestore
router.get('/me', protect, getMe);
router.get('/quota', protect, getQuota);
router.patch('/plan', protect, updatePlan);

export default router;
