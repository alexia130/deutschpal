import {
  createDefaultVocabularyKnowledge,
  createDefaultVocabularyReview,
} from "../../../shared/types/vocabulary";

import type {
  VocabularyItem,
  VocabularyLevel,
} from "../../../shared/types/vocabulary";

import {
  irregularVerbs,
} from "../data/irregularVerbs";

function getPerfektForm(
  auxiliary:
    | "haben"
    | "sein"
    | "both",
  partizipII: string,
) {
  if (auxiliary === "sein") {
    return `ist ${partizipII}`;
  }

  if (auxiliary === "both") {
    return `ist/hat ${partizipII}`;
  }

  return `hat ${partizipII}`;
}

export function createIrregularVerbVocabulary(
  level: VocabularyLevel,
): VocabularyItem[] {
  const now =
    new Date().toISOString();

  return irregularVerbs.map(
    (verb) => ({
      id: verb.id,
      type: "verb",
      german:
        verb.infinitive,
      auxiliary:
        verb.auxiliary,
      praeteritum:
        verb.praeteritum,
      perfekt:
        getPerfektForm(
          verb.auxiliary,
          verb.partizipII,
        ),
      reflexive: false,
      separable: false,
      level,
      favorite: false,
      createdAt: now,
      updatedAt: now,
      review:
        createDefaultVocabularyReview(),
      knowledge:
        createDefaultVocabularyKnowledge(),
      meanings: [
        {
          id: `${verb.id}-meaning-1`,
          translation:
            verb.translation,
          exampleGerman: "",
          exampleRomanian: "",
        },
      ],
    }) as VocabularyItem,
  );
}