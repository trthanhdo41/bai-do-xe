import mongoose, { Model, Schema } from "mongoose";

export type ShiftDocument = {
  _id: mongoose.Types.ObjectId;
  name: string;
  staffId: mongoose.Types.ObjectId;
  startAt: Date;
  endAt?: Date;
  status: "Đang làm" | "Đã kết thúc";
  note?: string;
  // Extended
  shiftType?: "morning" | "afternoon" | "evening" | "night";
  startTime?: string;
  endTime?: string;
  breakMinutes?: number;
  overtimeHours?: number;
  handoverNote?: string;
  handoverTo?: mongoose.Types.ObjectId;
  handoverAt?: Date;
  totalSessions?: number;
  totalRevenue?: number;
  totalIncidents?: number;
  deviceId?: mongoose.Types.ObjectId;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
};

const shiftSchema = new Schema<ShiftDocument>(
  {
    name: { type: String, required: true, trim: true },
    staffId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    startAt: { type: Date, default: Date.now },
    endAt: { type: Date },
    status: { type: String, enum: ["Đang làm", "Đã kết thúc"], default: "Đang làm" },
    note: { type: String },
    // Extended
    shiftType: { type: String, enum: ["morning", "afternoon", "evening", "night"] },
    startTime: { type: String },
    endTime: { type: String },
    breakMinutes: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },
    handoverNote: { type: String },
    handoverTo: { type: Schema.Types.ObjectId, ref: "User" },
    handoverAt: { type: Date },
    totalSessions: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalIncidents: { type: Number, default: 0 },
    deviceId: { type: Schema.Types.ObjectId, ref: "Device" },
    location: { type: String },
  },
  { timestamps: true },
);

export const Shift: Model<ShiftDocument> =
  mongoose.models.Shift || mongoose.model<ShiftDocument>("Shift", shiftSchema);
