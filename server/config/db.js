import mongoose from "mongoose";

export async function connectDB(uri, dbName) {
  if (!uri || uri.includes("<")) {
    console.warn("MONGO_URI not configured — using in-memory fallback.");
    return;
  }

  try {
    await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      retryWrites: true,
      tls: true, // required for MongoDB Atlas
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
}
