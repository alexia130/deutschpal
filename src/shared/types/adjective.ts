import type { BaseVocabularyItem } from "./common";
import type { VocabularyMeaning } from "./meaning";

export interface AdjectiveVocabularyItem
  extends BaseVocabularyItem {
  type: "adjective";
  comparative: string;
  superlative: string;
  meanings: VocabularyMeaning[];
}