import mongoose, { Document, Schema, Types } from "mongoose";

export interface IReadingStats extends Document {
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
  date: Date;
  minutesRead: number;
  pagesRead: number;
  chunksRead: number;
  wordsRead: number;
}

const readingStatsSchema = new Schema<IReadingStats>({
  userId: { type: Schema.ObjectId, ref: "User", required: true },
  bookId: { type: Schema.ObjectId, ref: "Book", required: true },
  date: { type: Date, default: Date.now },
  minutesRead: Number,
  pagesRead: Number,
  chunksRead: Number,
  wordsRead: Number,
});

readingStatsSchema.index({ userId: 1, date: 1 });

const ReadingStats = mongoose.model<IReadingStats>(
  "ReadingStats",
  readingStatsSchema,
);

export default ReadingStats;
