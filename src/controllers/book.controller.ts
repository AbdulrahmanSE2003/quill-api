import { Request, Response, NextFunction } from "express";
import Book from "../models/book.model";
import BookChunk from "../models/bookChunk.model";
import { AppError } from "../utils/appError";
import { extractTextFromPDF } from "../utils/pdfExtractor";
import { chunkText } from "../utils/chunkText";
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary";
import Rating from "../models/rating.model";
import Progress from "../models/progress.model";

// ─── Admin: Upload Book ───────────────────────────────────────────────────────
export const uploadBook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) return next(new AppError("You are not logged in.", 401));

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  if (!files?.cover?.[0])
    return next(new AppError("Cover image is required.", 400));

  const { title, author, description, language, categories } = req.body;

  const coverUrl = await uploadBufferToCloudinary(
    files.cover[0].buffer,
    "quill/covers",
    "image",
  );

  const text = await extractTextFromPDF(files.pdf[0].buffer);

  const chunks = chunkText(text);

  const book = await Book.create({
    title,
    author,
    coverImage: coverUrl,
    description,
    language: language || "en",
    categories: categories ? JSON.parse(categories) : [],
    totalChunks: chunks.length,
    sourceType: "external",
    uploadedBy: req.user._id,
    isPublic: true,
  });

  // 6. حفظ الـchunks — insertMany أسرع من create واحد واحد
  const bookChunks = chunks.map((content, index) => ({
    bookId: book._id,
    chunkIndex: index,
    content,
    wordCount: content.split(/\s+/).length,
  }));

  await BookChunk.insertMany(bookChunks);

  res.status(201).json({
    status: "success",
    data: {
      book: {
        id: book._id,
        title: book.title,
        totalChunks: book.totalChunks,
      },
    },
  });
};

// ─── Get All Books ────────────────────────────────────────────────────────────
export const getAllBooks = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) return next(new AppError("You are not logged in.", 401));
  const user = req.user;

  const filter =
    user.role === "admin"
      ? {}
      : { $or: [{ isPublic: true }, { uploadedBy: user._id }] };

  const books = await Book.find(filter).select("-__v");

  res.status(200).json({
    status: "success",
    results: books.length,
    data: { books },
  });
};

// ─── Get Single Book ──────────────────────────────────────────────────────────
export const getBook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) return next(new AppError("You are not logged in.", 401));
  const user = req.user;

  const book = await Book.findById(req.params.id);
  if (!book) return next(new AppError("Book not found.", 404));

  // تحقق من الصلاحية
  const canAccess =
    book.isPublic ||
    user.role === "admin" ||
    book.uploadedBy.toString() === user._id.toString();

  if (!canAccess)
    return next(new AppError("You don't have access to this book.", 403));

  res.status(200).json({
    status: "success",
    data: { book },
  });
};

// ─── Delete Book ──────────────────────────────────────────────────────────────
export const deleteBook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const book = await Book.findById(req.params.id);
  if (!book) return next(new AppError("Book not found.", 404));

  // امسح الـchunks مع الكتاب
  await BookChunk.deleteMany({ bookId: book._id });
  await book.deleteOne();
  await Rating.deleteMany({
    bookId: book._id,
  });

  res.status(204).json({ status: "success", data: null });
};

export const getChunk = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) return next(new AppError("You are not logged in.", 401));

  const { id, chunkIndex } = req.params;
  const currentIndex = Number(chunkIndex);

  const book = await Book.findById(id);
  if (!book) return next(new AppError("Book not found.", 404));

  const canAccess =
    book.isPublic ||
    req.user.role === "admin" ||
    book.uploadedBy.toString() === req.user._id.toString();

  if (!canAccess)
    return next(new AppError("You don't have access to this book.", 403));

  const chunk = await BookChunk.findOne({
    bookId: id,
    chunkIndex: currentIndex,
  });
  if (!chunk) return next(new AppError("Chunk not found.", 404));

  const isFinished = currentIndex === book.totalChunks - 1;

  const progress = await Progress.findOneAndUpdate(
    { userId: req.user._id, bookId: id },
    {
      currentChunkIndex: currentIndex,
      status: isFinished ? "finished" : "reading",
      lastReadAt: new Date(),
    },
    { upsert: true, new: true },
  );
  console.log(progress);

  res.status(200).json({
    status: "success",
    data: { chunk },
  });
};

export const downloadBook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) return next(new AppError("You are not logged in.", 401));

  const book = await Book.findById(req.params.id);
  if (!book) return next(new AppError("Book not found.", 404));

  const canAccess =
    book.isPublic ||
    req.user.role === "admin" ||
    book.uploadedBy.toString() === req.user._id.toString();

  if (!canAccess)
    return next(new AppError("You don't have access to this book.", 403));

  const chunks = await BookChunk.find({ bookId: req.params.id })
    .sort({ chunkIndex: 1 })
    .select("-__v");

  res.status(200).json({
    status: "success",
    data: { book, chunks },
  });
};
