import mongoose, { Document, Schema, Types } from "mongoose";

export interface IBadge extends Document {
  userId: Types.ObjectId;
  badges: "" | ""; //TODO handle later
  earnedAt: Date;
}

const badgeSchema = new Schema<IBadge>({
  userId: { type: Schema.ObjectId, ref: "User", required: true },
  badges: { type: String, enum: [""] },
  earnedAt: Date,
});

const Badge = mongoose.model<IBadge>("Badge", badgeSchema);

export default Badge;
