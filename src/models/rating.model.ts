import mongoose, { Document, Schema, Types } from "mongoose";
import Book from "./book.model";

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

ratingSchema.post("save", async function () {
  const stats = await Rating.aggregate([
    { $match: { bookId: this.bookId } },
    {
      $group: {
        _id: "$bookId",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  await Book.findByIdAndUpdate(this.bookId, {
    ratingsAverage: stats[0]?.avg ?? 0,
    ratingsCount: stats[0]?.count ?? 0,
  });
});

const Rating = mongoose.model<IRating>("Rating", ratingSchema);

export default Rating;
