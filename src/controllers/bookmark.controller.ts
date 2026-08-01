import { Request, Response, NextFunction } from "express";
import Bookmark from "../models/bookmark.model";
import Book from "../models/book.model";
import { AppError } from "../utils/appError";

// ─── Add Bookmark ─────────────────────────────────────────────────────────────
export const addBookmark = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) return next(new AppError("You are not logged in.", 401));

  const { chunkIndex } = req.body;

  const book = await Book.findById(req.params.bookId);
  if (!book) return next(new AppError("Book not found.", 404));

  if (chunkIndex > book.totalChunks)
    return next(new AppError("Bookmark not valid.", 400));

  const existing = await Bookmark.findOne({
    userId: req.user._id,
    bookId: req.params.bookId,
    chunkIndex,
  });
  if (existing) return next(new AppError("Bookmark already exists.", 400));

  const bookmark = await Bookmark.create({
    userId: req.user._id,
    bookId: req.params.bookId as string,
    chunkIndex,
  });

  res.status(201).json({
    status: "success",
    data: { bookmark },
  });
};

// ─── Get My Bookmarks ─────────────────────────────────────────────────────────
export const getBookmarks = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) return next(new AppError("You are not logged in.", 401));

  const filter: any = { userId: req.user._id };
  if (req.params.bookId) filter.bookId = req.params.bookId;

  const bookmarks = await Bookmark.find(filter)
    .populate("bookId", "title author coverImage")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: bookmarks.length,
    data: { bookmarks },
  });
};

// ─── Delete Bookmark ──────────────────────────────────────────────────────────
export const deleteBookmark = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) return next(new AppError("You are not logged in.", 401));

  const bookmark = await Bookmark.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!bookmark) return next(new AppError("Bookmark not found.", 404));

  res.status(204).json({ status: "success", data: null });
};
