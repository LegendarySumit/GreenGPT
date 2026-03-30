import { adminDb } from "../config/firebaseAdmin.js";
import { sendError } from "../utils/apiResponse.js";
import { readPlanAndUsage, checkQuota, incrementUsage, QUOTA_ACTIONS } from "../services/quotaService.js";

export const enforceQuota = (action) => {
  if (!QUOTA_ACTIONS.includes(action)) {
    throw new Error(`Invalid quota action: ${action}`);
  }

  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, {
          status: 401,
          message: "Authentication required",
          code: "UNAUTHORIZED",
        });
      }

      const userRef = adminDb.collection("users").doc(userId);
      let quotaSnapshot = null;

      await adminDb.runTransaction(async (tx) => {
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists) {
          const err = new Error("User not found");
          err.status = 404;
          throw err;
        }

        const userData = userSnap.data() || {};
        const { plan, usage, remaining } = readPlanAndUsage(userData);
        const quotaCheck = checkQuota(plan, usage, action);

        if (!quotaCheck.allowed) {
          const err = new Error(`${plan.name} monthly ${action} quota exceeded`);
          err.status = 429;
          err.code = "QUOTA_EXCEEDED";
          err.details = {
            action,
            planId: plan.id,
            planName: plan.name,
            used: quotaCheck.used,
            limit: quotaCheck.limit,
            remaining: remaining[action],
            period: usage.period,
          };
          throw err;
        }

        const nextUsage = incrementUsage(usage, action);
        tx.update(userRef, {
          planId: plan.id,
          usage: nextUsage,
        });

        quotaSnapshot = {
          plan,
          usage: nextUsage,
        };
      });

      req.quota = quotaSnapshot;
      next();
    } catch (error) {
      const status = Number.isInteger(error?.status) ? error.status : 500;
      return sendError(res, {
        status,
        message: error.message || "Quota enforcement failed",
        code: error.code || "QUOTA_ERROR",
        details: error.details,
      });
    }
  };
};
