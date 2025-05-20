import { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { RegisterInput, LoginInput, AuthResponse } from "./auth.types.js";

export async function registerUser(
  app: FastifyInstance,
  input: RegisterInput
): Promise<AuthResponse> {
  const { email, username, password } = input;

  // Check if user already exists
  const existingUser = await app.prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) {
    throw new Error("User with this email or username already exists");
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user
  const user = await app.prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
    },
  });

  // Generate JWT token
  const token = app.jwt.sign({ userId: user.id });

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
}

export async function loginUser(
  app: FastifyInstance,
  input: LoginInput
): Promise<AuthResponse> {
  const { email, password } = input;

  // Find user
  const user = await app.prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw new Error("Invalid email or password");
  }

  // Generate JWT token
  const token = app.jwt.sign({ userId: user.id });

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
}
