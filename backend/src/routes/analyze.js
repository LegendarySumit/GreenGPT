import express from "express";
import multer from "multer";
import {
  analyzeDocument,
  saveAnalysis,
  deleteAnalysis,
  getAnalysisHistory,
} from "../controllers/analyzeController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
const upload = multer();

// POST /api/analyze       — run AI analysis (auth required)
router.post("/", protect, upload.single("file"), analyzeDocument);

// POST /api/analyze/save  — manually save a result to history
router.post("/save", protect, saveAnalysis);

// GET  /api/analyze/history — fetch all saved analyses for the user
router.get("/history", protect, getAnalysisHistory);

// DELETE /api/analyze/history/:id — delete a specific saved analysis
router.delete("/history/:id", protect, deleteAnalysis);

export default router;
