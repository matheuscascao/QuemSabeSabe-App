import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "./auth.service.js";
import {
  registerSchema,
  loginSchema,
  RegisterInput,
  LoginInput,
} from "./auth.types.js";

export async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService(app);

  // Register new user
  app.post<{ Body: RegisterInput }>("/register", {
    schema: {
      body: registerSchema,
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
      const result = await authService.register(request.body);
      return reply.code(201).send(result);
    },
  });

  // Login user
  app.post<{ Body: LoginInput }>("/login", {
    schema: {
      body: loginSchema,
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
      const result = await authService.login(request.body);
      return reply.send(result);
    },
  });
}
