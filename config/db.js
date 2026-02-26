import mongoose from "mongoose";
import dotenv from "dotenv";
import {MONGOURI} from "../constants.js"

dotenv.config();

// --------------------- MongoDB Connection ---------------------
export const connectMongoDB = async () => {
  try {
    await mongoose.connect(`${MONGOURI}`);
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // exit app if DB fails
  }
};