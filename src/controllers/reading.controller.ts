import { Request, Response, NextFunction } from "express";
import Progress from "../models/progress.model";
import { AppError } from "../utils/appError";

// ─── Get or Create Progress ───────────────────────────────────────────────────
export const getProgress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) return next(new AppError("You are not logged in.", 401));

  const progress = await Progress.findOneAndUpdate(
    { userId: req.user._id, bookId: req.params.bookId },
    { $setOnInsert: { status: "not_started", currentChunkIndex: 0 } },
    { upsert: true, new: true },
  );

  res.status(200).json({
    status: "success",
    data: { progress },
  });
};

// ─── Toggle Favourite ─────────────────────────────────────────────────────────
export const toggleFavourite = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) return next(new AppError("You are not logged in.", 401));

  const progress = await Progress.findOne({
    userId: req.user._id,
    bookId: req.params.bookId,
  });

  if (!progress)
    return next(new AppError("Start reading this book first.", 400));

  progress.isFavorite = !progress.isFavorite;
  await progress.save();

  res.status(200).json({
    status: "success",
    data: { isFavorite: progress.isFavorite },
  });
};

// ─── Get All User Reading List ────────────────────────────────────────────────
export const getReadingList = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) return next(new AppError("You are not logged in.", 401));

  const { status } = req.query;

  const filter: any = { userId: req.user._id };
  if (status) filter.status = status;

  const list = await Progress.find(filter)
    .populate("bookId", "title author coverImage totalChunks")
    .sort({ lastReadAt: -1 });

  res.status(200).json({
    status: "success",
    results: list.length,
    data: { list },
  });
};
