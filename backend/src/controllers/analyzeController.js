import { extractTextFromPDF } from "../utils/pdfReader.js";
import { generateContent } from "../config/gemini.js";
import { environmentPrompt } from "../prompts/environmentPrompt.js";
import { extractJSON } from "../utils/jsonCleaner.js";
import { adminDb } from "../config/firebaseAdmin.js";
import admin from "../config/firebaseAdmin.js";

// POST /api/analyze — run AI analysis, return result (no DB write here)
export const analyzeDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const text = await extractTextFromPDF(req.file.buffer);
    const truncatedText = text.substring(0, 12000);
    const prompt = environmentPrompt(truncatedText);
    const result = await generateContent(prompt);
    const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) throw new Error("No response from AI");

    const analysis = extractJSON(aiText);

    res.json({ success: true, analysis });
  } catch (error) {
    console.error("GEMINI ERROR:", error.message);
    let errorMessage = error.message || "AI analysis failed";
    errorMessage = errorMessage.replace(/key=[A-Za-z0-9_-]+/gi, "key=***HIDDEN***");
    res.status(500).json({ success: false, error: errorMessage });
  }
};

// POST /api/analyze/save — manually save an analysis to the user's history
export const saveAnalysis = async (req, res) => {
  try {
    const uid = req.user.id;
    const { fileName, fileSizeBytes, analysis } = req.body;

    if (!analysis || !fileName) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const docRef = await adminDb
      .collection("users")
      .doc(uid)
      .collection("analyses")
      .add({
        fileName,
        fileSizeBytes: fileSizeBytes || 0,
        analysis,
        createdAt: new Date(),
      });

    await adminDb
      .collection("users")
      .doc(uid)
      .update({ analysisCount: admin.firestore.FieldValue.increment(1) });

    res.json({ success: true, analysisId: docRef.id });
  } catch (error) {
    console.error("Save error:", error.message);
    res.status(500).json({ success: false, error: "Failed to save analysis" });
  }
};

// DELETE /api/analyze/history/:id — delete a saved analysis
export const deleteAnalysis = async (req, res) => {
  try {
    const uid = req.user.id;
    const { id } = req.params;

    await adminDb
      .collection("users")
      .doc(uid)
      .collection("analyses")
      .doc(id)
      .delete();

    await adminDb
      .collection("users")
      .doc(uid)
      .update({ analysisCount: admin.firestore.FieldValue.increment(-1) })
      .catch(() => {});

    res.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error.message);
    res.status(500).json({ success: false, error: "Failed to delete analysis" });
  }
};

// GET /api/analyze/history — fetch all saved analyses for the user
export const getAnalysisHistory = async (req, res) => {
  try {
    const uid = req.user.id;
    const snapshot = await adminDb
      .collection("users")
      .doc(uid)
      .collection("analyses")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const history = snapshot.docs.map((doc) => ({
      id: doc.id,
      fileName: doc.data().fileName,
      fileSizeBytes: doc.data().fileSizeBytes,
      riskLevel: doc.data().analysis?.risk_level || null,
      summary: doc.data().analysis?.summary || null,
      analysis: doc.data().analysis,
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
    }));

    res.json({ success: true, history });
  } catch (error) {
    console.error("History fetch error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch history" });
  }
};
