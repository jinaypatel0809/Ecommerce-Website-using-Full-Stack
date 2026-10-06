import mongoose from "mongoose";

export default async function connectDB() {
  const connection = await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log(`MongoDB connected: ${connection.connection.host}`);
}
