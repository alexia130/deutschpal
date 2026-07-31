export type SavedPracticeType =
  | "meaning"
  | "article"
  | "plural"
  | "perfekt"
  | "praeteritum"
  | "comparative"
  | "sentence"
  | "mixed";

export type MistakeType =
  | "meaning"
  | "article"
  | "plural"
  | "perfekt"
  | "praeteritum"
  | "comparative"
  | "sentence";

export interface PracticeSession {
  id: string;
  completedAt: string;
  practiceType: SavedPracticeType;
  level: string;
  favoritesOnly: boolean;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  scorePercentage: number;
}

export interface MistakeRecord {
  id: string;
  vocabularyId: string;
  vocabularyGerman: string;
  questionType: MistakeType;
  userAnswer: string;
  correctAnswer: string;
  createdAt: string;
  updatedAt: string;
  resolved: boolean;
  attempts: number;
  repeatedMistakes: number;
  correctRetries: number;
}

export interface MistakeInput {
  vocabularyId: string;
  vocabularyGerman: string;
  questionType: MistakeType;
  userAnswer: string;
  correctAnswer: string;
}