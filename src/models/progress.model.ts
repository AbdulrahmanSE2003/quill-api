import mongoose, { Document, Schema, Types } from "mongoose";

export interface IProgress extends Document {
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
  status: "not_started" | "reading" | "completed";
  currentChunkIndex: number; //(default: 0)
  isFavorite: boolean;
  lastReadAt: Date;
}

const progressSchema = new Schema<IProgress>(
  {
    userId: { type: Schema.ObjectId, ref: "User", required: true },
    bookId: { type: Schema.ObjectId, ref: "Book", required: true },
    status: {
      type: String,
      enum: ["not_started", "reading", "completed"],
      default: "not_started",
    },
    currentChunkIndex: { type: Number, required: true, default: 0 },
    isFavorite: Boolean,
    lastReadAt: Date,
  },
  { timestamps: true },
);

progressSchema.index({ userId: 1, bookId: 1 });

const Progress = mongoose.model<IProgress>("Progress", progressSchema);

export default Progress;
