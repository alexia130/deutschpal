import type {
  VocabularyItem,
} from "../../../shared/types/vocabulary";

export type VerbPracticeMode =
  | "praeteritum"
  | "perfekt"
  | "partizip"
  | "auxiliary"
  | "translation"
  | "infinitive"
  | "mixed";

export interface VerbPracticeQuestion {
  id: string;
  item: VocabularyItem;
  mode: Exclude<
    VerbPracticeMode,
    "mixed"
  >;
  prompt: string;
  correctAnswer: string;
  options?: string[];
}

export interface VerbPracticeResult {
  question: VerbPracticeQuestion;
  userAnswer: string;
  correct: boolean;
}

export interface VerbPracticeSummary {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  scorePercentage: number;
}