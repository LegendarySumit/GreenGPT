import express from 'express';
import rateLimit from 'express-rate-limit';
import { getMe, getQuota, updatePlan } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const authRateLimit = rateLimit({
	windowMs: Number(process.env.AUTH_RATE_WINDOW_MS || 60_000),
	limit: Number(process.env.AUTH_RATE_MAX || 120),
	standardHeaders: true,
	legacyHeaders: false,
});

// NOTE: Signup and login routes removed
// Authentication is now handled on the frontend using Firebase SDK
// The frontend creates users in Firebase and sends ID tokens to the backend

// Get authenticated user data from Firestore
router.get('/me', authRateLimit, protect, getMe);
router.get('/quota', authRateLimit, protect, getQuota);
router.patch('/plan', authRateLimit, protect, updatePlan);

export default router;
