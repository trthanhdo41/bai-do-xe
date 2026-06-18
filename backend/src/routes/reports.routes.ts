import { Router } from "express";
import {
  exportReport,
  getReportSummary,
  occupancyHourlyHandler,
  peakHoursHandler,
  revenueChartHandler,
  topCustomersHandler,
} from "../controllers/reports.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const reportsRoutes = Router();

reportsRoutes.use(requireAuth, requireRole("admin"));
reportsRoutes.get("/summary", asyncHandler(getReportSummary));
reportsRoutes.get("/export", asyncHandler(exportReport));
reportsRoutes.get("/revenue-chart", asyncHandler(revenueChartHandler));
reportsRoutes.get("/occupancy-hourly", asyncHandler(occupancyHourlyHandler));
reportsRoutes.get("/top-customers", asyncHandler(topCustomersHandler));
reportsRoutes.get("/peak-hours", asyncHandler(peakHoursHandler));
