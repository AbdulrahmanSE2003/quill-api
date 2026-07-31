import multer from "multer";
import { AppError } from "../utils/appError";

const storage = multer.memoryStorage();

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.fieldname === "cover") {
    file.mimetype.startsWith("image/")
      ? cb(null, true)
      : cb(new AppError("Cover must be an image.", 400));
  } else if (file.fieldname === "pdf") {
    file.mimetype === "application/pdf"
      ? cb(null, true)
      : cb(new AppError("Book file must be a PDF.", 400));
  } else {
    cb(new AppError("Unexpected field.", 400));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});
