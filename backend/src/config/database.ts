import mongoose from "mongoose";

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined");
    }

    const connection = await mongoose.connect(mongoUri);

    console.log("✅ MongoDB Connected");
    console.log(`📦 Database: ${connection.connection.name}`);
    console.log(`🌍 Host: ${connection.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed");

    if (error instanceof Error) {
      console.error(error.message);
    }

    process.exit(1);
  }
};
