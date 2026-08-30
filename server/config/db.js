import mongoose from "mongoose";

export async function connectDB(uri, dbName) {
  if (!uri || uri.includes("<")) {
    throw new Error(
      "MONGO_URI is not configured or contains placeholder values",
    );
  }

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });

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
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}
