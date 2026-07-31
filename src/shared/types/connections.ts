export type WordConnectionType =
  | "word-family"
  | "synonym"
  | "antonym"
  | "grammar"
  | "collocation"
  | "confusable"
  | "context";

export interface WordConnection {
  id: string;
  sourceVocabularyId: string;
  targetVocabularyId: string | null;
  targetLabel: string;
  type: WordConnectionType;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface WordConnectionInput {
  sourceVocabularyId: string;
  targetVocabularyId?: string | null;
  targetLabel: string;
  type: WordConnectionType;
  note?: string;
}