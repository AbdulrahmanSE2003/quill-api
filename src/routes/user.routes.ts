import { Router } from "express";
import {
  getMe,
  updateMe,
  deactivateMe,
  getAllUsers,
  deleteUser,
} from "../controllers/user.controller";
import { protect } from "../middleware/auth.middleware";
import { restrictTo } from "../middleware/role.middleware";

const userRoutes = Router();

userRoutes.use(protect);

userRoutes.get("/me", getMe);
userRoutes.patch("/me", updateMe);
userRoutes.delete("/me", deactivateMe);

// Admin only
userRoutes.get("/", restrictTo("admin"), getAllUsers);
userRoutes.delete("/:id", restrictTo("admin"), deleteUser);

export default userRoutes;
