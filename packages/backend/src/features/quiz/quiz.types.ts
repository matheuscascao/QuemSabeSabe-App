import { Prisma } from "@prisma/client";

// Re-export all shared types
export * from "@quiz-master/shared";

// Backend-specific helper functions for Prisma JsonValue handling
export function jsonValueToStringArray(value: Prisma.JsonValue): string[] {
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return value as string[];
  }
  return [];
}

export function jsonValueToAnswersArray(value: Prisma.JsonValue): Array<{
  questionId: string;
  selectedOption: number;
}> {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is { questionId: string; selectedOption: number } =>
        typeof item === "object" &&
        item !== null &&
        "questionId" in item &&
        "selectedOption" in item &&
        typeof item.questionId === "string" &&
        typeof item.selectedOption === "number"
    );
  }
  return [];
}
