import mongoose, { Model, Schema } from "mongoose";

export type ActiveSessionDocument = {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userAgent?: string;
  ipAddress?: string;
  loginAt: Date;
  lastActiveAt: Date;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const activeSessionSchema = new Schema<ActiveSessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userAgent: { type: String },
    ipAddress: { type: String },
    loginAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: true },
    isRevoked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Auto-expire old sessions
activeSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const ActiveSession: Model<ActiveSessionDocument> =
  mongoose.models.ActiveSession ||
  mongoose.model<ActiveSessionDocument>("ActiveSession", activeSessionSchema);
