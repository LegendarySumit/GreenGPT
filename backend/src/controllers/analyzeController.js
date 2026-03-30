import { extractTextFromPDF } from "../utils/pdfReader.js";
import { generateContent } from "../config/gemini.js";
import { environmentPrompt } from "../prompts/environmentPrompt.js";
import { extractJSON } from "../utils/jsonCleaner.js";
import { adminDb } from "../config/firebaseAdmin.js";
import { sendError, sendSuccess, toHttpError } from "../utils/apiResponse.js";
import { hashUserId, logError, logInfo } from "../utils/logging.js";

const ANALYZE_MAX_TEXT_CHARS = Number(process.env.MAX_FILE_CONTENT_LENGTH || 12000);
const ANALYZE_AI_RETRY_COUNT = Number(process.env.ANALYZE_AI_RETRY_COUNT || 2);

const normalizeExtractedText = (value = "") =>
  value
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeAnalyzeError = (error) => {
  const { status: baseStatus, message: baseMessage } = toHttpError(error, "AI analysis failed");
  const message = baseMessage || "AI analysis failed";

  if (/No response from AI/i.test(message)) {
    return {
      status: 502,
      message: "AI service returned an empty response. Please retry in a few seconds.",
    };
  }

  if (/No JSON found in AI response|Failed to parse JSON/i.test(message)) {
    return {
      status: 502,
      message: "AI returned an invalid analysis format. Please retry your PDF analysis.",
    };
  }

  if (/no extractable text|scanned image/i.test(message)) {
    return {
      status: 422,
      message,
    };
  }

  return {
    status: baseStatus,
    message,
  };
};

// POST /api/analyze — run AI analysis, return result (no DB write here)
export const analyzeDocument = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, {
        status: 400,
        message: "No file uploaded",
        code: "VALIDATION_ERROR",
      });
    }

    const text = await extractTextFromPDF(req.file.buffer);
    const normalizedText = normalizeExtractedText(text);
    const truncatedText = normalizedText.substring(0, ANALYZE_MAX_TEXT_CHARS);
    const prompt = environmentPrompt(truncatedText);

    let analysis = null;
    let lastError = null;

    for (let attempt = 1; attempt <= ANALYZE_AI_RETRY_COUNT; attempt += 1) {
      try {
        // responseMimeType nudges Gemini towards strict JSON.
        const result = await generateContent(prompt, {
          responseMimeType: "application/json",
          temperature: 0,
        });
        const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiText) {
          throw new Error("No response from AI");
        }

        analysis = extractJSON(aiText);
        break;
      } catch (error) {
        lastError = error;
      }
    }

    if (!analysis) {
      throw lastError || new Error("No response from AI");
    }

    return sendSuccess(res, { analysis });
  } catch (error) {
    const { status, message } = normalizeAnalyzeError(error);
    const safeMessage = message.replace(/key=[A-Za-z0-9_-]+/gi, "key=***HIDDEN***");
    logError("analyze_document_failed", error, {
      requestId: req.requestId,
      userHash: hashUserId(req.user?.id),
    });
    return sendError(res, {
      status,
      message: safeMessage,
      code: "ANALYZE_FAILED",
    });
  }
};

// POST /api/analyze/save — manually save an analysis to the user's history
export const saveAnalysis = async (req, res) => {
  try {
    const uid = req.user.id;
    const { fileName, fileSizeBytes, analysis } = req.body;

    const userRef = adminDb.collection("users").doc(uid);
    const analysisRef = userRef.collection("analyses").doc();

    await adminDb.runTransaction(async (tx) => {
      const userSnap = await tx.get(userRef);
      if (!userSnap.exists) {
        const err = new Error("User not found");
        err.status = 404;
        throw err;
      }

      const currentCount = Number(userSnap.data()?.analysisCount || 0);

      tx.set(analysisRef, {
        fileName,
        fileSizeBytes: fileSizeBytes || 0,
        analysis,
        createdAt: new Date(),
      });

      tx.update(userRef, { analysisCount: currentCount + 1 });
    });

    logInfo("analysis_saved", {
      requestId: req.requestId,
      userHash: hashUserId(uid),
      analysisId: analysisRef.id,
    });

    return sendSuccess(res, { analysisId: analysisRef.id });
  } catch (error) {
    const { status, message } = toHttpError(error, "Failed to save analysis");
    logError("analysis_save_failed", error, {
      requestId: req.requestId,
      userHash: hashUserId(req.user?.id),
    });
    return sendError(res, {
      status,
      message,
      code: "ANALYSIS_SAVE_FAILED",
    });
  }
};

// DELETE /api/analyze/history/:id — delete a saved analysis
export const deleteAnalysis = async (req, res) => {
  try {
    const uid = req.user.id;
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return sendError(res, {
        status: 400,
        message: "Invalid analysis id",
        code: "VALIDATION_ERROR",
      });
    }

    const userRef = adminDb.collection("users").doc(uid);
    const analysisRef = userRef.collection("analyses").doc(id);

    let deleted = false;

    await adminDb.runTransaction(async (tx) => {
      const [userSnap, analysisSnap] = await Promise.all([tx.get(userRef), tx.get(analysisRef)]);

      if (!userSnap.exists) {
        const err = new Error("User not found");
        err.status = 404;
        throw err;
      }

      if (!analysisSnap.exists) {
        deleted = false;
        return;
      }

      deleted = true;
      const currentCount = Number(userSnap.data()?.analysisCount || 0);
      const nextCount = currentCount > 0 ? currentCount - 1 : 0;

      tx.delete(analysisRef);
      tx.update(userRef, { analysisCount: nextCount });
    });

    return sendSuccess(res, { deleted });
  } catch (error) {
    const { status, message } = toHttpError(error, "Failed to delete analysis");
    logError("analysis_delete_failed", error, {
      requestId: req.requestId,
      userHash: hashUserId(req.user?.id),
    });
    return sendError(res, {
      status,
      message,
      code: "ANALYSIS_DELETE_FAILED",
    });
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

    return sendSuccess(res, { history });
  } catch (error) {
    const { status, message } = toHttpError(error, "Failed to fetch history");
    logError("analysis_history_failed", error, {
      requestId: req.requestId,
      userHash: hashUserId(req.user?.id),
    });
    return sendError(res, {
      status,
      message,
      code: "ANALYSIS_HISTORY_FAILED",
    });
  }
};
