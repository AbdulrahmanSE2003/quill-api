import mongoose, { Document, Schema, Types } from "mongoose";
import BookChunk from "./bookChunk.model";
import Rating from "./rating.model";
import Wishlist from "./wishlist.model";
import Progress from "./progress.model";
import Quote from "./quote.model";
import ReadingStats from "./readingStats.model";
import BookmarkModel from "./bookmark.model";

export interface IBook extends Document {
  _id: Types.ObjectId;
  title: string;
  author: string;
  coverImage: string;
  description: string;
  language: string;
  categories: string[];
  sourceType: "external" | "upload";
  uploadedBy: Types.ObjectId;
  totalChunks: number;
  ratingsAverage: number;
  ratingsCount: number;
  isPublic: boolean;
}

const bookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    coverImage: { type: String, required: true },
    description: { type: String, required: true },
    language: { type: String, required: true },
    categories: [{ type: String, maxLength: 10 }],
    sourceType: {
      type: String,
      enum: ["external", "upload"],
      default: "upload",
    },
    uploadedBy: { type: Schema.ObjectId, ref: "User" },
    totalChunks: Number,
    ratingsAverage: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true },
);

bookSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    const bookId = this._id;

    await Promise.all([
      BookChunk.deleteMany({ bookId }),
      Rating.deleteMany({ bookId }),
      Wishlist.deleteMany({ bookId }),
      Progress.deleteMany({ bookId }),
      ReadingStats.deleteMany({ bookId }),
      Quote.deleteMany({ bookId }),
      BookmarkModel.deleteMany({ bookId }),
    ]);
  },
);

const Book = mongoose.model<IBook>("Book", bookSchema);

export default Book;
