import mongoose, { Document, Schema } from "mongoose";
import { Types } from "mongoose";

export interface IQuote extends Document {
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
  content: string;
  chunkIndex: number;
}

const quoteSchema = new Schema<IQuote>(
  {
    userId: { type: Schema.ObjectId, ref: "User", required: true },
    bookId: { type: Schema.ObjectId, ref: "Book", required: true },
    content: { type: String, required: true },
    chunkIndex: { type: Number, required: true },
  },
  { timestamps: true },
);

const Quote = mongoose.model<IQuote>("Quote", quoteSchema);

export default Quote;
