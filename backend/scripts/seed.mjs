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
    twoFactorEnabled: Boolean,
  },
  { timestamps: true },
);

const vehicleSchema = new mongoose.Schema(
  {
    plate: { type: String, unique: true },
    ownerName: String,
    vehicleType: String,
    status: String,
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Vehicle = mongoose.models.Vehicle || mongoose.model("Vehicle", vehicleSchema);

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
        twoFactorEnabled: false,
      },
    },
    { upsert: true },
  );
}

for (const vehicle of seedVehicles) {
  await Vehicle.updateOne({ plate: vehicle.plate }, { $set: vehicle }, { upsert: true });
}

await mongoose.disconnect();
console.log("Seed completed.");
