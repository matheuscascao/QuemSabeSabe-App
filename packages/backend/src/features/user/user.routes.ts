import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";

export async function userRoutes(app: FastifyInstance) {
  // Get current user profile
  app.get("/users/me", async (request, reply) => {
    const userId = (request.user as any)?.id;
    if (!userId) return reply.status(401).send({ message: "Unauthorized" });
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        level: true,
        xp: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) return reply.status(404).send({ message: "User not found" });
    return { user };
  });

  // Update current user profile
  app.put("/users/me", async (request, reply) => {
    const userId = (request.user as any)?.id;
    if (!userId) return reply.status(401).send({ message: "Unauthorized" });
    const body = z
      .object({
        username: z.string().min(3).max(32),
        email: z.string().email().max(64),
      })
      .parse(request.body);
    // Check for unique email/username
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: body.email },
          { username: body.username },
        ],
        NOT: { id: userId },
      },
    });
    if (existing) {
      return reply.status(400).send({ message: "Email ou nome de usuário já em uso." });
    }
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        username: body.username,
        email: body.email,
      },
      select: {
        id: true,
        email: true,
        username: true,
        level: true,
        xp: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return { user };
  });

  // Get count of quizzes attempted by user
  app.get("/users/me/attempts/count", async (request, reply) => {
    const userId = (request.user as any)?.id;
    if (!userId) return reply.status(401).send({ message: "Unauthorized" });
    const count = await prisma.quizAttempt.count({
      where: { userId },
    });
    return { count };
  });

  // Get user's main category and average percentage
  app.get("/users/me/main-category", async (request, reply) => {
    const userId = (request.user as any)?.id;
    if (!userId) return reply.status(401).send({ message: "Unauthorized" });

    // Busca todas as tentativas do usuário, incluindo quiz e categoria
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId },
      include: {
        quiz: {
          include: {
            category: true,
          },
        },
      },
    });

    // Agrupa por categoria
    const categoryStats: Record<string, {
      category: { id: string; name: string; icon: string; color: string };
      quizCount: number;
      totalScore: number;
      totalQuestions: number;
    }> = {};

    for (const attempt of attempts) {
      const cat = attempt.quiz.category;
      if (!cat) continue;
      if (!categoryStats[cat.id]) {
        categoryStats[cat.id] = {
          category: {
            id: cat.id,
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
          },
          quizCount: 0,
          totalScore: 0,
          totalQuestions: 0,
        };
      }
      categoryStats[cat.id].quizCount++;
      // Soma score e número de questões
      categoryStats[cat.id].totalScore += attempt.score;
      // Para saber o total de questões, precisamos buscar quiz.questions.length
      // Se não estiver no objeto, buscar do banco
      if (Array.isArray((attempt.quiz as any).questions)) {
        categoryStats[cat.id].totalQuestions += (attempt.quiz as any).questions.length;
      } else {
        // fallback: buscar do banco
        const quiz = await prisma.quiz.findUnique({
          where: { id: attempt.quiz.id },
          select: { questions: true },
        });
        categoryStats[cat.id].totalQuestions += quiz?.questions.length || 0;
      }
    }

    // Descobre a principal categoria (maior quizCount)
    let mainCategory = null;
    let maxCount = 0;
    for (const stat of Object.values(categoryStats)) {
      if (stat.quizCount > maxCount) {
        mainCategory = stat;
        maxCount = stat.quizCount;
      }
    }

    if (!mainCategory) return { mainCategory: null };

    // Calcula média de acertos (%)
    const averagePercentage = mainCategory.totalQuestions > 0
      ? (mainCategory.totalScore / mainCategory.totalQuestions) * 100
      : 0;

    return {
      mainCategory: {
        ...mainCategory.category,
        quizCount: mainCategory.quizCount,
        averagePercentage,
      },
    };
  });
} 