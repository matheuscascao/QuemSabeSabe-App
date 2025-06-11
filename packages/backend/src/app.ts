import Fastify, { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { PrismaClient } from "@prisma/client";
import { config } from "./config.js";
import { authRoutes } from "./features/auth/auth.routes.js";
import { quizRoutes } from "./features/quiz/quiz.routes.js";
import { userRoutes } from "./features/user/user.routes.js";

interface JWTError extends Error {
  code?: string;
}

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize Fastify
const app = Fastify({
  logger: true,
});

// Decorate Fastify with Prisma
app.decorate("prisma", prisma);

// Register plugins
await app.register(cors, {
  origin: config.corsOrigin,
  credentials: true,
});

await app.register(jwt, {
  secret: config.jwtSecret,
});

// Add JWT authentication hook
app.addHook("onRequest", async (request, reply) => {
  try {
    const url = request.url;
    if (url.startsWith("/api/v1/auth/")) {
      return;
    }
    await request.jwtVerify();
  } catch (err) {
    const jwtError = err as JWTError;
    if (jwtError.code === "FST_JWT_NO_AUTHORIZATION_IN_HEADER") {
      return reply.status(401).send({
        error: "Unauthorized",
        message: "No authorization token provided",
      });
    }
    if (jwtError.code === "FST_JWT_AUTHORIZATION_TOKEN_EXPIRED") {
      return reply.status(401).send({
        error: "Unauthorized",
        message: "Authorization token expired",
      });
    }
    if (jwtError.code === "FST_JWT_AUTHORIZATION_TOKEN_INVALID") {
      return reply.status(401).send({
        error: "Unauthorized",
        message: "Invalid authorization token",
      });
    }
    return reply.status(401).send({
      error: "Unauthorized",
      message: "Authentication failed",
    });
  }
});

// Swagger documentation
await app.register(swagger, {
  openapi: {
    info: {
      title: "Quiz Master API",
      description: "API documentation for the Quiz Master application",
      version: "1.0.0",
    },
  },
});

await app.register(swaggerUi, {
  routePrefix: "/docs",
});

// Health check route
app.get("/health", async () => {
  return { status: "ok" };
});

// Register routes
app.register(authRoutes, { prefix: "/api/v1/auth" });
app.register(quizRoutes, { prefix: "/api/v1" });
app.register(userRoutes, { prefix: "/api/v1" });

// Error handling
app.setErrorHandler(
  (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    app.log.error(error);

    if (error.validation) {
      return reply.status(400).send({
        error: "Validation Error",
        message: error.message,
      });
    }

    return reply.status(500).send({
      error: "Internal Server Error",
      message: "Something went wrong",
    });
  }
);

// Start the server
try {
  await app.listen({ port: config.port, host: "0.0.0.0" });
  console.log(`Server is running on port ${config.port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

// Cleanup on shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
