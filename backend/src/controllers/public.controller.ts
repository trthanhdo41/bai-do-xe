import { Request, Response } from "express";
import { ParkingSlot } from "../models/ParkingSlot.js";
import { Zone } from "../models/Zone.js";

/**
 * HM-04/HM-05: Public parking availability — no auth required.
 * Returns zones with available slot counts for public landing page.
 */
export async function publicAvailability(_request: Request, response: Response) {
  const zones = await Zone.find({ isActive: true }).sort({ displayOrder: 1 });

  const stats = await ParkingSlot.aggregate<{
    _id: { zoneId: string; status: string };
    count: number;
  }>([
    { $group: { _id: { zoneId: { $toString: "$zoneId" }, status: "$status" }, count: { $sum: 1 } } },
  ]);

  const statsMap = new Map<string, { total: number; empty: number; occupied: number }>();
  for (const row of stats) {
    const key = row._id.zoneId;
    if (!statsMap.has(key)) statsMap.set(key, { total: 0, empty: 0, occupied: 0 });
    const entry = statsMap.get(key)!;
    entry.total += row.count;
    if (row._id.status === "empty") entry.empty = row.count;
    if (row._id.status === "occupied") entry.occupied = row.count;
  }

  const result = zones.map((zone) => {
    const s = statsMap.get(zone._id.toString()) || { total: 0, empty: 0, occupied: 0 };
    return {
      zone: zone.name,
      description: zone.description,
      total: s.total,
      available: s.empty,
      occupied: s.occupied,
      allowedVehicleTypes: zone.allowedVehicleTypes,
    };
  });

  const totalAvailable = result.reduce((sum, z) => sum + z.available, 0);
  const totalCapacity = result.reduce((sum, z) => sum + z.total, 0);

  response.json({
    available: totalAvailable,
    capacity: totalCapacity,
    zones: result,
  });
}

/**
 * HM-04: Search parking info by query (zone name or vehicle type).
 */
export async function publicSearch(request: Request, response: Response) {
  const q = String(request.query.q || "").trim();
  if (!q) {
    response.status(400).json({ message: "Vui lòng nhập từ khóa tìm kiếm." });
    return;
  }

  const zones = await Zone.find({
    isActive: true,
    $or: [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { allowedVehicleTypes: { $regex: q, $options: "i" } },
    ],
  });

  const slotCounts = await Promise.all(
    zones.map(async (zone) => {
      const empty = await ParkingSlot.countDocuments({ zoneId: zone._id, status: "empty" });
      const total = await ParkingSlot.countDocuments({ zoneId: zone._id });
      return { zone: zone.name, description: zone.description, available: empty, total };
    }),
  );

  response.json({ results: slotCounts });
}
