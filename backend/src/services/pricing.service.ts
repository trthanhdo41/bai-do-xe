import mongoose from "mongoose";
import { PricingConfig, PricingConfigDocument } from "../models/PricingConfig.js";

export const defaultPricingConfig = {
  freeMinutes: 20,
  hourlyRate: 10000,
  overnightRate: 80000,
  monthlyRate: 1200000,
  overdueFineRate: 20000,
};

export type FeeBreakdown = {
  totalMinutes: number;
  freeMinutes: number;
  billableMinutes: number;
  billableHours: number;
  hourlyRate: number;
  parkingFee: number;
  overdueFine: number;
  totalFee: number;
};

export async function getActivePricingConfig() {
  const config = await PricingConfig.findOne({ isActive: true }).sort({ updatedAt: -1 });
  if (config) {
    return config;
  }

  return PricingConfig.create({
    ...defaultPricingConfig,
    isActive: true,
  });
}

export async function updateActivePricingConfig(
  values: Partial<typeof defaultPricingConfig>,
  updatedBy?: string,
) {
  const update = {
    ...values,
    isActive: true,
    ...(updatedBy && mongoose.isValidObjectId(updatedBy)
      ? { updatedBy: new mongoose.Types.ObjectId(updatedBy) }
      : {}),
  };

  const config = await PricingConfig.findOneAndUpdate({ isActive: true }, update, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  });

  return config;
}

export function calculateParkingFee(
  checkInAt: Date,
  checkOutAt: Date,
  config: Pick<PricingConfigDocument, "freeMinutes" | "hourlyRate">,
): FeeBreakdown {
  const diffMs = checkOutAt.getTime() - checkInAt.getTime();
  const totalMinutes = Math.max(0, Math.ceil(diffMs / 60000));
  const billableMinutes = Math.max(0, totalMinutes - config.freeMinutes);
  const billableHours = billableMinutes > 0 ? Math.ceil(billableMinutes / 60) : 0;
  const parkingFee = billableHours * config.hourlyRate;
  const overdueFine = 0;

  return {
    totalMinutes,
    freeMinutes: config.freeMinutes,
    billableMinutes,
    billableHours,
    hourlyRate: config.hourlyRate,
    parkingFee,
    overdueFine,
    totalFee: parkingFee + overdueFine,
  };
}
