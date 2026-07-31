import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import sanitize from "mongo-sanitize";
import passport from "passport";

import { errorMiddleware } from "./middleware/error.middleware";
import { AppError } from "./utils/appError";
import authRoutes from "./routes/auth.routes";
import bookRoutes from "./routes/book.routes";
import userRoutes from "./routes/user.routes";
import readingRoutes from "./routes/reading.routes";
import wishlistRoutes from "./routes/wishlist.routes";

const app = express();

// ─── Security & Logging Middleware ───────────────────────────────────────────

// Set secure HTTP headers
app.use(helmet());

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate limiting for API routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes.",
});
app.use("/api", limiter);

// ─── Body Parsers & Sanitization ──────────────────────────────────────────────

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Sanitize user input against NoSQL Query Injection (must come after body parser)
app.use((req, res, next) => {
  req.body = sanitize(req.body);
  next();
});

app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(passport.initialize());

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/books", bookRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/reading", readingRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/quotes", quoteRoutes);

// Handle 404s
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Middleware
app.use(errorMiddleware);

export default app;
