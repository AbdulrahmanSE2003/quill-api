import mongoose, { Document, Schema, Types } from "mongoose";

export interface IBadge extends Document {
  userId: Types.ObjectId;
  type: "" | ""; //TODO handle later
  earnedAt: Date;
}

const badgeSchema = new Schema<IBadge>({
  userId: { type: Schema.ObjectId, ref: "User", required: true },
  type: { type: String, enum: [""] },
  earnedAt: { type: Date, default: Date.now },
});

const Badge = mongoose.model<IBadge>("Badge", badgeSchema);

export default Badge;
