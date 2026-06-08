import bcrypt from "bcryptjs";
import mongoose from "mongoose";

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
    name: process.env.ADMIN_NAME || "Quản trị viên",
    email: process.env.ADMIN_EMAIL || "admin@parking.local",
    password: process.env.ADMIN_PASSWORD || "123456",
    role: "admin",
    wallet: 0,
  },
  {
    name: process.env.STAFF_NAME || "Nhân viên ca sáng",
    email: process.env.STAFF_EMAIL || "staff@parking.local",
    password: process.env.STAFF_PASSWORD || "123456",
    role: "staff",
    wallet: 0,
  },
  {
    name: process.env.CUSTOMER_NAME || "Khách hàng",
    email: process.env.CUSTOMER_EMAIL || "customer@parking.local",
    password: process.env.CUSTOMER_PASSWORD || "123456",
    role: "customer",
    wallet: 250000,
  },
];

const seedVehicles = [
  { plate: "30H-678.90", ownerName: "Nguyễn Minh Anh", vehicleType: "Ô tô", status: "Đã đăng ký" },
  { plate: "29B1-345.67", ownerName: "Trần Hoàng Nam", vehicleType: "Xe máy", status: "Đã đăng ký" },
  { plate: "30K-999.99", ownerName: "Khách vi phạm", vehicleType: "Ô tô", status: "Blacklist" },
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
