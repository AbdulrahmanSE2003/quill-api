import { Router } from "express";
import {
  getProgress,
  toggleFavourite,
  getReadingList,
} from "../controllers/reading.controller";
import { protect } from "../middleware/auth.middleware";

const readingRoutes = Router();

readingRoutes.use(protect);

readingRoutes.get("/", getReadingList);
readingRoutes.get("/:bookId", getProgress);
readingRoutes.patch("/:bookId/favourite", toggleFavourite);

export default readingRoutes;
