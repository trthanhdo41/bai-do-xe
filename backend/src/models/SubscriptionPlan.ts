import mongoose, { Model, Schema } from "mongoose";

export type SubscriptionDuration = "monthly" | "quarterly" | "yearly";

export type SubscriptionPlanDocument = {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  duration: SubscriptionDuration;
  durationDays: number;
  price: number;
  discountPercent: number;
  maxVehicles: number;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const subscriptionPlanSchema = new Schema<SubscriptionPlanDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    duration: { type: String, enum: ["monthly", "quarterly", "yearly"], required: true },
    durationDays: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, required: true, min: 0, max: 100 },
    maxVehicles: { type: Number, default: 1, min: 1 },
    features: { type: [String], default: [] },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const SubscriptionPlan: Model<SubscriptionPlanDocument> =
  mongoose.models.SubscriptionPlan ||
  mongoose.model<SubscriptionPlanDocument>("SubscriptionPlan", subscriptionPlanSchema);
