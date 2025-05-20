import Fastify, { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { PrismaClient } from "@prisma/client";
import { config } from "./config.js";
import { authRoutes } from "./features/auth/auth.routes.js";

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
// TODO: Register other feature routes
// app.register(quizRoutes, { prefix: '/api/v1/quizzes' });
// app.register(categoryRoutes, { prefix: '/api/v1/categories' });
// app.register(userRoutes, { prefix: '/api/v1/users' });

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
