import mongoose from "mongoose"

let isConnected = false // Track connection state

const connectDB = async () => {
  if (isConnected) {
    console.log("🟢 Using existing MongoDB connection")
    return
  }

  try {
    const conn = await mongoose.connect(`${process.env.MONGODB_URI}/bgRemoval`, {
      serverSelectionTimeoutMS: 5000,
    })

    isConnected = conn.connections[0].readyState === 1
    console.log("✅ MongoDB connected successfully")
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message)
    throw error
  }
}

export default connectDB
