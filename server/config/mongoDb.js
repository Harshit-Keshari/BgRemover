import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    // Already connected (prevents duplicate connections on Vercel)
    return;
  }

  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/bgRemoval`);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    throw error;
  }
};

export default connectDB;
