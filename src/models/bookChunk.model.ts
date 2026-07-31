import mongoose, { Document, Schema, Types } from "mongoose";

export interface IBookChunk extends Document {
  bookId: Types.ObjectId;
  chunkIndex: number;
  content: string;
  wordCount: number;
}

const bookChunkSchema = new Schema<IBookChunk>(
  {
    bookId: { type: Schema.ObjectId, ref: "Book", required: true },
    chunkIndex: { type: Number, required: true },
    content: { type: String, required: true },
    wordCount: Number,
  },
  {
    timestamps: true,
  },
);
bookChunkSchema.index({ bookId: 1, chunkIndex: 1 });

const BookChunk = mongoose.model<IBookChunk>("BookChunk", bookChunkSchema);

export default BookChunk;
