import mongoose, { Document, Schema, Types } from "mongoose";

export interface IRating extends Document {
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
  rating: number;
}

const ratingSchema = new Schema<IRating>(
  {
    userId: { type: Schema.ObjectId, ref: "User", required: true },
    bookId: { type: Schema.ObjectId, ref: "Book", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true },
);

ratingSchema.index({ userId: 1, bookId: 1 }, { unique: true });
const Rating = mongoose.model<IRating>("Rating", ratingSchema);

export default Rating;
