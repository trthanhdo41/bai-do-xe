import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bai-do-xe",
  mongoDb: process.env.MONGODB_DB || "bai-do-xe",
  jwtSecret:
    process.env.JWT_SECRET ||
    "local-development-secret-for-bai-do-xe-please-change-in-production",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://127.0.0.1:8000",
};
