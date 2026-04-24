import mongoose from "mongoose";

export async function connectDB() {
  try {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/bugwise";
    const conn = await mongoose.connect(uri);
    console.log(`  ✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`  ❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
