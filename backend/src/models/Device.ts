import mongoose, { Model, Schema } from "mongoose";

export type DeviceDocument = {
  _id: mongoose.Types.ObjectId;
  name: string;
  gate: "entry" | "exit";
  rtspUrl: string;
  username?: string;
  password?: string;
  roiNote?: string;
  status: "online" | "offline" | "unknown";
  lastSnapshotUrl?: string;
  lastSnapshotAt?: Date;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const deviceSchema = new Schema<DeviceDocument>(
  {
    name: { type: String, required: true, trim: true },
    gate: { type: String, enum: ["entry", "exit"], required: true, index: true },
    rtspUrl: { type: String, required: true, trim: true },
    username: { type: String },
    password: { type: String },
    roiNote: { type: String },
    status: { type: String, enum: ["online", "offline", "unknown"], default: "unknown" },
    lastSnapshotUrl: { type: String },
    lastSnapshotAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const Device: Model<DeviceDocument> =
  mongoose.models.Device || mongoose.model<DeviceDocument>("Device", deviceSchema);
