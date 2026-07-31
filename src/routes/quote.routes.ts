import { Router } from "express";
import {
  addQuote,
  getMyQuotes,
  deleteQuote,
} from "../controllers/quote.controller";
import { protect } from "../middleware/auth.middleware";

const quoteRoutes = Router();

quoteRoutes.use(protect);

quoteRoutes.get("/", getMyQuotes);

quoteRoutes.get("/:bookId", getMyQuotes);
quoteRoutes.post("/:bookId", addQuote);

quoteRoutes.delete("/:id", deleteQuote);

export default quoteRoutes;
