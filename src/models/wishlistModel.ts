import mongoose, { Document, Schema, Types } from "mongoose";

export interface IWishlist extends Document {
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
}

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: { type: Schema.ObjectId, ref: "User" },
    bookId: { type: Schema.ObjectId, ref: "Book" },
  },
  { timestamps: true },
);

wishlistSchema.index({ userId: 1, bookId: 1 });

const Wishlist = mongoose.model<IWishlist>("Wishlist", wishlistSchema);

export default Wishlist;
