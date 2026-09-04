import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import tasksRoutes from "./routes/tasks.routes.js";

const app = express();

// Middleware Globali
app.use(morgan("dev"));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Registrazione Router
app.use("/api/auth", authRoutes);
app.use("/api/tasks", tasksRoutes);

export default app;
