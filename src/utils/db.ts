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

// Ensure models are loaded and registered with Mongoose when this module is imported.
// This prevents MissingSchemaError when using `populate()` in API routes
// where specific model files may not have been imported yet.
try {
  // Import model files for side-effects (they register themselves with mongoose)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('../lib/models/job');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('../lib/models/application');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('../lib/models/undergraduate');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('../lib/models/company');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('../lib/models/shortlist');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('../lib/models/admin');
} catch (err) {
  // Non-fatal: if model files can't be required here (e.g., during tooling), don't crash.
  // The routes can still import models directly as a fallback.
  // console.warn('Model preloading skipped:', err);
}