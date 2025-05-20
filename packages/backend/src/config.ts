import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "your-secret-key",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  databaseUrl: process.env.DATABASE_URL,
} as const;

// Validate required environment variables
if (!config.databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

if (config.nodeEnv === "production" && config.jwtSecret === "your-secret-key") {
  throw new Error("JWT_SECRET must be set in production");
}
