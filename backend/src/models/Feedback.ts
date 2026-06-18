import mongoose, { Model, Schema } from "mongoose";

export type FeedbackDocument = {
  _id: mongoose.Types.ObjectId;
  subject: string;
  content: string;
  status: "Đang xử lý" | "Đã phản hồi" | "Đã đóng";
  response?: string;
  createdBy?: mongoose.Types.ObjectId;
  handledBy?: mongoose.Types.ObjectId;
  handledAt?: Date;
  // Extended
  category?: "technical" | "service" | "payment" | "other";
  priority?: "low" | "medium" | "high";
  rating?: number;
  contactEmail?: string;
  contactPhone?: string;
  relatedSessionId?: mongoose.Types.ObjectId;
  relatedVehicleId?: mongoose.Types.ObjectId;
  tags?: string[];
  source?: "web" | "app" | "phone";
  attachments?: string[];
  resolutionTime?: number;
  customerSatisfaction?: number;
  createdAt: Date;
  updatedAt: Date;
};

const feedbackSchema = new Schema<FeedbackDocument>(
  {
    subject: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    status: { type: String, enum: ["Đang xử lý", "Đã phản hồi", "Đã đóng"], default: "Đang xử lý" },
    response: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", index: true },
    handledBy: { type: Schema.Types.ObjectId, ref: "User" },
    handledAt: { type: Date },
    // Extended
    category: { type: String, enum: ["technical", "service", "payment", "other"] },
    priority: { type: String, enum: ["low", "medium", "high"] },
    rating: { type: Number, min: 1, max: 5 },
    contactEmail: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    relatedSessionId: { type: Schema.Types.ObjectId, ref: "ParkingSession" },
    relatedVehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle" },
    tags: { type: [String], default: [] },
    source: { type: String, enum: ["web", "app", "phone"] },
    attachments: { type: [String], default: [] },
    resolutionTime: { type: Number },
    customerSatisfaction: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true },
);

export const Feedback: Model<FeedbackDocument> =
  mongoose.models.Feedback || mongoose.model<FeedbackDocument>("Feedback", feedbackSchema);
