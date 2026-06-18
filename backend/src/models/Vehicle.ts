import mongoose, { Model, Schema } from "mongoose";

export type VehicleDocument = {
  _id: mongoose.Types.ObjectId;
  plate: string;
  ownerName: string;
  vehicleType: "Ô tô";
  status: "Đã đăng ký" | "Cần duyệt" | "Blacklist";
  userId?: mongoose.Types.ObjectId;
  brand?: string;
  color?: string;
  year?: number;
  engineNo?: string;
  chassisNo?: string;
  registrationDate?: Date;
  registrationExpiry?: Date;
  ownerPhone?: string;
  ownerIdCard?: string;
  ownerAddress?: string;
  notes?: string;
  imageUrl?: string;
  insuranceExpiry?: Date;
  inspectionExpiry?: Date;
  isCompanyVehicle: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const vehicleSchema = new Schema<VehicleDocument>(
  {
    plate: { type: String, required: true, trim: true, uppercase: true, unique: true },
    ownerName: { type: String, required: true, trim: true },
    vehicleType: { type: String, enum: ["Ô tô"], required: true },
    status: { type: String, enum: ["Đã đăng ký", "Cần duyệt", "Blacklist"], default: "Cần duyệt" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    brand: { type: String, trim: true },
    color: { type: String, trim: true },
    year: { type: Number },
    engineNo: { type: String, trim: true },
    chassisNo: { type: String, trim: true },
    registrationDate: { type: Date },
    registrationExpiry: { type: Date },
    ownerPhone: { type: String, trim: true },
    ownerIdCard: { type: String, trim: true },
    ownerAddress: { type: String, trim: true },
    notes: { type: String, trim: true },
    imageUrl: { type: String },
    insuranceExpiry: { type: Date },
    inspectionExpiry: { type: Date },
    isCompanyVehicle: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Vehicle: Model<VehicleDocument> =
  mongoose.models.Vehicle || mongoose.model<VehicleDocument>("Vehicle", vehicleSchema);
