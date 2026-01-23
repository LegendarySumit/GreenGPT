import express from "express";
import multer from "multer";
import { analyzeDocument } from "../controllers/analyzeController.js";

const router = express.Router();
const upload = multer();

router.post("/", upload.single("file"), analyzeDocument);

export default router;
