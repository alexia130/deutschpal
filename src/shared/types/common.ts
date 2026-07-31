export type VocabularyLevel =
  | "A1"
  | "A2"
  | "B1"
  | "B2"
  | "C1"
  | "C2";

export type VocabularyType =
  | "noun"
  | "verb"
  | "adjective"
  | "expression";

export type KnowledgeSkill =
  | "meaning"
  | "article"
  | "plural"
  | "perfekt"
  | "praeteritum"
  | "comparative"
  | "recognition"
  | "recall"
  | "sentence";

export interface KnowledgeSkillState {
  /**
   * Estimated mastery from 0 to 100.
   */
  score: number;

  /**
   * Number of times this exact skill was tested.
   */
  attempts: number;

  correctAttempts: number;
  wrongAttempts: number;

  /**
   * Last time this skill was tested.
   */
  lastTestedAt: string | null;
}

export interface VocabularyKnowledge {
  meaning: KnowledgeSkillState;
  article: KnowledgeSkillState;
  plural: KnowledgeSkillState;
  perfekt: KnowledgeSkillState;
  praeteritum: KnowledgeSkillState;
  comparative: KnowledgeSkillState;
  recognition: KnowledgeSkillState;
  recall: KnowledgeSkillState;
  sentence: KnowledgeSkillState;
}

export interface VocabularyReview {
  lastReviewed: string | null;
  nextReview: string | null;
  interval: number;
  reviewCount: number;
  correctCount: number;
  wrongCount: number;
  easeFactor: number;
}

export interface BaseVocabularyItem {
  id: string;
  german: string;
  level: VocabularyLevel;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  review: VocabularyReview;
  knowledge: VocabularyKnowledge;
}

export function createDefaultKnowledgeSkill(): KnowledgeSkillState {
  return {
    score: 0,
    attempts: 0,
    correctAttempts: 0,
    wrongAttempts: 0,
    lastTestedAt: null,
  };
}

export function createDefaultVocabularyKnowledge(): VocabularyKnowledge {
  return {
    meaning: createDefaultKnowledgeSkill(),
    article: createDefaultKnowledgeSkill(),
    plural: createDefaultKnowledgeSkill(),
    perfekt: createDefaultKnowledgeSkill(),
    praeteritum: createDefaultKnowledgeSkill(),
    comparative: createDefaultKnowledgeSkill(),
    recognition: createDefaultKnowledgeSkill(),
    recall: createDefaultKnowledgeSkill(),
    sentence: createDefaultKnowledgeSkill(),
  };
}

export function createDefaultVocabularyReview(): VocabularyReview {
  return {
    lastReviewed: null,
    nextReview: null,
    interval: 0,
    reviewCount: 0,
    correctCount: 0,
    wrongCount: 0,
    easeFactor: 2.5,
  };
}