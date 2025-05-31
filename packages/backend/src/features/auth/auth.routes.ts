import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import bcrypt from "bcryptjs";

// Define the JWT payload type
interface JWTPayload {
  id: string;
  email: string;
  username: string;
}

// Extend Fastify's JWT type system
declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JWTPayload;
    user: JWTPayload;
  }
}

export async function authRoutes(app: FastifyInstance) {
  // Register a new user
  app.post("/register", async (request, reply) => {
    const { email, username, password } = z
      .object({
        email: z.string().email(),
        username: z.string().min(3).max(20),
        password: z.string().min(6),
      })
      .parse(request.body);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return reply.status(400).send({
        message: "User with this email or username already exists",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        level: 1,
        xp: 0,
      },
    });

    // Generate JWT token
    const token = app.jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      {
        expiresIn: "7d",
      }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        level: user.level,
        xp: user.xp,
      },
    };
  });

  // Login
  app.post("/login", async (request, reply) => {
    const { email, password } = z
      .object({
        email: z.string().email(),
        password: z.string(),
      })
      .parse(request.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return reply.status(401).send({
        message: "Invalid email or password",
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return reply.status(401).send({
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = app.jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      {
        expiresIn: "7d",
      }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        level: user.level,
        xp: user.xp,
      },
    };
  });

  // Global Ranking
  app.get("/ranking", async (request, reply) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          level: true,
          xp: true,
        },
        orderBy: {
          xp: "desc",
        },
      });
      return users;
    } catch (error) {
      return reply.status(500).send({ message: "Failed to fetch ranking" });
    }
  });
}
