import mongoose from "mongoose";
import { ParkingSession } from "../models/ParkingSession.js";
import { Transaction } from "../models/Transaction.js";
import { User } from "../models/User.js";

export type RevenuePoint = { date: string; revenue: number; count: number };
export type OccupancyPoint = { hour: number; avgOccupancy: number; maxOccupancy: number };
export type TopCustomerItem = { userId: string; name: string; email?: string; sessionCount: number; totalSpent: number };
export type PeakHourPoint = { dayOfWeek: number; hour: number; count: number };

/**
 * Revenue chart data grouped by day/week/month.
 */
export async function getRevenueChart(
  from: Date,
  to: Date,
  groupBy: "day" | "week" | "month" = "day",
): Promise<RevenuePoint[]> {
  let dateFormat: string;
  switch (groupBy) {
    case "week":
      dateFormat = "%Y-W%V";
      break;
    case "month":
      dateFormat = "%Y-%m";
      break;
    default:
      dateFormat = "%Y-%m-%d";
  }

  const results = await Transaction.aggregate([
    {
      $match: {
        status: "paid",
        paidAt: { $gte: from, $lte: to },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: "$paidAt" } },
        revenue: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return results.map((r) => ({ date: r._id, revenue: r.revenue, count: r.count }));
}

/**
 * Average occupancy by hour of day (0-23).
 */
export async function getOccupancyByHour(from: Date, to: Date): Promise<OccupancyPoint[]> {
  const results = await ParkingSession.aggregate([
    {
      $match: {
        checkInAt: { $gte: from, $lte: to },
      },
    },
    {
      $group: {
        _id: { $hour: "$checkInAt" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Calculate total days in range for averaging
  const days = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)));

  // Fill all 24 hours
  const hourMap = new Map<number, number>();
  for (const r of results) {
    hourMap.set(r._id, r.count);
  }

  return Array.from({ length: 24 }, (_, hour) => {
    const total = hourMap.get(hour) || 0;
    return {
      hour,
      avgOccupancy: Math.round(total / days),
      maxOccupancy: total,
    };
  });
}

/**
 * Top customers by session count and total spending.
 */
export async function getTopCustomers(
  limit: number = 10,
  from?: Date,
  to?: Date,
): Promise<TopCustomerItem[]> {
  const match: Record<string, unknown> = {
    ownerUserId: { $exists: true, $ne: null },
  };
  if (from && to) {
    match.checkInAt = { $gte: from, $lte: to };
  }

  const results = await ParkingSession.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$ownerUserId",
        sessionCount: { $sum: 1 },
        totalSpent: { $sum: "$fee" },
      },
    },
    { $sort: { sessionCount: -1 } },
    { $limit: limit },
  ]);

  // Populate user info
  const userIds = results.map((r) => r._id);
  const users = await User.find({ _id: { $in: userIds } });
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  return results.map((r) => {
    const user = userMap.get(r._id.toString());
    return {
      userId: r._id.toString(),
      name: user?.name || "Không xác định",
      email: user?.email,
      sessionCount: r.sessionCount,
      totalSpent: r.totalSpent,
    };
  });
}

/**
 * Peak hours analysis — count of check-ins by day of week and hour.
 */
export async function getPeakHoursAnalysis(from: Date, to: Date): Promise<PeakHourPoint[]> {
  const results = await ParkingSession.aggregate([
    {
      $match: {
        checkInAt: { $gte: from, $lte: to },
      },
    },
    {
      $group: {
        _id: {
          dayOfWeek: { $dayOfWeek: "$checkInAt" }, // 1=Sunday, 7=Saturday
          hour: { $hour: "$checkInAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.dayOfWeek": 1, "_id.hour": 1 } },
  ]);

  return results.map((r) => ({
    dayOfWeek: r._id.dayOfWeek,
    hour: r._id.hour,
    count: r.count,
  }));
}
