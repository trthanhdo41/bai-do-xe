import mongoose, { Model, Schema } from "mongoose";

export type SubscriptionStatus = "active" | "expired" | "cancelled";

export type SubscriptionDocument = {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  planName: string;
  startDate: Date;
  endDate: Date;
  status: SubscriptionStatus;
  autoRenew: boolean;
  plates: string[];
  transactionId?: mongoose.Types.ObjectId;
  renewalCount: number;
  createdAt: Date;
  updatedAt: Date;
};

const subscriptionSchema = new Schema<SubscriptionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: "SubscriptionPlan", required: true },
    planName: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
      index: true,
    },
    autoRenew: { type: Boolean, default: false },
    plates: { type: [String], default: [] },
    transactionId: { type: Schema.Types.ObjectId, ref: "Transaction" },
    renewalCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ endDate: 1, status: 1 });

export const Subscription: Model<SubscriptionDocument> =
  mongoose.models.Subscription ||
  mongoose.model<SubscriptionDocument>("Subscription", subscriptionSchema);
