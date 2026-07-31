import { Request, Response, NextFunction } from "express";
import Wishlist from "../models/wishlist.model";
import Book from "../models/book.model";
import { AppError } from "../utils/appError";

// ─── Add to Wishlist ──────────────────────────────────────────────────────────
export const addToWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) return next(new AppError("You are not logged in.", 401));

  const book = await Book.findById(req.params.bookId);
  if (!book) return next(new AppError("Book not found.", 404));

  const existing = await Wishlist.findOne({
    userId: req.user._id,
    bookId: req.params.bookId,
  });
  if (existing) return next(new AppError("Book already in wishlist.", 400));

  const item = await Wishlist.create({
    userId: req.user._id,
    bookId: req.params.bookId as string,
  });

  res.status(201).json({
    status: "success",
    data: { item },
  });
};

// ─── Remove from Wishlist ─────────────────────────────────────────────────────
export const removeFromWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) return next(new AppError("You are not logged in.", 401));

  const item = await Wishlist.findOneAndDelete({
    userId: req.user._id,
    bookId: req.params.bookId,
  });

  if (!item) return next(new AppError("Book not in wishlist.", 404));

  res.status(204).json({ status: "success", data: null });
};

// ─── Get My Wishlist ──────────────────────────────────────────────────────────
export const getWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) return next(new AppError("You are not logged in.", 401));

  const wishlist = await Wishlist.find({ userId: req.user._id })
    .populate("bookId", "title author coverImage ratingsAverage")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: wishlist.length,
    data: { wishlist },
  });
};
