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
  app.get("/categories", async (request, reply) => {
    try {
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
    } catch (error) {
      app.log.error("Error fetching categories:", error);
      return reply.status(500).send({
        error: "Internal Server Error",
        message:
          error instanceof Error ? error.message : "Failed to fetch categories",
      });
    }
  });

  // Get a specific quiz with its questions
  app.get("/quizzes/:quizId", async (request, reply) => {
    const { quizId } = z.object({ quizId: z.string() }).parse(request.params);
    console.log("quizId", quizId);

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
            correct: true,
          },
        },
      },
    });

    if (!quiz) {
      return reply
        .status(404)
        .send({ message: `Quiz with id ${quizId} not found` });
    }

    return quiz;
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

    // Check if user has already attempted this quiz
    const previousAttempt = await prisma.quizAttempt.findFirst({
      where: {
        userId,
        quizId,
      },
    });

    const isFirstAttempt = !previousAttempt;

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

    // Only update user XP if this is their first attempt (10 XP per correct answer)
    let xpGained = 0;
    if (isFirstAttempt) {
      xpGained = score * 10;
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
    }

    return {
      attempt,
      score,
      totalQuestions: quiz.questions.length,
      xpGained,
      isFirstAttempt,
    };
  });

  // Create a new quiz
  app.post("/quizzes", async (request, reply) => {
    console.log("Auth header:", request.headers.authorization);

    if (!hasUser(request)) {
      console.log("No user found in request");
      return reply.status(401).send({
        error: "Unauthorized",
        message: "No valid authentication token provided",
      });
    }

    try {
      console.log("Full request user object:", request.user);
      console.log("JWT Payload:", request.user);
      const userId = request.user.id;
      console.log("Attempting to find user with ID:", userId);
      const createQuizSchema = z.object({
        title: z.string().min(3).max(100),
        description: z.string().max(500).optional(),
        categoryId: z.string(),
        difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
        questions: z
          .array(
            z.object({
              text: z.string().min(3).max(500),
              options: z.array(z.string().min(1).max(200)).length(4),
              correct: z.number().min(0).max(3),
              timeLimit: z.number().min(5).max(120),
              order: z.number().min(1),
            })
          )
          .min(1)
          .max(20),
      });

      console.log("Received request body:", request.body);
      const data = createQuizSchema.parse(request.body);
      console.log("Parsed data:", data);

      // Verify if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      console.log("User lookup result:", user);

      if (!user) {
        return reply.status(404).send({
          error: "User Not Found",
          message: "The authenticated user does not exist in the database",
        });
      }

      // Verify if category exists
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });
      console.log("Category lookup result:", category);

      if (!category) {
        return reply.status(404).send({ message: "Category not found" });
      }

      // Create quiz and questions in a transaction
      const quiz = await prisma.$transaction(async (tx) => {
        console.log("Starting transaction...");
        // Create the quiz
        const quiz = await tx.quiz.create({
          data: {
            title: data.title,
            description: data.description,
            categoryId: data.categoryId,
            creatorId: userId,
            difficulty: data.difficulty,
          },
        });
        console.log("Quiz created:", quiz);

        // Create all questions
        const questions = await Promise.all(
          data.questions.map((question) =>
            tx.question.create({
              data: {
                quizId: quiz.id,
                text: question.text,
                options: question.options,
                correct: question.correct,
                timeLimit: question.timeLimit,
                order: question.order,
              },
            })
          )
        );
        console.log("Questions created:", questions);

        return {
          ...quiz,
          questions: questions.map((q) => ({
            ...q,
            options: q.options,
          })),
        };
      });

      // Award XP for quiz creation (50 XP)
      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: {
            increment: 50,
          },
          level: {
            increment: Math.floor(50 / 100),
          },
        },
      });

      return quiz;
    } catch (error) {
      console.error("Detailed error in quiz creation:", error);
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: "Validation Error",
          details: error.errors,
        });
      }
      return reply.status(500).send({
        error: "Internal Server Error",
        message:
          error instanceof Error ? error.message : "Something went wrong",
        details: error,
      });
    }
  });

  // Get quiz-specific ranking
  app.get("/quizzes/:quizId/ranking", async (request, reply) => {
    try {
      const { quizId } = z.object({ quizId: z.string() }).parse(request.params);

      // Verify quiz exists
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        select: {
          id: true,
          title: true,
          difficulty: true,
          _count: {
            select: {
              questions: true,
            },
          },
        },
      });

      if (!quiz) {
        return reply.status(404).send({ message: "Quiz not found" });
      }

      // Get first attempts for each user for this quiz
      const attempts = await prisma.quizAttempt.findMany({
        where: { quizId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              level: true,
              xp: true,
            },
          },
        },
        orderBy: [
          { startedAt: "asc" }, // Earliest attempts first
        ],
      });

      // Group by user and get their first attempt only
      const userFirstAttempts = new Map();
      attempts.forEach((attempt) => {
        const userId = attempt.user.id;
        // Only keep the first attempt (earliest startedAt) for each user
        if (!userFirstAttempts.has(userId)) {
          userFirstAttempts.set(userId, {
            userId: attempt.user.id,
            username: attempt.user.username,
            level: attempt.user.level,
            xp: attempt.user.xp,
            score: attempt.score,
            maxScore: quiz._count.questions,
            percentage: Math.round(
              (attempt.score / quiz._count.questions) * 100
            ),
            completedAt: attempt.endedAt,
          });
        }
      });

      // Convert to array and sort by score (desc), then by completion time (asc)
      const ranking = Array.from(userFirstAttempts.values()).sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return (
          new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
        );
      });

      return {
        quiz: {
          id: quiz.id,
          title: quiz.title,
          difficulty: quiz.difficulty,
          totalQuestions: quiz._count.questions,
        },
        ranking,
        totalParticipants: ranking.length,
      };
    } catch (error) {
      app.log.error("Error fetching quiz ranking:", error);
      return reply.status(500).send({
        error: "Internal Server Error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch quiz ranking",
      });
    }
  });

  // Get category-specific ranking
  app.get("/categories/:categoryId/ranking", async (request, reply) => {
    try {
      const { categoryId } = z
        .object({ categoryId: z.string() })
        .parse(request.params);

      // Verify category exists and get its quizzes
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: {
          quizzes: {
            include: {
              _count: {
                select: {
                  questions: true,
                },
              },
            },
          },
        },
      });

      if (!category) {
        return reply.status(404).send({ message: "Category not found" });
      }

      if (category.quizzes.length === 0) {
        return {
          category: {
            id: category.id,
            name: category.name,
            description: category.description,
            color: category.color,
            totalQuizzes: 0,
          },
          ranking: [],
          totalParticipants: 0,
        };
      }

      const quizIds = category.quizzes.map((quiz) => quiz.id);

      // Get all attempts for quizzes in this category, ordered by earliest first
      const attempts = await prisma.quizAttempt.findMany({
        where: {
          quizId: {
            in: quizIds,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              level: true,
              xp: true,
            },
          },
          quiz: {
            select: {
              id: true,
              title: true,
              _count: {
                select: {
                  questions: true,
                },
              },
            },
          },
        },
        orderBy: [{ startedAt: "asc" }], // Earliest attempts first
      });

      // Group by user and calculate their category performance using first attempts only
      const userStats = new Map();

      attempts.forEach((attempt) => {
        const userId = attempt.user.id;
        const quizId = attempt.quiz.id;
        const totalQuestions = attempt.quiz._count.questions;

        if (!userStats.has(userId)) {
          userStats.set(userId, {
            userId: attempt.user.id,
            username: attempt.user.username,
            level: attempt.user.level,
            xp: attempt.user.xp,
            quizAttempts: new Map(),
            totalScore: 0,
            totalQuestions: 0,
            quizCount: 0,
            averagePercentage: 0,
          });
        }

        const userStat = userStats.get(userId);

        // Keep only the first attempt per quiz per user
        if (!userStat.quizAttempts.has(quizId)) {
          // This is the first attempt for this quiz by this user
          userStat.quizCount++;

          userStat.quizAttempts.set(quizId, {
            score: attempt.score,
            totalQuestions: totalQuestions,
            percentage: Math.round((attempt.score / totalQuestions) * 100),
            completedAt: attempt.endedAt,
          });

          userStat.totalScore += attempt.score;
          userStat.totalQuestions += totalQuestions;
          userStat.averagePercentage = Math.round(
            (userStat.totalScore / userStat.totalQuestions) * 100
          );
        }
      });

      // Convert to array and sort by average percentage (desc), then by quiz count (desc), then by total score (desc)
      const ranking = Array.from(userStats.values())
        .map((user) => ({
          userId: user.userId,
          username: user.username,
          level: user.level,
          xp: user.xp,
          totalScore: user.totalScore,
          totalQuestions: user.totalQuestions,
          averagePercentage: user.averagePercentage,
          quizCount: user.quizCount,
          quizAttempts: Array.from(user.quizAttempts.entries()).map(
            ([quizId, attempt]) => ({
              quizId,
              ...attempt,
            })
          ),
        }))
        .sort((a, b) => {
          // Primary: Average percentage (descending)
          if (b.averagePercentage !== a.averagePercentage) {
            return b.averagePercentage - a.averagePercentage;
          }
          // Secondary: Number of quizzes completed (descending)
          if (b.quizCount !== a.quizCount) {
            return b.quizCount - a.quizCount;
          }
          // Tertiary: Total score (descending)
          return b.totalScore - a.totalScore;
        });

      return {
        category: {
          id: category.id,
          name: category.name,
          description: category.description,
          color: category.color,
          totalQuizzes: category.quizzes.length,
        },
        ranking,
        totalParticipants: ranking.length,
      };
    } catch (error) {
      app.log.error("Error fetching category ranking:", error);
      return reply.status(500).send({
        error: "Internal Server Error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch category ranking",
      });
    }
  });
}
