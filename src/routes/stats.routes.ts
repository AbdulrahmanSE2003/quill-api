import { Router } from "express";
import { logSession, getMyStats } from "../controllers/stats.controller";
import { protect } from "../middleware/auth.middleware";

const statsRoutes = Router();

statsRoutes.use(protect);

statsRoutes.get("/", getMyStats);
statsRoutes.post("/session", logSession);

export default statsRoutes;
