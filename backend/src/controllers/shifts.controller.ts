import { Request, Response } from "express";
import { z } from "zod";
import { Shift } from "../models/Shift.js";
import { serializeShift } from "../utils/serializers.js";

export async function listShifts(request: Request, response: Response) {
  const criteria = request.user?.role === "staff" ? { staffId: request.user.id } : {};
  const shifts = await Shift.find(criteria).sort({ createdAt: -1 }).limit(100);
  response.json({ shifts: shifts.map(serializeShift) });
}

export async function startShift(request: Request, response: Response) {
  const body = z.object({ name: z.string().min(2), note: z.string().optional() }).parse(request.body);
  const shift = await Shift.create({
    name: body.name,
    note: body.note,
    staffId: request.user?.id,
  });

  response.status(201).json({ shift: serializeShift(shift) });
}

export async function endShift(request: Request, response: Response) {
  const shift = await Shift.findById(request.params.id);
  if (!shift) {
    response.status(404).json({ message: "Không tìm thấy ca làm." });
    return;
  }

  if (request.user?.role === "staff" && shift.staffId.toString() !== request.user.id) {
    response.status(403).json({ message: "Không có quyền kết thúc ca này." });
    return;
  }

  shift.status = "Đã kết thúc";
  shift.endAt = new Date();
  await shift.save();

  response.json({ shift: serializeShift(shift) });
}
