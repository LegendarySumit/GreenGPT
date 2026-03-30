export const PLAN_IDS = {
  FREE: "free_trial",
  INDIVIDUAL: "individual",
  TEAM: "team",
  ENTERPRISE: "enterprise",
};

export const PLAN_LIMITS = {
  [PLAN_IDS.FREE]: {
    name: "Free Trial",
    quotas: {
      analyze: 5,
      chat: 300,
      upload: 20,
    },
  },
  [PLAN_IDS.INDIVIDUAL]: {
    name: "Individual",
    quotas: {
      analyze: 50,
      chat: 3000,
      upload: 300,
    },
  },
  [PLAN_IDS.TEAM]: {
    name: "Team",
    quotas: {
      analyze: null,
      chat: null,
      upload: null,
    },
  },
  [PLAN_IDS.ENTERPRISE]: {
    name: "Enterprise",
    quotas: {
      analyze: null,
      chat: null,
      upload: null,
    },
  },
};

export const DEFAULT_PLAN_ID = PLAN_IDS.FREE;

export const normalizePlanId = (value) => {
  if (!value || typeof value !== "string") return DEFAULT_PLAN_ID;
  const key = value.trim().toLowerCase();
  if (Object.prototype.hasOwnProperty.call(PLAN_LIMITS, key)) return key;
  return DEFAULT_PLAN_ID;
};

export const getPlanDetails = (planId) => {
  const normalized = normalizePlanId(planId);
  return {
    id: normalized,
    ...PLAN_LIMITS[normalized],
  };
};
