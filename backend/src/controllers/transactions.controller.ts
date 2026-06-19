import { Request, Response } from "express";
import { z } from "zod";
import { ParkingSession } from "../models/ParkingSession.js";
import { Transaction } from "../models/Transaction.js";
import { createNotification } from "../services/notification.service.js";
import { createPendingTransactionForSession, objectId } from "../services/transaction.service.js";
import { serializeTransaction } from "../utils/serializers.js";

export async function listTransactions(request: Request, response: Response) {
  const criteria = request.user?.role === "customer" ? { userId: request.user.id } : {};
  const transactions = await Transaction.find(criteria).sort({ createdAt: -1 }).limit(200);
  response.json({ transactions: transactions.map(serializeTransaction) });
}

export async function createSessionTransaction(request: Request, response: Response) {
  const session = await ParkingSession.findById(request.params.sessionId);
  if (!session) {
    response.status(404).json({ message: "Không tìm thấy phiên đỗ xe." });
    return;
  }

  if (request.user?.role === "customer" && session.ownerUserId?.toString() !== request.user.id) {
    response.status(403).json({ message: "Không có quyền tạo giao dịch cho phiên này." });
    return;
  }

  const transaction = await createPendingTransactionForSession(session);
  await session.save();

  response.status(201).json({
    transaction: transaction ? serializeTransaction(transaction) : null,
    sessionPaymentStatus: session.paymentStatus,
    message: transaction ? "Đã tạo giao dịch VietQR." : "Phiên không phát sinh phí.",
  });
}

export async function confirmTransaction(request: Request, response: Response) {
  const body = z.object({ note: z.string().optional() }).parse(request.body);
  const transaction = await Transaction.findById(request.params.id);
  if (!transaction) {
    response.status(404).json({ message: "Không tìm thấy giao dịch." });
    return;
  }

  transaction.status = "paid";
  transaction.paidAt = new Date();
  transaction.confirmedBy = objectId(request.user?.id);
  transaction.note = body.note;
  await transaction.save();

  if (transaction.sessionId) {
    await ParkingSession.findByIdAndUpdate(transaction.sessionId, {
      paymentStatus: "paid",
      transactionId: transaction._id,
    });
  }

  await createNotification({
    title: "Thanh toán đã xác nhận",
    content: `Giao dịch ${transaction.content} đã được xác nhận.`,
    targetRole: "admin",
  });

  response.json({ transaction: serializeTransaction(transaction) });
}

// --- CU-05: Wallet Top-up ---
import { User } from "../models/User.js";

export async function topUpWallet(request: Request, response: Response) {
  const body = z.object({ amount: z.number().int().min(10000) }).parse(request.body);
  const user = await User.findById(request.user?.id);
  if (!user) {
    response.status(401).json({ message: "Chưa đăng nhập." });
    return;
  }

  // Create a top-up transaction
  const transaction = await Transaction.create({
    userId: user._id,
    method: "vietqr",
    amount: body.amount,
    status: "pending",
    content: `TOPUP-${user._id.toString().slice(-6)}-${Date.now()}`,
  });

  response.status(201).json({
    transaction: serializeTransaction(transaction),
    message: `Đã tạo yêu cầu nạp ${body.amount.toLocaleString("vi-VN")} VND. Chờ admin xác nhận.`,
  });
}

export async function confirmTopUp(request: Request, response: Response) {
  const transaction = await Transaction.findById(request.params.id);
  if (!transaction || !transaction.content.startsWith("TOPUP")) {
    response.status(404).json({ message: "Không tìm thấy giao dịch nạp tiền." });
    return;
  }
  if (transaction.status === "paid") {
    response.status(400).json({ message: "Giao dịch đã được xác nhận trước đó." });
    return;
  }

  transaction.status = "paid";
  transaction.paidAt = new Date();
  transaction.confirmedBy = objectId(request.user?.id);
  await transaction.save();

  // Credit wallet
  if (transaction.userId) {
    await User.findByIdAndUpdate(transaction.userId, {
      $inc: { wallet: transaction.amount },
    });
  }

  response.json({
    transaction: serializeTransaction(transaction),
    message: `Đã nạp ${transaction.amount.toLocaleString("vi-VN")} VND vào ví.`,
  });
}
