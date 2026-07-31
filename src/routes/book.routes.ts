import { Router } from "express";
import {
  uploadBook,
  getAllBooks,
  getBook,
  deleteBook,
  getChunk,
  downloadBook,
} from "../controllers/book.controller";
import { protect } from "../middleware/auth.middleware";
import { restrictTo } from "../middleware/role.middleware";
import { upload } from "../middleware/upload.middleware";

const bookRoutes = Router();

bookRoutes.use(protect);

bookRoutes.get("/", getAllBooks);
bookRoutes.get("/:id", getBook);
bookRoutes.get("/:id/download", downloadBook);
bookRoutes.get("/:id/chunks/:chunkIndex", getChunk);

// Admin only
bookRoutes.post(
  "/",
  restrictTo("admin"),
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  uploadBook,
);

bookRoutes.delete("/:id", restrictTo("admin"), deleteBook);

export default bookRoutes;
