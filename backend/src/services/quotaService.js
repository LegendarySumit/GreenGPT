import { getPlanDetails, normalizePlanId } from "../config/plans.js";

const quotaActions = ["analyze", "chat", "upload"];

const currentPeriod = () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const buildUsage = (base = {}, period = currentPeriod()) => {
  const safe = {
    period,
    analyze: 0,
    chat: 0,
    upload: 0,
  };

  if (base?.period === period) {
    for (const action of quotaActions) {
      safe[action] = Number(base[action] || 0);
    }
  }

  return safe;
};

export const readPlanAndUsage = (userData = {}) => {
  const planId = normalizePlanId(userData.planId || userData?.plan?.id);
  const plan = getPlanDetails(planId);
  const usage = buildUsage(userData.usage);

  const remaining = quotaActions.reduce((acc, action) => {
    const limit = plan.quotas[action];
    if (limit === null) {
      acc[action] = null;
      return acc;
    }
    acc[action] = Math.max(0, limit - usage[action]);
    return acc;
  }, {});

  return {
    plan,
    usage,
    remaining,
  };
};

export const checkQuota = (plan, usage, action) => {
  if (!quotaActions.includes(action)) {
    return { allowed: false, reason: "Unknown quota action" };
  }

  const limit = plan.quotas[action];
  if (limit === null) {
    return { allowed: true, limit, used: usage[action] };
  }

  const used = Number(usage[action] || 0);
  const allowed = used < limit;
  return {
    allowed,
    limit,
    used,
  };
};

export const incrementUsage = (usage, action) => {
  const next = { ...usage };
  next[action] = Number(next[action] || 0) + 1;
  return next;
};

export const QUOTA_ACTIONS = quotaActions;
