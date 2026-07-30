import mongoose, { Document, Schema, Types } from "mongoose";

export interface IBookmarkMOde extends Document {
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
  chunkIndex: Types.ObjectId;
}

const bookmarkModeSchema = new Schema<IBookmarkMOde>({
  userId: { type: Schema.ObjectId, ref: "User", required: true },
  bookId: { type: Schema.ObjectId, ref: "Book", required: true },
  chunkIndex: { type: Schema.ObjectId, ref: "BookChunk", required: true },
});

bookmarkModeSchema.index(
  { userId: 1, bookId: 1, chunkIndex: 1 },
  { unique: true },
);

const BookmarkMOde = mongoose.model<IBookmarkMOde>(
  "BookmarkMOde",
  bookmarkModeSchema,
);

export default BookmarkMOde;
