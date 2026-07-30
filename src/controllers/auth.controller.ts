import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel";
import { AppError } from "../utils/appError";
import {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
} from "../utils/generateTokens";

// ─── Register ─────────────────────────────────────────────────────────────────
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, email, password, passwordConfirm } = req.body;

  // existing email
  const existingUser = await User.findOne({ email });
  if (existingUser)
    return next(new AppError("Invalid operations, Email already in use.", 400));

  const user = await User.create({ name, email, password, passwordConfirm });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  setRefreshTokenCookie(res, refreshToken);

  res.status(201).json({
    status: "success",
    accessToken,
    refreshToken,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new AppError(
        "Invalid operations, Please provide email and password.",
        400,
      ),
    );
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    return next(
      new AppError("Invalid operations, Incorrect email or password.", 401),
    );
  }

  if (!user.isActive) {
    return next(
      new AppError("Invalid operations, Account is deactivated.", 401),
    );
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  setRefreshTokenCookie(res, refreshToken);

  res.status(200).json({
    status: "success",
    accessToken,
    refreshToken,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
};

// ─── Refresh Token ────────────────────────────────────────────────────────────
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.refreshToken;
  if (!token)
    return next(new AppError("Invalid operations, No refresh token.", 401));

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
    id: string;
  };

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    return next(new AppError("User no longer exists.", 401));
  }

  const newAccessToken = generateAccessToken(user.id);

  res.status(200).json({
    status: "success",
    accessToken: newAccessToken,
  });
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = async (req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({ status: "success", message: "Logged out." });
};

// ─── Get Me ───────────────────────────────────────────────────────────────────
export const getMe = async (req: Request, res: Response) => {
  const user = (req as any).user;

  res.status(200).json({
    status: "success",
    data: { user },
  });
};
