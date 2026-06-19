import { Router } from "express";
import {
  confirmTopUp,
  confirmTransaction,
  createSessionTransaction,
  listTransactions,
  topUpWallet,
} from "../controllers/transactions.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const transactionsRoutes = Router();

transactionsRoutes.use(requireAuth);
transactionsRoutes.get("/", asyncHandler(listTransactions));
transactionsRoutes.post("/top-up", asyncHandler(topUpWallet));
transactionsRoutes.post("/session/:sessionId", asyncHandler(createSessionTransaction));
transactionsRoutes.post("/:id/confirm", requireRole("admin"), asyncHandler(confirmTransaction));
transactionsRoutes.post("/:id/confirm-topup", requireRole("admin"), asyncHandler(confirmTopUp));
