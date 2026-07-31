export type PersonalExampleContext =
  | "daily-life"
  | "university"
  | "work"
  | "telc"
  | "administration"
  | "travel"
  | "conversation"
  | "other";

export interface PersonalExample {
  id: string;
  vocabularyId: string;
  germanSentence: string;
  romanianTranslation: string;
  context: PersonalExampleContext;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalExampleInput {
  vocabularyId: string;
  germanSentence: string;
  romanianTranslation?: string;
  context: PersonalExampleContext;
  note?: string;
}