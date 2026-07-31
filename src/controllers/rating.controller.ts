import { Request, Response, NextFunction } from "express";
import Rating from "../models/rating.model";
import Book from "../models/book.model";
import { AppError } from "../utils/appError";

// ─── Add or Update Rating ─────────────────────────────────────────────────────
export const rateBook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) return next(new AppError("You are not logged in.", 401));

  const { rating } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return next(new AppError("Rating must be between 1 and 5.", 400));
  }

  const book = await Book.findById(req.params.bookId);
  if (!book) return next(new AppError("Book not found.", 404));

  const existing = await Rating.findOne({
    userId: req.user._id,
    bookId: req.params.bookId,
  });

  let result;
  if (existing) {
    existing.rating = rating;
    result = await existing.save();
  } else {
    result = await Rating.create({
      userId: req.user._id,
      bookId: req.params.bookId as string,
      rating,
    });
  }

  res.status(200).json({
    status: "success",
    data: { rating: result },
  });
};

// ─── Get Book Ratings ─────────────────────────────────────────────────────────
export const getBookRatings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const book = await Book.findById(req.params.bookId);
  if (!book) return next(new AppError("Book not found.", 404));

  res.status(200).json({
    status: "success",
    data: {
      ratingsAverage: book.ratingsAverage,
      ratingsCount: book.ratingsCount,
    },
  });
};

// ─── Delete Rating ────────────────────────────────────────────────────────────
export const deleteRating = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) return next(new AppError("You are not logged in.", 401));

  const rating = await Rating.findOneAndDelete({
    userId: req.user._id,
    bookId: req.params.bookId,
  });

  if (!rating) return next(new AppError("Rating not found.", 404));

  const stats = await Rating.aggregate([
    { $match: { bookId: rating.bookId } },
    {
      $group: { _id: "$bookId", avg: { $avg: "$rating" }, count: { $sum: 1 } },
    },
  ]);

  await Book.findByIdAndUpdate(rating.bookId, {
    ratingsAverage: stats[0]?.avg ?? 0,
    ratingsCount: stats[0]?.count ?? 0,
  });

  res.status(204).json({ status: "success", data: null });
};
