import type {
  AdaptiveQuestionType,
} from "../../knowledge/lib/adaptivePracticeEngine";

import type {
  VocabularyItem,
} from "../../../shared/types/vocabulary";

export type PracticeQuestionMode =
  | "typing"
  | "multiple-choice"
  | "speaking"
  | "listening";

export interface PracticeQuestion {
  id: string;

  item: VocabularyItem;

  skill: AdaptiveQuestionType;

  mode: PracticeQuestionMode;

  prompt: string;

  correctAnswer: string;

  choices?: string[];
}

export interface PracticeAnswer {
  questionId: string;

  vocabularyId: string;

  skill: AdaptiveQuestionType;

  mode: PracticeQuestionMode;

  userAnswer: string;

  correctAnswer: string;

  correct: boolean;

  responseTime: number;

  answeredAt: string;
}

export interface PracticeSession {
  id: string;

  startedAt: string;

  finishedAt: string | null;

  questions: PracticeQuestion[];

  answers: PracticeAnswer[];
}

export interface PracticeSkillSummary {
  skill: AdaptiveQuestionType;

  totalAnswers: number;

  correctAnswers: number;

  incorrectAnswers: number;

  accuracy: number;

  averageResponseTime: number;
}

export interface PracticeSummary {
  totalQuestions: number;

  answeredQuestions: number;

  correctAnswers: number;

  incorrectAnswers: number;

  unansweredQuestions: number;

  accuracy: number;

  averageResponseTime: number;

  totalResponseTime: number;

  fastestResponseTime: number | null;

  slowestResponseTime: number | null;

  strongestSkill:
    AdaptiveQuestionType | null;

  weakestSkill:
    AdaptiveQuestionType | null;

  skillSummaries:
    PracticeSkillSummary[];
}