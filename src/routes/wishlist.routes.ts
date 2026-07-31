import { Router } from "express";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../controllers/wishlist.controller";
import { protect } from "../middleware/auth.middleware";

const wishlistRoutes = Router();

wishlistRoutes.use(protect);

wishlistRoutes.get("/", getWishlist);
wishlistRoutes.post("/:bookId", addToWishlist);
wishlistRoutes.delete("/:bookId", removeFromWishlist);

export default wishlistRoutes;
