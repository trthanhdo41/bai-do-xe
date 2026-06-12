import { Request, Response } from "express";
import { z } from "zod";
import { getActivePricingConfig, updateActivePricingConfig } from "../services/pricing.service.js";

function serializePricingConfig(config: Awaited<ReturnType<typeof getActivePricingConfig>>) {
  return {
    id: config._id.toString(),
    freeMinutes: config.freeMinutes,
    hourlyRate: config.hourlyRate,
    overnightRate: config.overnightRate,
    monthlyRate: config.monthlyRate,
    overdueFineRate: config.overdueFineRate,
    isActive: config.isActive,
    updatedAt: config.updatedAt,
  };
}

const pricingConfigSchema = z.object({
  freeMinutes: z.coerce.number().int().min(0),
  hourlyRate: z.coerce.number().int().min(0),
  overnightRate: z.coerce.number().int().min(0),
  monthlyRate: z.coerce.number().int().min(0),
  overdueFineRate: z.coerce.number().int().min(0),
});

export async function getPricingConfig(_request: Request, response: Response) {
  const config = await getActivePricingConfig();
  response.json({ pricingConfig: serializePricingConfig(config) });
}

export async function updatePricingConfig(request: Request, response: Response) {
  const body = pricingConfigSchema.parse(request.body);
  const config = await updateActivePricingConfig(body, request.user?.id);
  response.json({ pricingConfig: serializePricingConfig(config) });
}
