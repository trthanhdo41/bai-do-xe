import mongoose from "mongoose";
import { Subscription, SubscriptionDocument } from "../models/Subscription.js";
import { SubscriptionPlan, SubscriptionPlanDocument } from "../models/SubscriptionPlan.js";
import { Transaction } from "../models/Transaction.js";

export async function listPlans(): Promise<SubscriptionPlanDocument[]> {
  return SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
}

export async function createPlan(data: {
  name: string;
  description?: string;
  duration: "monthly" | "quarterly" | "yearly";
  durationDays: number;
  price: number;
  discountPercent: number;
  maxVehicles?: number;
  features?: string[];
}): Promise<SubscriptionPlanDocument> {
  return SubscriptionPlan.create({ ...data, isActive: true });
}

export async function updatePlan(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    discountPercent: number;
    maxVehicles: number;
    features: string[];
    isActive: boolean;
  }>,
): Promise<SubscriptionPlanDocument> {
  const plan = await SubscriptionPlan.findByIdAndUpdate(id, { $set: data }, { new: true });
  if (!plan) {
    const err = new Error("Gói không tồn tại.") as Error & { status: number };
    err.status = 404;
    throw err;
  }
  return plan;
}

export async function purchaseSubscription(params: {
  userId: string;
  planId: string;
  plates: string[];
}): Promise<SubscriptionDocument> {
  const plan = await SubscriptionPlan.findById(params.planId);
  if (!plan || !plan.isActive) {
    const err = new Error("Gói không tồn tại hoặc đã ngừng.") as Error & { status: number };
    err.status = 404;
    throw err;
  }

  if (params.plates.length > plan.maxVehicles) {
    const err = new Error(`Gói chỉ cho phép tối đa ${plan.maxVehicles} xe.`) as Error & { status: number };
    err.status = 400;
    throw err;
  }

  // Check if user already has active subscription
  const existing = await Subscription.findOne({
    userId: new mongoose.Types.ObjectId(params.userId),
    status: "active",
  });
  if (existing) {
    const err = new Error("Bạn đã có gói đang hoạt động. Hãy hủy hoặc chờ hết hạn trước.") as Error & { status: number };
    err.status = 409;
    throw err;
  }

  const now = new Date();
  const endDate = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

  // Create pending transaction
  const content = `SUB-${params.userId.slice(-6)}-${Date.now()}`;
  const transaction = await Transaction.create({
    userId: new mongoose.Types.ObjectId(params.userId),
    method: "vietqr",
    amount: plan.price,
    status: "pending",
    content,
  });

  const subscription = await Subscription.create({
    userId: new mongoose.Types.ObjectId(params.userId),
    planId: plan._id,
    planName: plan.name,
    startDate: now,
    endDate,
    status: "active",
    autoRenew: false,
    plates: params.plates.map((p) => p.toUpperCase()),
    transactionId: transaction._id,
    renewalCount: 0,
  });

  return subscription;
}

export async function renewSubscription(subscriptionId: string): Promise<SubscriptionDocument> {
  const sub = await Subscription.findById(subscriptionId);
  if (!sub) {
    const err = new Error("Không tìm thấy gói đăng ký.") as Error & { status: number };
    err.status = 404;
    throw err;
  }

  const plan = await SubscriptionPlan.findById(sub.planId);
  if (!plan) {
    const err = new Error("Gói gốc không còn tồn tại.") as Error & { status: number };
    err.status = 404;
    throw err;
  }

  // Extend endDate from current endDate or now (whichever is later)
  const baseDate = sub.endDate > new Date() ? sub.endDate : new Date();
  sub.endDate = new Date(baseDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
  sub.status = "active";
  sub.renewalCount += 1;

  // Create transaction for renewal
  const transaction = await Transaction.create({
    userId: sub.userId,
    method: "vietqr",
    amount: plan.price,
    status: "pending",
    content: `RENEW-${sub._id.toString().slice(-6)}-${Date.now()}`,
  });
  sub.transactionId = transaction._id;

  await sub.save();
  return sub;
}

export async function cancelSubscription(subscriptionId: string): Promise<SubscriptionDocument> {
  const sub = await Subscription.findById(subscriptionId);
  if (!sub) {
    const err = new Error("Không tìm thấy gói đăng ký.") as Error & { status: number };
    err.status = 404;
    throw err;
  }
  if (sub.status !== "active") {
    const err = new Error("Gói không đang hoạt động.") as Error & { status: number };
    err.status = 400;
    throw err;
  }

  sub.status = "cancelled";
  await sub.save();
  return sub;
}

/**
 * Check if user has active subscription covering the given plate.
 * Returns discount percent (0 if none).
 */
export async function checkSubscriptionDiscount(
  userId?: mongoose.Types.ObjectId | string,
  plate?: string,
): Promise<number> {
  if (!userId || !plate) return 0;

  const sub = await Subscription.findOne({
    userId: new mongoose.Types.ObjectId(userId.toString()),
    status: "active",
    endDate: { $gt: new Date() },
    plates: plate.toUpperCase(),
  });

  if (!sub) return 0;

  const plan = await SubscriptionPlan.findById(sub.planId);
  return plan?.discountPercent ?? 0;
}

/**
 * Expire subscriptions past their endDate.
 */
export async function expireSubscriptions(): Promise<number> {
  const result = await Subscription.updateMany(
    { status: "active", endDate: { $lt: new Date() } },
    { $set: { status: "expired" } },
  );
  return result.modifiedCount;
}
