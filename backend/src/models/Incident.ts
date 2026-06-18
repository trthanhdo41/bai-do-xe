import mongoose, { Model, Schema } from "mongoose";

export type IncidentDocument = {
  _id: mongoose.Types.ObjectId;
  type: "Xe blacklist" | "Lỗi nhận dạng" | "Yêu cầu miễn phạt" | "Camera offline" | "Khác";
  note: string;
  plate?: string;
  sessionId?: mongoose.Types.ObjectId;
  status: "Mới" | "Đang xử lý" | "Đã xử lý";
  createdBy?: mongoose.Types.ObjectId;
  handledBy?: mongoose.Types.ObjectId;
  handledAt?: Date;
  // Extended
  severity?: "low" | "medium" | "high" | "critical";
  priority?: "low" | "medium" | "high";
  description?: string;
  attachments?: string[];
  relatedVehicleId?: mongoose.Types.ObjectId;
  relatedUserId?: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  resolution?: string;
  resolutionTime?: number;
  affectedZone?: string;
  cameraSnapshot?: string;
  isRecurring: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
};

const incidentSchema = new Schema<IncidentDocument>(
  {
    type: {
      type: String,
      enum: ["Xe blacklist", "Lỗi nhận dạng", "Yêu cầu miễn phạt", "Camera offline", "Khác"],
      required: true,
    },
    note: { type: String, required: true, trim: true },
    plate: { type: String, trim: true, uppercase: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "ParkingSession" },
    status: { type: String, enum: ["Mới", "Đang xử lý", "Đã xử lý"], default: "Mới" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    handledBy: { type: Schema.Types.ObjectId, ref: "User" },
    handledAt: { type: Date },
    // Extended
    severity: { type: String, enum: ["low", "medium", "high", "critical"] },
    priority: { type: String, enum: ["low", "medium", "high"] },
    description: { type: String, trim: true },
    attachments: { type: [String], default: [] },
    relatedVehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle" },
    relatedUserId: { type: Schema.Types.ObjectId, ref: "User" },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    resolution: { type: String, trim: true },
    resolutionTime: { type: Number },
    affectedZone: { type: String },
    cameraSnapshot: { type: String },
    isRecurring: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const Incident: Model<IncidentDocument> =
  mongoose.models.Incident || mongoose.model<IncidentDocument>("Incident", incidentSchema);
