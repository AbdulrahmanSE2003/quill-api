import { Request, Response, NextFunction } from "express";
import Quote from "../models/quote.model";
import Book from "../models/book.model";
import { AppError } from "../utils/appError";

// ─── Add Quote ────────────────────────────────────────────────────────────────
export const addQuote = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) return next(new AppError("You are not logged in.", 401));

  const { content, chunkIndex } = req.body;

  const book = await Book.findById(req.params.bookId);
  if (!book) return next(new AppError("Book not found.", 404));

  const quote = await Quote.create({
    userId: req.user._id,
    bookId: req.params.bookId as string,
    content,
    chunkIndex,
  });

  res.status(201).json({
    status: "success",
    data: { quote },
  });
};

// ─── Get My Quotes ────────────────────────────────────────────────────────────
export const getMyQuotes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) return next(new AppError("You are not logged in.", 401));

  const filter: any = { userId: req.user._id };
  if (req.params.bookId) filter.bookId = req.params.bookId;

  const quotes = await Quote.find(filter)
    .populate("bookId", "title author coverImage")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: quotes.length,
    data: { quotes },
  });
};

// ─── Delete Quote ─────────────────────────────────────────────────────────────
export const deleteQuote = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) return next(new AppError("You are not logged in.", 401));

  const quote = await Quote.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!quote) return next(new AppError("Quote not found.", 404));

  res.status(204).json({ status: "success", data: null });
};
