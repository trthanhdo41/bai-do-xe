import { Router } from "express";
import { exportReport, getReportSummary } from "../controllers/reports.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const reportsRoutes = Router();

reportsRoutes.use(requireAuth, requireRole("admin"));
reportsRoutes.get("/summary", asyncHandler(getReportSummary));
reportsRoutes.get("/export", asyncHandler(exportReport));
