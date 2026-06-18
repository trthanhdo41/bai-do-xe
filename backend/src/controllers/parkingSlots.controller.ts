import mongoose from "mongoose";
import { Request, Response } from "express";
import { z } from "zod";
import { ParkingSlot } from "../models/ParkingSlot.js";
import { Zone } from "../models/Zone.js";
import { bulkCreateSlots, getSlotMap } from "../services/parkingSlot.service.js";
import { serializeParkingSlot } from "../utils/serializers.js";

const slotTypeEnum = z.enum(["regular", "VIP", "electric", "handicap"]);

export async function listParkingSlotsHandler(request: Request, response: Response) {
  const { zoneId, status, slotType } = request.query;

  const filter: Record<string, unknown> = {};
  if (zoneId && mongoose.isValidObjectId(zoneId as string)) {
    filter.zoneId = new mongoose.Types.ObjectId(zoneId as string);
  }
  if (status) filter.status = status;
  if (slotType) filter.slotType = slotType;

  const slots = await ParkingSlot.find(filter).sort({ zoneName: 1, slotCode: 1 });
  response.json({ slots: slots.map(serializeParkingSlot) });
}

export async function getSlotMapHandler(_request: Request, response: Response) {
  const map = await getSlotMap();
  response.json({
    map: map.map((entry) => ({
      zoneId: entry.zoneId,
      zoneName: entry.zoneName,
      slots: entry.slots.map(serializeParkingSlot),
    })),
  });
}

export async function createParkingSlotHandler(request: Request, response: Response) {
  const body = z
    .object({
      slotCode: z.string().min(2).max(20),
      zoneId: z.string().min(1),
      slotType: slotTypeEnum.default("regular"),
      features: z.array(z.string()).default([]),
      floor: z.number().int().default(0),
      notes: z.string().optional(),
    })
    .parse(request.body);

  const zone = await Zone.findById(body.zoneId);
  if (!zone) {
    response.status(404).json({ message: "Zone không tồn tại." });
    return;
  }

  const existed = await ParkingSlot.findOne({ slotCode: body.slotCode.toUpperCase() });
  if (existed) {
    response.status(409).json({ message: `Slot "${body.slotCode}" đã tồn tại.` });
    return;
  }

  const slot = await ParkingSlot.create({
    slotCode: body.slotCode.toUpperCase(),
    zoneId: zone._id,
    zoneName: zone.name,
    slotType: body.slotType,
    features: body.features,
    floor: body.floor,
    notes: body.notes,
    status: "empty",
  });

  response.status(201).json({ slot: serializeParkingSlot(slot) });
}

export async function bulkCreateSlotsHandler(request: Request, response: Response) {
  const body = z
    .object({
      zoneId: z.string().min(1),
      count: z.number().int().min(1).max(100),
      slotType: slotTypeEnum.default("regular"),
      features: z.array(z.string()).default([]),
      floor: z.number().int().default(0),
    })
    .parse(request.body);

  const slots = await bulkCreateSlots(body);
  response
    .status(201)
    .json({ slots: slots.map(serializeParkingSlot), created: slots.length });
}

export async function updateParkingSlotHandler(request: Request, response: Response) {
  const body = z
    .object({
      slotType: slotTypeEnum.optional(),
      features: z.array(z.string()).optional(),
      floor: z.number().int().optional(),
      notes: z.string().optional(),
    })
    .parse(request.body);

  const slot = await ParkingSlot.findById(request.params.id);
  if (!slot) {
    response.status(404).json({ message: "Slot không tồn tại." });
    return;
  }

  if (body.slotType !== undefined) slot.slotType = body.slotType;
  if (body.features !== undefined) slot.features = body.features;
  if (body.floor !== undefined) slot.floor = body.floor;
  if (body.notes !== undefined) slot.notes = body.notes;

  await slot.save();
  response.json({ slot: serializeParkingSlot(slot) });
}

export async function deleteParkingSlotHandler(request: Request, response: Response) {
  const slot = await ParkingSlot.findById(request.params.id);
  if (!slot) {
    response.status(404).json({ message: "Slot không tồn tại." });
    return;
  }

  if (slot.status === "occupied" || slot.status === "reserved") {
    response.status(409).json({
      message: `Không thể xóa slot đang ở trạng thái "${slot.status}".`,
    });
    return;
  }

  await slot.deleteOne();
  response.json({ ok: true, message: "Đã xóa slot." });
}

export async function updateSlotStatusHandler(request: Request, response: Response) {
  const body = z
    .object({
      status: z.enum(["empty", "maintenance"]),
      notes: z.string().optional(),
    })
    .parse(request.body);

  const slot = await ParkingSlot.findById(request.params.id);
  if (!slot) {
    response.status(404).json({ message: "Slot không tồn tại." });
    return;
  }

  if (slot.status === "occupied") {
    response.status(409).json({
      message: "Không thể thay đổi trạng thái slot đang có xe đỗ.",
    });
    return;
  }

  slot.status = body.status;
  if (body.notes !== undefined) slot.notes = body.notes;
  if (body.status === "empty") slot.currentSessionId = undefined;

  await slot.save();
  response.json({ slot: serializeParkingSlot(slot) });
}
