import { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";

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

// Create a type guard to check if user exists
function hasUser(
  request: FastifyRequest
): request is FastifyRequest & { user: NonNullable<FastifyRequest["user"]> } {
  return request.user !== undefined;
}

export async function quizRoutes(app: FastifyInstance) {
  // Get all categories with their quizzes
  app.get("/categories", async () => {
    const categories = await prisma.category.findMany({
      include: {
        quizzes: {
          select: {
            id: true,
            title: true,
            description: true,
            difficulty: true,
            _count: {
              select: {
                questions: true,
              },
            },
          },
        },
      },
    });

    return categories;
  });

  // Get a specific quiz with its questions
  app.get("/quizzes/:quizId", async (request, reply) => {
    const { quizId } = z.object({ quizId: z.string() }).parse(request.params);

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        category: true,
        questions: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            text: true,
            options: true,
            timeLimit: true,
            order: true,
          },
        },
      },
    });

    if (!quiz) {
      return reply.status(404).send({ message: "Quiz not found" });
    }

    // Don't send the correct answers to the client
    return {
      ...quiz,
      questions: quiz.questions.map((q) => ({
        ...q,
        options: q.options,
      })),
    };
  });

  // Submit a quiz attempt
  app.post("/quizzes/:quizId/attempt", async (request, reply) => {
    if (!hasUser(request)) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    const { quizId } = z.object({ quizId: z.string() }).parse(request.params);
    const { answers } = z
      .object({
        answers: z.array(
          z.object({
            questionId: z.string(),
            selectedOption: z.number(),
          })
        ),
      })
      .parse(request.body);

    const userId = request.user.id;

    // Get the quiz with questions to validate answers
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          select: {
            id: true,
            correct: true,
          },
        },
      },
    });

    if (!quiz) {
      return reply.status(404).send({ message: "Quiz not found" });
    }

    // Calculate score
    let score = 0;
    const questionMap = new Map(quiz.questions.map((q) => [q.id, q]));

    for (const answer of answers) {
      const question = questionMap.get(answer.questionId);
      if (question && answer.selectedOption === question.correct) {
        score++;
      }
    }

    // Create quiz attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        score,
        answers: answers,
        endedAt: new Date(),
      },
    });

    // Update user XP (10 XP per correct answer)
    const xpGained = score * 10;
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: {
          increment: xpGained,
        },
        // Level up every 100 XP
        level: {
          increment: Math.floor(xpGained / 100),
        },
      },
    });

    return {
      attempt,
      score,
      totalQuestions: quiz.questions.length,
      xpGained,
    };
  });
}
