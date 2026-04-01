import express from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import {
  analyzeDocument,
  saveAnalysis,
  deleteAnalysis,
  getAnalysisHistory,
} from "../controllers/analyzeController.js";
import { protect } from "../middleware/auth.js";
import { validateAnalyzeSavePayload } from "../middleware/validation.js";
import { enforceQuota } from "../middleware/quota.js";
import { sendError } from "../utils/apiResponse.js";

const router = express.Router();
const MAX_ANALYZE_FILE_BYTES = Number(process.env.MAX_ANALYZE_FILE_BYTES || 50 * 1024 * 1024);
const analyzeRateLimitConfig = {
  windowMs: Number(process.env.ANALYZE_RATE_WINDOW_MS || 60_000),
  limit: Number(process.env.ANALYZE_RATE_MAX || 40),
  standardHeaders: true,
  legacyHeaders: false,
};
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_ANALYZE_FILE_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Only PDF files are supported"));
      return;
    }
    cb(null, true);
  },
});

// POST /api/analyze       — run AI analysis (auth required)
router.post("/", rateLimit(analyzeRateLimitConfig), protect, enforceQuota("analyze"), upload.single("file"), analyzeDocument);

// POST /api/analyze/save  — manually save a result to history
router.post("/save", rateLimit(analyzeRateLimitConfig), protect, validateAnalyzeSavePayload, saveAnalysis);

// GET  /api/analyze/history — fetch all saved analyses for the user
router.get("/history", rateLimit(analyzeRateLimitConfig), protect, getAnalysisHistory);

// DELETE /api/analyze/history/:id — delete a specific saved analysis
router.delete("/history/:id", rateLimit(analyzeRateLimitConfig), protect, deleteAnalysis);

router.use((err, req, res, next) => {
  if (err?.message === "Only PDF files are supported") {
    return sendError(res, {
      status: 400,
      message: err.message,
      code: "VALIDATION_ERROR",
    });
  }

  if (err?.code === "LIMIT_FILE_SIZE") {
    return sendError(res, {
      status: 413,
      message: `PDF exceeds max size (${MAX_ANALYZE_FILE_BYTES} bytes)`,
      code: "PAYLOAD_TOO_LARGE",
    });
  }

  next(err);
});

export default router;
