import { Request, Response } from "express";
import { z } from "zod";
import {
  cancelSubscription,
  createPlan,
  expireSubscriptions,
  listPlans,
  purchaseSubscription,
  renewSubscription,
  updatePlan,
} from "../services/subscription.service.js";
import { Subscription } from "../models/Subscription.js";
import { SubscriptionPlan } from "../models/SubscriptionPlan.js";
import { serializeSubscription, serializeSubscriptionPlan } from "../utils/serializers.js";

// --- Plans ---

export async function listPlansHandler(_request: Request, response: Response) {
  const plans = await listPlans();
  response.json({ plans: plans.map(serializeSubscriptionPlan) });
}

export async function createPlanHandler(request: Request, response: Response) {
  const body = z
    .object({
      name: z.string().min(2),
      description: z.string().optional(),
      duration: z.enum(["monthly", "quarterly", "yearly"]),
      durationDays: z.number().int().min(1),
      price: z.number().min(0),
      discountPercent: z.number().min(0).max(100),
      maxVehicles: z.number().int().min(1).default(1),
      features: z.array(z.string()).default([]),
    })
    .parse(request.body);

  const plan = await createPlan(body);
  response.status(201).json({ plan: serializeSubscriptionPlan(plan) });
}

export async function updatePlanHandler(request: Request, response: Response) {
  const body = z
    .object({
      name: z.string().min(2).optional(),
      description: z.string().optional(),
      price: z.number().min(0).optional(),
      discountPercent: z.number().min(0).max(100).optional(),
      maxVehicles: z.number().int().min(1).optional(),
      features: z.array(z.string()).optional(),
      isActive: z.boolean().optional(),
    })
    .parse(request.body);

  const plan = await updatePlan(String(request.params.id), body);
  response.json({ plan: serializeSubscriptionPlan(plan) });
}

export async function deletePlanHandler(request: Request, response: Response) {
  await updatePlan(String(request.params.id), { isActive: false });
  response.json({ ok: true, message: "Gói đã được ẩn." });
}

// --- Subscriptions ---

export async function listSubscriptionsHandler(_request: Request, response: Response) {
  const subs = await Subscription.find().sort({ createdAt: -1 }).limit(200);
  response.json({ subscriptions: subs.map(serializeSubscription) });
}

export async function mySubscriptionsHandler(request: Request, response: Response) {
  const subs = await Subscription.find({ userId: request.user!.id }).sort({ createdAt: -1 });
  response.json({ subscriptions: subs.map(serializeSubscription) });
}

export async function purchaseHandler(request: Request, response: Response) {
  const body = z
    .object({
      planId: z.string().min(1),
      plates: z.array(z.string().min(5)).min(1),
    })
    .parse(request.body);

  const sub = await purchaseSubscription({
    userId: request.user!.id,
    planId: body.planId,
    plates: body.plates,
  });
  response.status(201).json({ subscription: serializeSubscription(sub) });
}

export async function renewHandler(request: Request, response: Response) {
  const sub = await renewSubscription(String(request.params.id));
  response.json({ subscription: serializeSubscription(sub), message: "Đã gia hạn gói." });
}

export async function cancelHandler(request: Request, response: Response) {
  const sub = await cancelSubscription(String(request.params.id));
  response.json({ subscription: serializeSubscription(sub), message: "Đã hủy gói." });
}
