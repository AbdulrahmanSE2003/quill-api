import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  googleCallback,
} from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";
import passport from "passport";

const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/refresh", refreshToken);
authRoutes.post("/logout", logout);
authRoutes.get("/me", protect, getMe);

authRoutes.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

authRoutes.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  googleCallback,
);

export default authRoutes;
