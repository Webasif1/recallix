import mongoose from "mongoose";

async function connectToDb() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not set — cannot start.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    // Previously this was swallowed and the server booted with no database,
    // so every request failed with an opaque 500.
    console.error(`Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
}

export default connectToDb;
