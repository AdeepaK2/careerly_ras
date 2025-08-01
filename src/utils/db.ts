import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  // In CI environment or when SKIP_DB_VALIDATION is set, provide a mock URI
  if (process.env.CI === 'true' || process.env.SKIP_DB_VALIDATION === 'true') {
    console.warn('Running in CI environment or DB validation skipped - using mock database connection');
  } else {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }
}



const connect = async () => {
  // In CI environment or when DB validation is skipped, don't attempt real connection
  if (process.env.CI === 'true' || process.env.SKIP_DB_VALIDATION === 'true') {
    console.log('Skipping database connection in CI environment');
    return;
  }

  // If no MONGODB_URI in non-CI environment, throw error
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  const connectionState = mongoose.connection.readyState;
  
  // If already connected, return early
  if (connectionState === 1) {
    // console.log("DB already connected");
    return;
  }
  
  // If connecting, wait for it
  if (connectionState === 2) {
    // console.log("DB connecting");
    return;
  }

  // If disconnected, disconnecting, or uninitialized, establish a new connection
  if (connectionState === 0 || connectionState === 3) {
    try {
      await mongoose.connect(MONGODB_URI, {
        dbName: "careerly-ras",
        bufferCommands: true
      });
      // console.log("DB connected");
    } catch (error: any) {
      // console.error("Error connecting to the database:", error);
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }
};

export default connect;