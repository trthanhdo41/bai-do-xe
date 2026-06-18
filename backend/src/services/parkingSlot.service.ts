import mongoose from "mongoose";
import { ParkingSlot, ParkingSlotDocument, SlotType } from "../models/ParkingSlot.js";
import { Zone } from "../models/Zone.js";

export type ZoneWithSlots = {
  zoneId: string;
  zoneName: string;
  slots: ParkingSlotDocument[];
};

/**
 * Atomically find and lock an empty slot suitable for the given vehicle type.
 * Optionally prefer a specific zone first, then fall back to any available zone.
 * Returns null if no slot is available (parking full).
 */
export async function allocateSlot(
  vehicleType: string,
  preferredZoneId?: string,
): Promise<ParkingSlotDocument | null> {
  // Build list of zone ids whose allowedVehicleTypes includes vehicleType
  const zones = await Zone.find({
    isActive: true,
    allowedVehicleTypes: vehicleType,
  }).sort({ displayOrder: 1, name: 1 });

  if (zones.length === 0) return null;

  // Put preferred zone first
  let orderedZones = zones;
  if (preferredZoneId && mongoose.isValidObjectId(preferredZoneId)) {
    const preferred = zones.find((z) => z._id.toString() === preferredZoneId);
    if (preferred) {
      orderedZones = [preferred, ...zones.filter((z) => z._id.toString() !== preferredZoneId)];
    }
  }

  for (const zone of orderedZones) {
    // Atomic findOneAndUpdate to avoid race condition
    const slot = await ParkingSlot.findOneAndUpdate(
      { zoneId: zone._id, status: "empty" },
      { $set: { status: "occupied" } },
      { new: true, sort: { slotCode: 1 } },
    );
    if (slot) return slot;
  }

  return null;
}

/**
 * Mark slot as occupied by a session. Used after session is created.
 * Note: allocateSlot already sets status="occupied" atomically.
 * This function sets currentSessionId as a second atomic update.
 */
export async function occupySlot(
  slotId: mongoose.Types.ObjectId | string,
  sessionId: mongoose.Types.ObjectId | string,
): Promise<void> {
  await ParkingSlot.findByIdAndUpdate(slotId, {
    $set: {
      status: "occupied",
      currentSessionId: new mongoose.Types.ObjectId(sessionId.toString()),
    },
  });
}

/**
 * Release a slot back to empty after checkout.
 * Silently skips if slotId is null/undefined (backward compat with old sessions).
 */
export async function freeSlot(
  slotId?: mongoose.Types.ObjectId | string | null,
): Promise<void> {
  if (!slotId) return;
  await ParkingSlot.findByIdAndUpdate(slotId, {
    $set: { status: "empty" },
    $unset: { currentSessionId: "" },
  });
}

/**
 * Return full slot map grouped by zone for realtime dashboard.
 */
export async function getSlotMap(): Promise<ZoneWithSlots[]> {
  const [zones, slots] = await Promise.all([
    Zone.find({ isActive: true }).sort({ displayOrder: 1, name: 1 }),
    ParkingSlot.find().sort({ slotCode: 1 }),
  ]);

  return zones.map((zone) => ({
    zoneId: zone._id.toString(),
    zoneName: zone.name,
    slots: slots.filter((s) => s.zoneId.toString() === zone._id.toString()),
  }));
}

/**
 * Bulk create slots for a zone with auto-generated slot codes.
 */
export async function bulkCreateSlots(params: {
  zoneId: string;
  count: number;
  slotType?: SlotType;
  features?: string[];
  floor?: number;
}): Promise<ParkingSlotDocument[]> {
  const zone = await Zone.findById(params.zoneId);
  if (!zone) {
    const err = new Error("Zone không tồn tại.") as Error & { status: number };
    err.status = 404;
    throw err;
  }

  // Count existing slots in zone to determine starting index
  const existingCount = await ParkingSlot.countDocuments({ zoneId: zone._id });

  const docs = Array.from({ length: params.count }, (_, i) => {
    const num = existingCount + i + 1;
    return {
      slotCode: `${zone.name}-${String(num).padStart(2, "0")}`,
      zoneId: zone._id,
      zoneName: zone.name,
      slotType: params.slotType ?? "regular",
      features: params.features ?? [],
      status: "empty" as const,
      floor: params.floor ?? 0,
    };
  });

  const created = await ParkingSlot.insertMany(docs, { ordered: false });
  return created as unknown as ParkingSlotDocument[];
}
