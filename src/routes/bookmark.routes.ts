import { Router } from "express";
import {
  addBookmark,
  getBookmarks,
  deleteBookmark,
} from "../controllers/bookmark.controller";
import { protect } from "../middleware/auth.middleware";

const bookmarkRoutes = Router();

bookmarkRoutes.use(protect);

bookmarkRoutes.get("/", getBookmarks);
bookmarkRoutes.get("/:bookId", getBookmarks);
bookmarkRoutes.post("/:bookId", addBookmark);
bookmarkRoutes.delete("/:id", deleteBookmark);

export default bookmarkRoutes;
