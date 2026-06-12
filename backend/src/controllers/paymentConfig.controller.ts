import { Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { PaymentConfig } from "../models/PaymentConfig.js";
import { getActivePaymentConfig } from "../services/transaction.service.js";
import { serializePaymentConfig } from "../utils/serializers.js";

const paymentConfigSchema = z.object({
  bankName: z.string().min(2),
  bankBin: z.string().min(3),
  accountNumber: z.string().min(4),
  accountName: z.string().min(2),
  transferPrefix: z.string().min(2),
});

export async function getPaymentConfig(_request: Request, response: Response) {
  const config = await getActivePaymentConfig();
  response.json({ paymentConfig: serializePaymentConfig(config) });
}

export async function updatePaymentConfig(request: Request, response: Response) {
  const body = paymentConfigSchema.parse(request.body);
  const config = await PaymentConfig.findOneAndUpdate(
    { isActive: true },
    {
      ...body,
      isActive: true,
      ...(request.user?.id && mongoose.isValidObjectId(request.user.id)
        ? { updatedBy: new mongoose.Types.ObjectId(request.user.id) }
        : {}),
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  response.json({ paymentConfig: serializePaymentConfig(config) });
}
