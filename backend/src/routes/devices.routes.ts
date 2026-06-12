import { Router } from "express";
import { createDevice, listDevices, snapshotDevice, updateDevice } from "../controllers/devices.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const devicesRoutes = Router();

devicesRoutes.use(requireAuth, requireRole("admin", "staff"));
devicesRoutes.get("/", asyncHandler(listDevices));
devicesRoutes.post("/", requireRole("admin"), asyncHandler(createDevice));
devicesRoutes.patch("/:id", requireRole("admin"), asyncHandler(updateDevice));
devicesRoutes.post("/:id/snapshot", asyncHandler(snapshotDevice));
