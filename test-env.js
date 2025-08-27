// Quick test to check environment variables
console.log("Environment Variables Check:");
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "EXISTS" : "NOT SET");
console.log(
  "ADMIN_ACCESS_TOKEN_SECRET:",
  process.env.ADMIN_ACCESS_TOKEN_SECRET ? "EXISTS" : "NOT SET"
);
console.log(
  "ADMIN_REFRESH_TOKEN_SECRET:",
  process.env.ADMIN_REFRESH_TOKEN_SECRET ? "EXISTS" : "NOT SET"
);
console.log("NODE_ENV:", process.env.NODE_ENV);
