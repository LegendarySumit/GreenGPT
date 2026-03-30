import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { initSentry } from "./config/sentry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env")
});

// Environment validation in production
if (process.env.NODE_ENV === 'production') {
  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'GEMINI_API_KEY',
    'GEMINI_MODEL',
  ];
  
  const missing = requiredEnvVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

import app from "./app.js";

const PORT = process.env.PORT || 5001;
const sentryState = initSentry();

app.listen(PORT, () => {
  if (sentryState.enabled) {
    console.log("Sentry monitoring enabled");
  }
  console.log(`Server running on port ${PORT}`);
});
