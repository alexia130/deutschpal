import type { BaseVocabularyItem } from "./common";
import type { VocabularyMeaning } from "./meaning";

export type VerbAuxiliary = "haben" | "sein";

export interface VerbVocabularyItem extends BaseVocabularyItem {
  type: "verb";
  auxiliary: VerbAuxiliary;
  praeteritum: string;
  perfekt: string;
  reflexive: boolean;
  separable: boolean;
  meanings: VocabularyMeaning[];
}