import { PrismaClient } from "@prisma/client";
import {
  CreateQuizInput,
  SubmitAttemptInput,
  QuizAttemptResult,
  QuizRanking,
  CategoryRanking,
  Category,
  Quiz,
  CreateQuizResult,
  jsonValueToStringArray,
  jsonValueToAnswersArray,
} from "./quiz.types.js";

export class QuizService {
  constructor(private prisma: PrismaClient) {}

  async getAllCategories(): Promise<Category[]> {
    return this.prisma.category.findMany({
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
  }

  async getQuizById(quizId: string): Promise<Quiz | null> {
    const quiz = await this.prisma.quiz.findUnique({
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
      return null;
    }

    return {
      ...quiz,
      questions: quiz.questions.map((q) => ({
        ...q,
        options: jsonValueToStringArray(q.options),
      })),
    };
  }

  async submitQuizAttempt(
    quizId: string,
    userId: string,
    input: SubmitAttemptInput
  ): Promise<QuizAttemptResult> {
    // Check if user has already attempted this quiz
    const previousAttempt = await this.prisma.quizAttempt.findFirst({
      where: {
        userId,
        quizId,
      },
    });

    const isFirstAttempt = !previousAttempt;

    // Get the quiz with questions to validate answers
    const quiz = await this.prisma.quiz.findUnique({
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
      throw new Error("Quiz not found");
    }

    // Calculate score
    let score = 0;
    const questionMap = new Map(quiz.questions.map((q) => [q.id, q]));

    for (const answer of input.answers) {
      const question = questionMap.get(answer.questionId);
      if (question && answer.selectedOption === question.correct) {
        score++;
      }
    }

    // Create quiz attempt
    const attemptData = await this.prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        score,
        answers: input.answers,
        endedAt: new Date(),
      },
    });

    // Only update user XP if this is their first attempt (10 XP per correct answer)
    let xpGained = 0;
    if (isFirstAttempt) {
      xpGained = score * 10;
      await this.prisma.user.update({
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
      attempt: {
        id: attemptData.id,
        userId: attemptData.userId,
        quizId: attemptData.quizId,
        score: attemptData.score,
        answers: jsonValueToAnswersArray(attemptData.answers),
        endedAt: attemptData.endedAt || new Date(),
      },
      score,
      totalQuestions: quiz.questions.length,
      xpGained,
      isFirstAttempt,
    };
  }

  async createQuiz(
    userId: string,
    input: CreateQuizInput
  ): Promise<CreateQuizResult> {
    // Verify if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("The authenticated user does not exist in the database");
    }

    // Verify if category exists
    const category = await this.prisma.category.findUnique({
      where: { id: input.categoryId },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    // Create quiz and questions in a transaction
    const quiz = await this.prisma.$transaction(async (tx) => {
      // Create the quiz
      const quiz = await tx.quiz.create({
        data: {
          title: input.title,
          description: input.description,
          categoryId: input.categoryId,
          creatorId: userId,
          difficulty: input.difficulty,
        },
      });

      // Create all questions
      const questions = await Promise.all(
        input.questions.map((question) =>
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

      return {
        ...quiz,
        questions: questions.map((q) => ({
          ...q,
          options: jsonValueToStringArray(q.options),
        })),
      };
    });

    // Award XP for quiz creation (50 XP)
    await this.prisma.user.update({
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
  }

  async getQuizRanking(quizId: string): Promise<QuizRanking> {
    // Verify quiz exists
    const quiz = await this.prisma.quiz.findUnique({
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
      throw new Error("Quiz not found");
    }

    // Get first attempts for each user for this quiz
    const attempts = await this.prisma.quizAttempt.findMany({
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
          percentage: Math.round((attempt.score / quiz._count.questions) * 100),
          completedAt: attempt.endedAt || new Date(),
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
  }

  async getCategoryRanking(categoryId: string): Promise<CategoryRanking> {
    // Verify category exists and get its quizzes
    const category = await this.prisma.category.findUnique({
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
      throw new Error("Category not found");
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
    const attempts = await this.prisma.quizAttempt.findMany({
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
    const userStats = new Map<
      string,
      {
        userId: string;
        username: string;
        level: number;
        xp: number;
        quizAttempts: Map<
          string,
          {
            score: number;
            totalQuestions: number;
            percentage: number;
            completedAt: Date;
          }
        >;
        totalScore: number;
        totalQuestions: number;
        quizCount: number;
        averagePercentage: number;
      }
    >();

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

      const userStat = userStats.get(userId)!;

      // Keep only the first attempt per quiz per user
      if (!userStat.quizAttempts.has(quizId)) {
        // This is the first attempt for this quiz by this user
        userStat.quizCount++;

        userStat.quizAttempts.set(quizId, {
          score: attempt.score,
          totalQuestions: totalQuestions,
          percentage: Math.round((attempt.score / totalQuestions) * 100),
          completedAt: attempt.endedAt || new Date(),
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
  }
}
