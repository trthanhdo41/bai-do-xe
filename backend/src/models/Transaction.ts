import mongoose, { Model, Schema } from "mongoose";

export type TransactionStatus = "pending" | "paid" | "failed" | "cancelled";

export type TransactionDocument = {
  _id: mongoose.Types.ObjectId;
  sessionId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  method: "vietqr" | "wallet" | "cash";
  amount: number;
  status: TransactionStatus;
  content: string;
  qrUrl?: string;
  paidAt?: Date;
  confirmedBy?: mongoose.Types.ObjectId;
  note?: string;
  // Extended
  transactionCode?: string;
  bankTransactionId?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  gateway?: string;
  discount?: number;
  couponCode?: string;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: Date;
  refundedBy?: mongoose.Types.ObjectId;
  receiptUrl?: string;
  invoiceNumber?: string;
  currency?: string;
  exchangeRate?: number;
  fee?: number;
  tax?: number;
  paymentGatewayResponse?: string;
  createdAt: Date;
  updatedAt: Date;
};

const transactionSchema = new Schema<TransactionDocument>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: "ParkingSession", index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    method: { type: String, enum: ["vietqr", "wallet", "cash"], default: "vietqr" },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["pending", "paid", "failed", "cancelled"], default: "pending" },
    content: { type: String, required: true },
    qrUrl: { type: String },
    paidAt: { type: Date },
    confirmedBy: { type: Schema.Types.ObjectId, ref: "User" },
    note: { type: String },
    // Extended
    transactionCode: { type: String, trim: true },
    bankTransactionId: { type: String, trim: true },
    bankName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    accountName: { type: String, trim: true },
    gateway: { type: String, trim: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, trim: true },
    refundAmount: { type: Number },
    refundReason: { type: String },
    refundedAt: { type: Date },
    refundedBy: { type: Schema.Types.ObjectId, ref: "User" },
    receiptUrl: { type: String },
    invoiceNumber: { type: String, trim: true },
    currency: { type: String, default: "VND", trim: true },
    exchangeRate: { type: Number },
    fee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    paymentGatewayResponse: { type: String },
  },
  { timestamps: true },
);

export const Transaction: Model<TransactionDocument> =
  mongoose.models.Transaction ||
  mongoose.model<TransactionDocument>("Transaction", transactionSchema);
