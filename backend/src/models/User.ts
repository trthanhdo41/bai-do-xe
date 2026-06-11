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
  twoFactorEnabled: boolean;
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
    twoFactorEnabled: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", userSchema);
