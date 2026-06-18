import { Router } from "express";
import {
  cancelHandler,
  createPlanHandler,
  deletePlanHandler,
  listPlansHandler,
  listSubscriptionsHandler,
  mySubscriptionsHandler,
  purchaseHandler,
  renewHandler,
  updatePlanHandler,
} from "../controllers/subscriptions.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const subscriptionsRoutes = Router();

// Plans
subscriptionsRoutes.get("/plans", requireAuth, asyncHandler(listPlansHandler));
subscriptionsRoutes.post("/plans", requireAuth, requireRole("admin"), asyncHandler(createPlanHandler));
subscriptionsRoutes.put("/plans/:id", requireAuth, requireRole("admin"), asyncHandler(updatePlanHandler));
subscriptionsRoutes.delete("/plans/:id", requireAuth, requireRole("admin"), asyncHandler(deletePlanHandler));

// Subscriptions
subscriptionsRoutes.get("/", requireAuth, requireRole("admin"), asyncHandler(listSubscriptionsHandler));
subscriptionsRoutes.get("/my", requireAuth, asyncHandler(mySubscriptionsHandler));
subscriptionsRoutes.post("/", requireAuth, asyncHandler(purchaseHandler));
subscriptionsRoutes.post("/:id/renew", requireAuth, asyncHandler(renewHandler));
subscriptionsRoutes.post("/:id/cancel", requireAuth, asyncHandler(cancelHandler));
