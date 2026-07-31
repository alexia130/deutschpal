import type { BaseVocabularyItem } from "./common";
import type { VocabularyMeaning } from "./meaning";

export interface ExpressionVocabularyItem
  extends BaseVocabularyItem {
  type: "expression";
  meanings: VocabularyMeaning[];
}