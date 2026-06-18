import mongoose, { Model, Schema } from "mongoose";

export type SlotStatus = "empty" | "occupied" | "reserved" | "maintenance";
export type SlotType = "regular" | "VIP" | "electric" | "handicap";

export type ParkingSlotDocument = {
  _id: mongoose.Types.ObjectId;
  slotCode: string;
  zoneId: mongoose.Types.ObjectId;
  zoneName: string;
  slotType: SlotType;
  features: string[];
  status: SlotStatus;
  currentSessionId?: mongoose.Types.ObjectId;
  floor: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

const parkingSlotSchema = new Schema<ParkingSlotDocument>(
  {
    slotCode: { type: String, required: true, trim: true, uppercase: true, unique: true },
    zoneId: { type: Schema.Types.ObjectId, ref: "Zone", required: true, index: true },
    zoneName: { type: String, required: true, trim: true },
    slotType: {
      type: String,
      enum: ["regular", "VIP", "electric", "handicap"],
      default: "regular",
    },
    features: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["empty", "occupied", "reserved", "maintenance"],
      default: "empty",
      index: true,
    },
    currentSessionId: { type: Schema.Types.ObjectId, ref: "ParkingSession" },
    floor: { type: Number, default: 0 },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

// Compound indexes cho query realtime
parkingSlotSchema.index({ zoneId: 1, status: 1 });
parkingSlotSchema.index({ status: 1, slotType: 1 });

export const ParkingSlot: Model<ParkingSlotDocument> =
  mongoose.models.ParkingSlot ||
  mongoose.model<ParkingSlotDocument>("ParkingSlot", parkingSlotSchema);
