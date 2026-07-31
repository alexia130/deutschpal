import {
  createDefaultVocabularyKnowledge,
  createDefaultVocabularyReview,
} from "../../../shared/types/vocabulary";

import {
  createIrregularVerbVocabulary,
} from "../../verbs/lib/createIrregularVerbVocabulary";

import type {
  VocabularyItem,
} from "../../../shared/types/vocabulary";

const irregularVerbVocabulary =
  createIrregularVerbVocabulary(
    "B1",
  );

export const vocabulary: VocabularyItem[] = [
  {
    id: "noun-erfahrung",
    type: "noun",
    german: "Erfahrung",
    article: "die",
    plural: "Erfahrungen",
    level: "B1",
    favorite: true,
    createdAt:
      "2026-07-31T10:00:00.000Z",
    updatedAt:
      "2026-07-31T10:00:00.000Z",

    review:
      createDefaultVocabularyReview(),

    knowledge:
      createDefaultVocabularyKnowledge(),

    meanings: [
      {
        id: "meaning-erfahrung-1",
        translation: "experiență",
        exampleGerman:
          "Ich habe viel Erfahrung in diesem Bereich.",
        exampleRomanian:
          "Am multă experiență în acest domeniu.",
      },
    ],
  },
  {
    id: "verb-bewerben",
    type: "verb",
    german: "sich bewerben",
    auxiliary: "haben",
    praeteritum: "bewarb sich",
    perfekt: "hat sich beworben",
    reflexive: true,
    separable: false,
    level: "B1",
    favorite: true,
    createdAt:
      "2026-07-31T10:05:00.000Z",
    updatedAt:
      "2026-07-31T10:05:00.000Z",

    review:
      createDefaultVocabularyReview(),

    knowledge:
      createDefaultVocabularyKnowledge(),

    meanings: [
      {
        id: "meaning-bewerben-1",
        translation: "a aplica",
        exampleGerman:
          "Ich bewerbe mich um eine neue Stelle.",
        exampleRomanian:
          "Aplic pentru un post nou.",
      },
    ],
  },

  ...irregularVerbVocabulary,
];