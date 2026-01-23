import express from "express";
import cors from "cors";
import analyzeRoutes from "./routes/analyze.js";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/chat", chatRoutes);

export default app;
