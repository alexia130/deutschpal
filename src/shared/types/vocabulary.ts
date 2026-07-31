export type {
  KnowledgeSkill,
  KnowledgeSkillState,
  VocabularyKnowledge,
  VocabularyLevel,
  VocabularyReview,
  VocabularyType,
} from "./common";

export {
  createDefaultKnowledgeSkill,
  createDefaultVocabularyKnowledge,
  createDefaultVocabularyReview,
} from "./common";

import type { AdjectiveVocabularyItem } from "./adjective";
import type { ExpressionVocabularyItem } from "./expression";
import type { NounVocabularyItem } from "./noun";
import type { VerbVocabularyItem } from "./verb";

export type VocabularyItem =
  | NounVocabularyItem
  | VerbVocabularyItem
  | AdjectiveVocabularyItem
  | ExpressionVocabularyItem;

type VocabularySystemFields =
  | "id"
  | "createdAt"
  | "updatedAt"
  | "review"
  | "knowledge";

export type VocabularyFormData =
  | Omit<
      NounVocabularyItem,
      VocabularySystemFields
    >
  | Omit<
      VerbVocabularyItem,
      VocabularySystemFields
    >
  | Omit<
      AdjectiveVocabularyItem,
      VocabularySystemFields
    >
  | Omit<
      ExpressionVocabularyItem,
      VocabularySystemFields
    >;

export function isNoun(
  item: VocabularyItem,
): item is NounVocabularyItem {
  return item.type === "noun";
}

export function isVerb(
  item: VocabularyItem,
): item is VerbVocabularyItem {
  return item.type === "verb";
}

export function isAdjective(
  item: VocabularyItem,
): item is AdjectiveVocabularyItem {
  return item.type === "adjective";
}

export function isExpression(
  item: VocabularyItem,
): item is ExpressionVocabularyItem {
  return item.type === "expression";
}