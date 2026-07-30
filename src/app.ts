import express from "express";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import cors from "cors";

// src/app.ts
import morgan from "morgan";
import { errorMiddleware } from "./middleware/error.middleware";
import { AppError } from "./utils/appError";
import authRoutes from "./routes/auth.routes";

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────

// 1. Set secure HTTP headers to mitigate cross-site scripting (XSS) and clickJacking
app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// 2. Sanitize user input to prevent NoSQL Query Injection attacks

// 3. Limit repeated requests to public APIs / endpoints
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again after 15 minutes.",
});

app.use("/api/", limiter);

// ─── Standard Middleware ──────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" })); // Body parser with payload limit protection
app.use(mongoSanitize());
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/v1/auth", authRoutes);

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});
app.use(errorMiddleware);

export default app;
