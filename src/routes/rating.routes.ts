import { Router } from "express";
import {
  rateBook,
  getBookRatings,
  deleteRating,
} from "../controllers/rating.controller";
import { protect } from "../middleware/auth.middleware";

const ratingRoutes = Router();

ratingRoutes.use(protect);

ratingRoutes.get("/:bookId", getBookRatings);
ratingRoutes.post("/:bookId", rateBook);
ratingRoutes.delete("/:bookId", deleteRating);

export default ratingRoutes;
