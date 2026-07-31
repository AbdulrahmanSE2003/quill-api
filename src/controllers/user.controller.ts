import { Request, Response, NextFunction } from "express";
import User from "../models/user.model";
import { AppError } from "../utils/appError";

// ─── Get My Profile ───────────────────────────────────────────────────────────
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) return next(new AppError("You are not logged in.", 401));

  res.status(200).json({
    status: "success",
    data: { user: req.user },
  });
};

// ─── Update My Profile ────────────────────────────────────────────────────────
export const updateMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) return next(new AppError("You are not logged in.", 401));

  // منع تغيير الـpassword من هنا
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("This route is not for password updates.", 400));
  }

  const allowedFields = ["name", "email"];
  const updates: any = {};
  allowedFields.forEach((field) => {
    if (req.body[field]) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: { user },
  });
};

// ─── Deactivate My Account ────────────────────────────────────────────────────
export const deactivateMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) return next(new AppError("You are not logged in.", 401));

  await User.findByIdAndUpdate(req.user._id, { isActive: false });

  res.status(204).json({ status: "success", data: null });
};

// ─── Admin: Get All Users ─────────────────────────────────────────────────────
export const getAllUsers = async (req: Request, res: Response) => {
  const users = await User.find().select("-__v");

  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
};

// ─── Admin: Delete User ───────────────────────────────────────────────────────
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(new AppError("User not found.", 404));

  res.status(204).json({ status: "success", data: null });
};
