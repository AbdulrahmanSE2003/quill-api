import { Request, Response, NextFunction } from "express";
import ReadingStats from "../models/readingStats.model";
import Progress from "../models/progress.model";
import { AppError } from "../utils/appError";

// ─── Log Reading Session ──────────────────────────────────────────────────────
export const logSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) return next(new AppError("You are not logged in.", 401));

  const { bookId, minutesRead, pagesRead, chunksRead, wordsRead } = req.body;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // لو في session لنفس الكتاب النهارده → اجمع عليها
  const stats = await ReadingStats.findOneAndUpdate(
    { userId: req.user._id, bookId, date: today },
    {
      $inc: {
        minutesRead: minutesRead || 0,
        pagesRead: pagesRead || 0,
        chunksRead: chunksRead || 0,
        wordsRead: wordsRead || 0,
      },
    },
    { upsert: true, new: true },
  );

  // اعمل update للـstreak
  await updateStreak(req.user._id.toString());

  res.status(200).json({
    status: "success",
    data: { stats },
  });
};

// ─── Get My Stats ─────────────────────────────────────────────────────────────
export const getMyStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) return next(new AppError("You are not logged in.", 401));

  const { period } = req.query; // week | month | all

  const dateFilter: any = {};
  if (period === "week") {
    dateFilter.$gte = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === "month") {
    dateFilter.$gte = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  const matchFilter: any = { userId: req.user._id };
  if (Object.keys(dateFilter).length) matchFilter.date = dateFilter;

  const stats = await ReadingStats.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: null,
        totalMinutes: { $sum: "$minutesRead" },
        totalWords: { $sum: "$wordsRead" },
        totalChunks: { $sum: "$chunksRead" },
        totalDays: { $sum: 1 },
      },
    },
  ]);

  const booksFinished = await Progress.countDocuments({
    userId: req.user._id,
    status: "completed",
  });

  res.status(200).json({
    status: "success",
    data: {
      stats: stats[0] ?? {
        totalMinutes: 0,
        totalWords: 0,
        totalChunks: 0,
        totalDays: 0,
      },
      booksFinished,
      streak: {
        current: req.user.currentStreak,
        longest: req.user.longestStreak,
      },
    },
  });
};

// ─── Streak Helper ────────────────────────────────────────────────────────────
const updateStreak = async (userId: string) => {
  const User = (await import("../models/user.model")).default;
  const user = await User.findById(userId);
  if (!user) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastRead = user.lastReadDate ? new Date(user.lastReadDate) : null;
  if (lastRead) lastRead.setHours(0, 0, 0, 0);

  const isToday = lastRead?.getTime() === today.getTime();
  if (isToday) return;

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = lastRead?.getTime() === yesterday.getTime();

  const newStreak = isYesterday ? (user.currentStreak as number) + 1 : 1;

  await User.findByIdAndUpdate(userId, {
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, user.longestStreak as number),
    lastReadDate: today,
  });
};
