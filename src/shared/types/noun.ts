import type { BaseVocabularyItem } from "./common";
import type { VocabularyMeaning } from "./meaning";

export type NounArticle = "der" | "die" | "das";

export interface NounVocabularyItem extends BaseVocabularyItem {
  type: "noun";
  article: NounArticle;
  plural: string;
  meanings: VocabularyMeaning[];
}