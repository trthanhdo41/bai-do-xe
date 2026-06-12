import mongoose, { Model, Schema } from "mongoose";

export type PricingConfigDocument = {
  _id: mongoose.Types.ObjectId;
  freeMinutes: number;
  hourlyRate: number;
  overnightRate: number;
  monthlyRate: number;
  overdueFineRate: number;
  isActive: boolean;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const pricingConfigSchema = new Schema<PricingConfigDocument>(
  {
    freeMinutes: { type: Number, required: true, min: 0, default: 20 },
    hourlyRate: { type: Number, required: true, min: 0, default: 10000 },
    overnightRate: { type: Number, required: true, min: 0, default: 80000 },
    monthlyRate: { type: Number, required: true, min: 0, default: 1200000 },
    overdueFineRate: { type: Number, required: true, min: 0, default: 20000 },
    isActive: { type: Boolean, default: true, index: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const PricingConfig: Model<PricingConfigDocument> =
  mongoose.models.PricingConfig ||
  mongoose.model<PricingConfigDocument>("PricingConfig", pricingConfigSchema);
