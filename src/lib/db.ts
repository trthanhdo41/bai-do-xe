import mongoose from "mongoose";

type CachedConnection = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalWithMongoose = global as typeof globalThis & {
  mongooseConnection?: CachedConnection;
};

const cached: CachedConnection = globalWithMongoose.mongooseConnection ?? {
  conn: null,
  promise: null,
};

globalWithMongoose.mongooseConnection = cached;

export async function connectDb() {
  if (cached.conn) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI");
  }

  cached.promise ??= mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || "bai-do-xe",
  });

  cached.conn = await cached.promise;
  return cached.conn;
}
