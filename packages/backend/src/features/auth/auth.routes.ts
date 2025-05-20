import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { RegisterInput, LoginInput } from "./auth.types.js";
import { registerUser, loginUser } from "./auth.service.js";

export async function authRoutes(app: FastifyInstance) {
  // Register new user
  app.post<{ Body: RegisterInput }>("/register", {
    schema: {
      body: {
        type: "object",
        required: ["email", "username", "password"],
        properties: {
          email: { type: "string", format: "email" },
          username: { type: "string", minLength: 3, maxLength: 30 },
          password: { type: "string", minLength: 6 },
        },
      },
      response: {
        201: {
          type: "object",
          properties: {
            token: { type: "string" },
            user: {
              type: "object",
              properties: {
                id: { type: "string" },
                email: { type: "string" },
                username: { type: "string" },
                level: { type: "number" },
                xp: { type: "number" },
              },
            },
          },
        },
      },
    },
    handler: async (
      request: FastifyRequest<{ Body: RegisterInput }>,
      reply: FastifyReply
    ) => {
      const result = await registerUser(app, request.body);
      return reply.code(201).send(result);
    },
  });

  // Login user
  app.post<{ Body: LoginInput }>("/login", {
    schema: {
      body: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            token: { type: "string" },
            user: {
              type: "object",
              properties: {
                id: { type: "string" },
                email: { type: "string" },
                username: { type: "string" },
                level: { type: "number" },
                xp: { type: "number" },
              },
            },
          },
        },
      },
    },
    handler: async (
      request: FastifyRequest<{ Body: LoginInput }>,
      reply: FastifyReply
    ) => {
      const result = await loginUser(app, request.body);
      return reply.send(result);
    },
  });
}
