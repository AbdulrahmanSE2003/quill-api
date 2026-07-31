import mongoose, { Document, Schema, Types } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import validator from "validator";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  passwordConfirm: string | undefined;
  passwordChangedAt: Date;
  googleId?: string;
  role: "user" | "admin"; //(default: 'user')
  isActive: boolean; //(default: true)
  lastSignIn: Date;
  currentStreak: Number;
  longestStreak: Number;
  lastReadDate: Date;

  matchPassword(enteredPassword: string): Promise<boolean>;
  createPasswordResetToken(): string;

  passwordResetToken?: string;
  passwordResetExpire?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please provide your name."],
      maxLength: [40, "User's name must be less than or equal 40 characters."],
    },
    email: {
      type: String,
      required: [true, "Please provide your email."],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email."],
    },
    password: {
      type: String,
      required: function (this: IUser) {
        return !this.googleId; // required بس لو مش Google user
      },
      minLength: [8, "Password must be at least 8 characters."],
      select: false,
    },

    passwordConfirm: {
      type: String,
      required: function (this: IUser) {
        return !this.googleId;
      },
      validate: {
        validator: function (this: any, el: string) {
          return el === this.password;
        },
        message: "Passwords are not the same!",
      },
    },
    passwordChangedAt: Date,
    googleId: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isActive: { type: Boolean, default: true }, //(default: true)
    lastSignIn: Date,
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastReadDate: Date,

    passwordResetToken: String,
    passwordResetExpire: Date,
  },
  {
    timestamps: true,
  },
);

// ========================================================

// 3. Mongoose Middlewares (Pre-save Hook)

// ========================================================

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined as any;
});

// ========================================================

// 4. Instance Methods

// ========================================================

userSchema.methods.matchPassword = async function (
  enteredPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
  return resetToken; // Send plain token via email, store hashed in DB
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
