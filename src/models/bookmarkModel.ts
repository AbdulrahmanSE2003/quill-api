import mongoose, { Document, Schema, Types } from "mongoose";

export interface IBookmarkModel extends Document {
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
  chunkIndex: number;
}

const BookmarkModelSchema = new Schema<IBookmarkModel>({
  userId: { type: Schema.ObjectId, ref: "User", required: true },
  bookId: { type: Schema.ObjectId, ref: "Book", required: true },
  chunkIndex: { type: Number, required: true },
});

bookmarkModelSchema.index(
  { userId: 1, bookId: 1, chunkIndex: 1 },
  { unique: true },
);

const BookmarkModel = mongoose.model<IBookmarkModel>(
  "BookmarkMOde",
  bookmarkModelSchema,
);

export default BookmarkModel;
