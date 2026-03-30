import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { initSentry } from "./config/sentry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env")
});

import app from "./app.js";

const PORT = process.env.PORT || 5001;
const sentryState = initSentry();

app.listen(PORT, () => {
  if (sentryState.enabled) {
    console.log("Sentry monitoring enabled");
  }
  console.log(`Server running on port ${PORT}`);
});
