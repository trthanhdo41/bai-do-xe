import mongoose, { Model, Schema } from "mongoose";

export type UserRole = "admin" | "staff" | "customer";

export type UserDocument = {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: "Đang hoạt động" | "Đã khóa";
  wallet: number;
  phone?: string;
  avatarUrl?: string;
  provider: "credentials" | "google" | "mixed";
  googleId?: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  twoFactorPendingSecret?: string;
  // Extended fields
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
  gender?: "male" | "female" | "other";
  idCardNumber?: string;
  address?: string;
  city?: string;
  district?: string;
  company?: string;
  lastLoginAt?: Date;
  lastLoginIp?: string;
  failedLoginCount: number;
  lockedUntil?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "staff", "customer"], default: "customer" },
    status: { type: String, enum: ["Đang hoạt động", "Đã khóa"], default: "Đang hoạt động" },
    wallet: { type: Number, default: 0 },
    phone: { type: String },
    avatarUrl: { type: String },
    provider: { type: String, enum: ["credentials", "google", "mixed"], default: "credentials" },
    googleId: { type: String, index: true },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    twoFactorPendingSecret: { type: String },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    birthDate: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    idCardNumber: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    district: { type: String, trim: true },
    company: { type: String, trim: true },
    lastLoginAt: { type: Date },
    lastLoginIp: { type: String },
    failedLoginCount: { type: Number, default: 0 },
    lockedUntil: { type: Date },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", userSchema);
