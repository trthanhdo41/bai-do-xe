import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env") });

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bai-do-xe";
const dbName = process.env.MONGODB_DB || "bai-do-xe";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    passwordHash: String,
    role: String,
    status: String,
    wallet: Number,
    provider: String,
    googleId: String,
    avatarUrl: String,
    twoFactorEnabled: Boolean,
    twoFactorSecret: String,
    twoFactorPendingSecret: String,
  },
  { timestamps: true },
);

const vehicleSchema = new mongoose.Schema(
  {
    plate: { type: String, unique: true },
    ownerName: String,
    vehicleType: String,
    status: String,
    userId: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Vehicle = mongoose.models.Vehicle || mongoose.model("Vehicle", vehicleSchema);
const pricingConfigSchema = new mongoose.Schema(
  {
    freeMinutes: Number,
    hourlyRate: Number,
    overnightRate: Number,
    monthlyRate: Number,
    overdueFineRate: Number,
    isActive: Boolean,
    updatedBy: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true },
);
const PricingConfig =
  mongoose.models.PricingConfig || mongoose.model("PricingConfig", pricingConfigSchema);
const paymentConfigSchema = new mongoose.Schema(
  {
    bankName: String,
    bankBin: String,
    accountNumber: String,
    accountName: String,
    transferPrefix: String,
    isActive: Boolean,
    updatedBy: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true },
);
const deviceSchema = new mongoose.Schema(
  {
    name: String,
    gate: String,
    rtspUrl: String,
    username: String,
    password: String,
    roiNote: String,
    status: String,
    lastSnapshotUrl: String,
    lastSnapshotAt: Date,
    createdBy: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true },
);
const notificationSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    targetRole: String,
    userId: mongoose.Schema.Types.ObjectId,
    readBy: [mongoose.Schema.Types.ObjectId],
  },
  { timestamps: true },
);
const PaymentConfig =
  mongoose.models.PaymentConfig || mongoose.model("PaymentConfig", paymentConfigSchema);
const Device = mongoose.models.Device || mongoose.model("Device", deviceSchema);
const Notification =
  mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

const seedUsers = [
  {
    name: process.env.ADMIN_NAME || "Super Admin iPARK",
    email: process.env.ADMIN_EMAIL || "admin@ipark.vn",
    password: process.env.ADMIN_PASSWORD || "admin",
    role: "admin",
    wallet: 0,
  },
  {
    name: process.env.STAFF_1_NAME || "Nhân viên cổng 1",
    email: process.env.STAFF_1_EMAIL || "nv.1@ipark.vn",
    password: process.env.STAFF_1_PASSWORD || "123456",
    role: "staff",
    wallet: 0,
  },
  {
    name: process.env.STAFF_2_NAME || "Nhân viên cổng 2",
    email: process.env.STAFF_2_EMAIL || "nv.2@ipark.vn",
    password: process.env.STAFF_2_PASSWORD || "123456",
    role: "staff",
    wallet: 0,
  },
  {
    name: process.env.STAFF_3_NAME || "Nhân viên cổng 3",
    email: process.env.STAFF_3_EMAIL || "nv.3@ipark.vn",
    password: process.env.STAFF_3_PASSWORD || "123456",
    role: "staff",
    wallet: 0,
  },
];

const seedVehicles = [
  { plate: "30H-678.90", ownerName: "Khách iPARK 01", vehicleType: "Ô tô", status: "Đã đăng ký" },
  { plate: "30F-222.11", ownerName: "Khách iPARK 02", vehicleType: "Ô tô", status: "Đã đăng ký" },
  { plate: "30K-999.99", ownerName: "Xe blacklist", vehicleType: "Ô tô", status: "Blacklist" },
];

await mongoose.connect(uri, { dbName });

for (const user of seedUsers) {
  const passwordHash = await bcrypt.hash(user.password, 12);
  await User.updateOne(
    { email: user.email.toLowerCase() },
    {
      $set: {
        name: user.name,
        email: user.email.toLowerCase(),
        passwordHash,
        role: user.role,
        status: "Đang hoạt động",
        wallet: user.wallet,
        provider: "credentials",
        twoFactorEnabled: false,
      },
    },
    { upsert: true },
  );
}

for (const vehicle of seedVehicles) {
  await Vehicle.updateOne({ plate: vehicle.plate }, { $set: vehicle }, { upsert: true });
}

await PricingConfig.updateOne(
  { isActive: true },
  {
    $set: {
      freeMinutes: Number(process.env.PRICING_FREE_MINUTES || 20),
      hourlyRate: Number(process.env.PRICING_HOURLY_RATE || 10000),
      overnightRate: Number(process.env.PRICING_OVERNIGHT_RATE || 80000),
      monthlyRate: Number(process.env.PRICING_MONTHLY_RATE || 1200000),
      overdueFineRate: Number(process.env.PRICING_OVERDUE_FINE_RATE || 20000),
      isActive: true,
    },
  },
  { upsert: true },
);

await PaymentConfig.updateOne(
  { isActive: true },
  {
    $set: {
      bankName: process.env.PAYMENT_BANK_NAME || "Ngân hàng test",
      bankBin: process.env.PAYMENT_BANK_BIN || "970436",
      accountNumber: process.env.PAYMENT_ACCOUNT_NUMBER || "0000000000",
      accountName: process.env.PAYMENT_ACCOUNT_NAME || "IPARK",
      transferPrefix: process.env.PAYMENT_TRANSFER_PREFIX || "IPARK",
      isActive: true,
    },
  },
  { upsert: true },
);

await Device.updateOne(
  { gate: "entry", name: "Camera cổng vào" },
  {
    $set: {
      gate: "entry",
      name: "Camera cổng vào",
      rtspUrl: process.env.RTSP_ENTRY_URL || "rtsp://example.local/entry",
      username: process.env.RTSP_ENTRY_USERNAME || "",
      password: process.env.RTSP_ENTRY_PASSWORD || "",
      roiNote: "Biển số trước",
      status: "unknown",
    },
  },
  { upsert: true },
);

await Device.updateOne(
  { gate: "exit", name: "Camera cổng ra" },
  {
    $set: {
      gate: "exit",
      name: "Camera cổng ra",
      rtspUrl: process.env.RTSP_EXIT_URL || "rtsp://example.local/exit",
      username: process.env.RTSP_EXIT_USERNAME || "",
      password: process.env.RTSP_EXIT_PASSWORD || "",
      roiNote: "Biển số sau",
      status: "unknown",
    },
  },
  { upsert: true },
);

await Notification.updateOne(
  { title: "Chào mừng iPARK" },
  {
    $set: {
      title: "Chào mừng iPARK",
      content: "Hệ thống đã sẵn sàng cho demo local.",
      targetRole: "all",
      readBy: [],
    },
  },
  { upsert: true },
);

await mongoose.disconnect();
console.log("Seed completed.");
