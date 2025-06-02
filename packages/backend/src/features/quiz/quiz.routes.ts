import { FastifyInstance, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma.js";
import { QuizService } from "./quiz.service.js";
import {
  JWTPayload,
  createQuizSchema,
  submitAttemptSchema,
  quizIdSchema,
  categoryIdSchema,
} from "./quiz.types.js";

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
  const quizService = new QuizService(prisma);

  // Get all categories with their quizzes
  app.get("/categories", async (request, reply) => {
    try {
      const categories = await quizService.getAllCategories();
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
    try {
      const { quizId } = quizIdSchema.parse(request.params);
      const quiz = await quizService.getQuizById(quizId);

      if (!quiz) {
        return reply
          .status(404)
          .send({ message: `Quiz with id ${quizId} not found` });
      }

      return quiz;
    } catch (error) {
      app.log.error("Error fetching quiz:", error);
      return reply.status(500).send({
        error: "Internal Server Error",
        message:
          error instanceof Error ? error.message : "Failed to fetch quiz",
      });
    }
  });

  // Submit a quiz attempt
  app.post("/quizzes/:quizId/attempt", async (request, reply) => {
    if (!hasUser(request)) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    try {
      const { quizId } = quizIdSchema.parse(request.params);
      const input = submitAttemptSchema.parse(request.body);
      const userId = request.user.id;

      const result = await quizService.submitQuizAttempt(quizId, userId, input);
      return result;
    } catch (error) {
      app.log.error("Error submitting quiz attempt:", error);
      if (error instanceof Error) {
        if (error.message === "Quiz not found") {
          return reply.status(404).send({ message: error.message });
        }
      }
      return reply.status(500).send({
        error: "Internal Server Error",
        message:
          error instanceof Error ? error.message : "Failed to submit attempt",
      });
    }
  });

  // Create a new quiz
  app.post("/quizzes", async (request, reply) => {
    if (!hasUser(request)) {
      return reply.status(401).send({
        error: "Unauthorized",
        message: "No valid authentication token provided",
      });
    }

    try {
      const data = createQuizSchema.parse(request.body);
      const userId = request.user.id;

      const quiz = await quizService.createQuiz(userId, data);
      return quiz;
    } catch (error) {
      app.log.error("Error creating quiz:", error);
      if (error instanceof Error) {
        if (
          error.message ===
          "The authenticated user does not exist in the database"
        ) {
          return reply.status(404).send({
            error: "User Not Found",
            message: error.message,
          });
        }
        if (error.message === "Category not found") {
          return reply.status(404).send({ message: error.message });
        }
      }
      return reply.status(500).send({
        error: "Internal Server Error",
        message:
          error instanceof Error ? error.message : "Something went wrong",
      });
    }
  });

  // Get quiz-specific ranking
  app.get("/quizzes/:quizId/ranking", async (request, reply) => {
    try {
      const { quizId } = quizIdSchema.parse(request.params);
      const ranking = await quizService.getQuizRanking(quizId);
      return ranking;
    } catch (error) {
      app.log.error("Error fetching quiz ranking:", error);
      if (error instanceof Error && error.message === "Quiz not found") {
        return reply.status(404).send({ message: error.message });
      }
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
      const { categoryId } = categoryIdSchema.parse(request.params);
      const ranking = await quizService.getCategoryRanking(categoryId);
      return ranking;
    } catch (error) {
      app.log.error("Error fetching category ranking:", error);
      if (error instanceof Error && error.message === "Category not found") {
        return reply.status(404).send({ message: error.message });
      }
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
