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
  // Extended
  name?: string;
  description?: string;
  vehicleType?: string;
  effectiveFrom?: Date;
  effectiveTo?: Date;
  nightHoursStart?: number;
  nightHoursEnd?: number;
  weekendRate?: number;
  holidayRate?: number;
  firstHourRate?: number;
  additionalHourRate?: number;
  dailyMaxRate?: number;
  prioritySlotRate?: number;
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
    // Extended fields
    name: { type: String, trim: true },
    description: { type: String, trim: true },
    vehicleType: { type: String, trim: true },
    effectiveFrom: { type: Date },
    effectiveTo: { type: Date },
    nightHoursStart: { type: Number },
    nightHoursEnd: { type: Number },
    weekendRate: { type: Number, min: 0 },
    holidayRate: { type: Number, min: 0 },
    firstHourRate: { type: Number, min: 0 },
    additionalHourRate: { type: Number, min: 0 },
    dailyMaxRate: { type: Number, min: 0 },
    prioritySlotRate: { type: Number, min: 0 },
  },
  { timestamps: true },
);

export const PricingConfig: Model<PricingConfigDocument> =
  mongoose.models.PricingConfig ||
  mongoose.model<PricingConfigDocument>("PricingConfig", pricingConfigSchema);
