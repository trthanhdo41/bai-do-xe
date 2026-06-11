import { Router } from "express";
import {
  completeParkingSession,
  createParkingSession,
  listParkingSessions,
  uploadParkingImage,
} from "../controllers/parkingSessions.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { imageUpload } from "../middlewares/upload.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const parkingSessionsRoutes = Router();

parkingSessionsRoutes.use(requireAuth);
parkingSessionsRoutes.get("/", asyncHandler(listParkingSessions));
parkingSessionsRoutes.post("/", requireRole("admin", "staff"), asyncHandler(createParkingSession));
parkingSessionsRoutes.patch("/", requireRole("admin", "staff"), asyncHandler(completeParkingSession));
parkingSessionsRoutes.post(
  "/upload",
  requireRole("admin", "staff"),
  imageUpload.single("image"),
  asyncHandler(uploadParkingImage),
);
