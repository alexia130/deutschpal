import {
  useEffect,
  useState,
} from "react";

import {
  updateKnowledge,
} from "../../knowledge/lib/knowledgeEngine";
import {
  useLearningTimeline,
} from "../../timeline/hooks/useLearningTimeline";
import {
  createFavoriteAddedEvent,
  createFavoriteRemovedEvent,
  createWordAddedEvent,
  createWordDeletedEvent,
  createWordUpdatedEvent,
} from "../../timeline/lib/timelineEvents";
import {
  vocabulary as initialVocabulary,
} from "../data/vocabulary";

import {
  createDefaultVocabularyKnowledge,
  createDefaultVocabularyReview,
} from "../../../shared/types/vocabulary";

import type {
  KnowledgeSkill,
  KnowledgeSkillState,
  VocabularyFormData,
  VocabularyItem,
  VocabularyKnowledge,
  VocabularyLevel,
  VocabularyReview,
} from "../../../shared/types/vocabulary";

const STORAGE_KEY =
  "deutschpal-vocabulary";

const vocabularyTypes = [
  "noun",
  "verb",
  "adjective",
  "expression",
] as const;

const vocabularyLevels = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
] as const;

const REVIEW_INTERVALS = [
  1,
  3,
  7,
  14,
  30,
  60,
  120,
] as const;

type VocabularyType =
  (typeof vocabularyTypes)[number];

type ReviewResult =
  | "correct"
  | "incorrect";

type UnknownRecord = Record<
  string,
  unknown
>;

function isRecord(
  value: unknown,
): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isVocabularyType(
  value: unknown,
): value is VocabularyType {
  return (
    typeof value === "string" &&
    vocabularyTypes.includes(
      value as VocabularyType,
    )
  );
}

function isVocabularyLevel(
  value: unknown,
): value is VocabularyLevel {
  return (
    typeof value === "string" &&
    vocabularyLevels.includes(
      value as VocabularyLevel,
    )
  );
}

function getString(
  value: unknown,
  fallback = "",
) {
  return typeof value === "string"
    ? value
    : fallback;
}

function getBoolean(
  value: unknown,
  fallback = false,
) {
  return typeof value === "boolean"
    ? value
    : fallback;
}

function getNumber(
  value: unknown,
  fallback = 0,
) {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  )
    ? value
    : fallback;
}

function getNonNegativeInteger(
  value: unknown,
  fallback = 0,
) {
  const number = getNumber(
    value,
    fallback,
  );

  if (number < 0) {
    return fallback;
  }

  return Math.floor(number);
}

function getPositiveNumber(
  value: unknown,
  fallback: number,
) {
  const number = getNumber(
    value,
    fallback,
  );

  return number > 0
    ? number
    : fallback;
}

function getScore(
  value: unknown,
  fallback = 0,
) {
  const score =
    getNonNegativeInteger(
      value,
      fallback,
    );

  return Math.min(
    100,
    Math.max(0, score),
  );
}

function getNullableValidDate(
  value: unknown,
): string | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(
    date.getTime(),
  )
    ? null
    : value;
}

function getValidDate(
  value: unknown,
  fallback: string,
) {
  if (typeof value !== "string") {
    return fallback;
  }

  const date = new Date(value);

  return Number.isNaN(
    date.getTime(),
  )
    ? fallback
    : value;
}

function addDays(
  date: Date,
  days: number,
) {
  const result = new Date(date);

  result.setDate(
    result.getDate() + days,
  );

  return result;
}

function normalizeMeanings(
  value: unknown,
) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((meaning) => ({
      id:
        getString(
          meaning.id,
        ).trim() ||
        crypto.randomUUID(),

      translation: getString(
        meaning.translation,
      ),

      exampleGerman: getString(
        meaning.exampleGerman,
      ),

      exampleRomanian: getString(
        meaning.exampleRomanian,
      ),
    }));
}

function normalizeReview(
  value: unknown,
): VocabularyReview {
  const defaultReview =
    createDefaultVocabularyReview();

  if (!isRecord(value)) {
    return defaultReview;
  }

  return {
    lastReviewed:
      getNullableValidDate(
        value.lastReviewed,
      ),

    nextReview:
      getNullableValidDate(
        value.nextReview,
      ),

    interval:
      getNonNegativeInteger(
        value.interval,
        defaultReview.interval,
      ),

    reviewCount:
      getNonNegativeInteger(
        value.reviewCount,
        defaultReview.reviewCount,
      ),

    correctCount:
      getNonNegativeInteger(
        value.correctCount,
        defaultReview.correctCount,
      ),

    wrongCount:
      getNonNegativeInteger(
        value.wrongCount,
        defaultReview.wrongCount,
      ),

    easeFactor:
      getPositiveNumber(
        value.easeFactor,
        defaultReview.easeFactor,
      ),
  };
}

function normalizeKnowledgeSkill(
  value: unknown,
): KnowledgeSkillState {
  if (!isRecord(value)) {
    return {
      score: 0,
      attempts: 0,
      correctAttempts: 0,
      wrongAttempts: 0,
      lastTestedAt: null,
    };
  }

  const attempts =
    getNonNegativeInteger(
      value.attempts,
      0,
    );

  const correctAttempts =
    getNonNegativeInteger(
      value.correctAttempts,
      0,
    );

  const wrongAttempts =
    getNonNegativeInteger(
      value.wrongAttempts,
      0,
    );

  return {
    score: getScore(
      value.score,
      0,
    ),

    attempts: Math.max(
      attempts,
      correctAttempts +
        wrongAttempts,
    ),

    correctAttempts,

    wrongAttempts,

    lastTestedAt:
      getNullableValidDate(
        value.lastTestedAt,
      ),
  };
}

function normalizeKnowledge(
  value: unknown,
): VocabularyKnowledge {
  const defaultKnowledge =
    createDefaultVocabularyKnowledge();

  if (!isRecord(value)) {
    return defaultKnowledge;
  }

  return {
    meaning:
      normalizeKnowledgeSkill(
        value.meaning,
      ),

    article:
      normalizeKnowledgeSkill(
        value.article,
      ),

    plural:
      normalizeKnowledgeSkill(
        value.plural,
      ),

    perfekt:
      normalizeKnowledgeSkill(
        value.perfekt,
      ),

    praeteritum:
      normalizeKnowledgeSkill(
        value.praeteritum,
      ),

    comparative:
      normalizeKnowledgeSkill(
        value.comparative,
      ),

    recognition:
      normalizeKnowledgeSkill(
        value.recognition,
      ),

    recall:
      normalizeKnowledgeSkill(
        value.recall,
      ),

    sentence:
      normalizeKnowledgeSkill(
        value.sentence,
      ),
  };
}

function normalizeVocabularyItem(
  value: unknown,
): VocabularyItem | null {
  if (!isRecord(value)) {
    return null;
  }

  if (!isVocabularyType(value.type)) {
    return null;
  }

  const german = getString(
    value.german,
  ).trim();

  if (!german) {
    return null;
  }

  const now =
    new Date().toISOString();

  const createdAt =
    getValidDate(
      value.createdAt,
      now,
    );

  const updatedAt =
    getValidDate(
      value.updatedAt,
      createdAt,
    );

  const level =
    isVocabularyLevel(value.level)
      ? value.level
      : "A1";

  const normalizedItem = {
    ...value,

    id:
      getString(
        value.id,
      ).trim() ||
      crypto.randomUUID(),

    type: value.type,

    german,

    level,

    favorite: getBoolean(
      value.favorite,
      false,
    ),

    meanings: normalizeMeanings(
      value.meanings,
    ),

    createdAt,

    updatedAt,

    review: normalizeReview(
      value.review,
    ),

    knowledge:
      normalizeKnowledge(
        value.knowledge,
      ),
  };

  if (value.type === "noun") {
    return {
      ...normalizedItem,

      article: getString(
        value.article,
      ),

      plural: getString(
        value.plural,
      ),
    } as VocabularyItem;
  }

  if (value.type === "verb") {
    return {
      ...normalizedItem,

      auxiliary: getString(
        value.auxiliary,
      ),

      praeteritum: getString(
        value.praeteritum,
      ),

      perfekt: getString(
        value.perfekt,
      ),

      reflexive: getBoolean(
        value.reflexive,
        false,
      ),

      separable: getBoolean(
        value.separable,
        false,
      ),
    } as VocabularyItem;
  }

  if (value.type === "adjective") {
    return {
      ...normalizedItem,

      comparative: getString(
        value.comparative,
      ),

      superlative: getString(
        value.superlative,
      ),
    } as VocabularyItem;
  }

  return normalizedItem as VocabularyItem;
}

function normalizeVocabulary(
  value: unknown,
): VocabularyItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(normalizeVocabularyItem)
    .filter(
      (
        item,
      ): item is VocabularyItem =>
        item !== null,
    );
}

function getInitialVocabulary() {
  return normalizeVocabulary(
    initialVocabulary,
  );
}

function loadVocabulary():
  VocabularyItem[] {
  try {
    const storedVocabulary =
      localStorage.getItem(
        STORAGE_KEY,
      );

    if (!storedVocabulary) {
      return getInitialVocabulary();
    }

    const parsed: unknown =
      JSON.parse(
        storedVocabulary,
      );

    if (
      Array.isArray(parsed) &&
      parsed.length === 0
    ) {
      return [];
    }

    const normalizedVocabulary =
      normalizeVocabulary(parsed);

    if (
      normalizedVocabulary.length ===
      0
    ) {
      return getInitialVocabulary();
    }

    return normalizedVocabulary;
  } catch {
    return getInitialVocabulary();
  }
}

function createVocabularyKey(
  item: Pick<
    VocabularyItem,
    "type" | "german"
  >,
) {
  return `${item.type}:${item.german}`
    .trim()
    .toLocaleLowerCase("de-DE");
}

function getNextCorrectInterval(
  review: VocabularyReview,
) {
  if (review.reviewCount === 0) {
    return REVIEW_INTERVALS[0];
  }

  const currentIndex =
    REVIEW_INTERVALS.findIndex(
      (interval) =>
        interval >=
        review.interval,
    );

  if (currentIndex === -1) {
    return Math.max(
      1,
      Math.round(
        review.interval *
          review.easeFactor,
      ),
    );
  }

  const lastInterval =
    REVIEW_INTERVALS[
      REVIEW_INTERVALS.length - 1
    ];

  if (
    currentIndex ===
      REVIEW_INTERVALS.length - 1 &&
    review.interval >=
      lastInterval
  ) {
    return Math.max(
      1,
      Math.round(
        review.interval *
          review.easeFactor,
      ),
    );
  }

  const nextIndex =
    Math.min(
      currentIndex + 1,
      REVIEW_INTERVALS.length - 1,
    );

  return REVIEW_INTERVALS[
    nextIndex
  ];
}

function calculateUpdatedReview(
  review: VocabularyReview,
  result: ReviewResult,
  reviewedAt: Date,
): VocabularyReview {
  const wasCorrect =
    result === "correct";

  const interval = wasCorrect
    ? getNextCorrectInterval(
        review,
      )
    : 1;

  const easeFactor = wasCorrect
    ? Math.min(
        3,
        review.easeFactor +
          0.05,
      )
    : Math.max(
        1.3,
        review.easeFactor -
          0.2,
      );

  return {
    lastReviewed:
      reviewedAt.toISOString(),

    nextReview:
      addDays(
        reviewedAt,
        interval,
      ).toISOString(),

    interval,

    reviewCount:
      review.reviewCount + 1,

    correctCount:
      review.correctCount +
      (wasCorrect ? 1 : 0),

    wrongCount:
      review.wrongCount +
      (wasCorrect ? 0 : 1),

    easeFactor,
  };
}

export function useVocabulary() {
  const [items, setItems] =
    useState<VocabularyItem[]>(
      loadVocabulary,
    );

  const {
    addEvent,
    clearVocabularyTimeline,
  } = useLearningTimeline();

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items),
    );
  }, [items]);

  function addItem(
    data: VocabularyFormData,
  ) {
    const now =
      new Date().toISOString();

    const normalizedItem =
      normalizeVocabularyItem({
        ...data,

        id: crypto.randomUUID(),

        createdAt: now,

        updatedAt: now,

        review:
          createDefaultVocabularyReview(),

        knowledge:
          createDefaultVocabularyKnowledge(),
      });

    if (!normalizedItem) {
      return;
    }

    setItems(
      (currentItems) => [
        normalizedItem,
        ...currentItems,
      ],
    );

    addEvent(
      createWordAddedEvent(
        normalizedItem,
      ),
    );
  }

  function updateItem(
    id: string,
    data: VocabularyFormData,
  ) {
    const currentItem =
      items.find(
        (item) =>
          item.id === id,
      );

    if (!currentItem) {
      return;
    }

    const normalizedItem =
      normalizeVocabularyItem({
        ...data,

        id: currentItem.id,

        createdAt:
          currentItem.createdAt,

        updatedAt:
          new Date().toISOString(),

        review:
          currentItem.review,

        knowledge:
          currentItem.knowledge,
      });

    if (!normalizedItem) {
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? normalizedItem
          : item,
      ),
    );

    addEvent(
      createWordUpdatedEvent(
        normalizedItem,
      ),
    );
  }

  function deleteItem(
    id: string,
  ) {
    const deletedItem =
      items.find(
        (item) =>
          item.id === id,
      );

    if (!deletedItem) {
      return;
    }

    setItems((currentItems) =>
      currentItems.filter(
        (item) =>
          item.id !== id,
      ),
    );

    clearVocabularyTimeline(id);

    addEvent(
      createWordDeletedEvent(
        deletedItem,
      ),
    );
  }

  function toggleFavorite(
    id: string,
  ) {
    const currentItem =
      items.find(
        (item) =>
          item.id === id,
      );

    if (!currentItem) {
      return;
    }

    const updatedItem:
      VocabularyItem = {
      ...currentItem,

      favorite:
        !currentItem.favorite,

      updatedAt:
        new Date().toISOString(),
    };

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? updatedItem
          : item,
      ),
    );

    addEvent(
      updatedItem.favorite
        ? createFavoriteAddedEvent(
            updatedItem,
          )
        : createFavoriteRemovedEvent(
            updatedItem,
          ),
    );
  }

  function recordReview(
    id: string,
    result: ReviewResult,
  ) {
    const reviewedAt =
      new Date();

    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== id) {
          return item;
        }

        return {
          ...item,

          review:
            calculateUpdatedReview(
              item.review,
              result,
              reviewedAt,
            ),

          updatedAt:
            reviewedAt.toISOString(),
        };
      }),
    );
  }

  function recordPracticeResult(
    id: string,
    skill: KnowledgeSkill,
    correct: boolean,
  ) {
    const testedAt =
      new Date();

    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== id) {
          return item;
        }

        return {
          ...item,

          review:
            calculateUpdatedReview(
              item.review,
              correct
                ? "correct"
                : "incorrect",
              testedAt,
            ),

          knowledge:
            updateKnowledge(
              item.knowledge,
              skill,
              correct,
              testedAt,
            ),

          updatedAt:
            testedAt.toISOString(),
        };
      }),
    );
  }

  function resetReview(
    id: string,
  ) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,

              review:
                createDefaultVocabularyReview(),

              updatedAt:
                new Date()
                  .toISOString(),
            }
          : item,
      ),
    );
  }

  function resetKnowledge(
    id: string,
  ) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,

              knowledge:
                createDefaultVocabularyKnowledge(),

              updatedAt:
                new Date()
                  .toISOString(),
            }
          : item,
      ),
    );
  }

  function resetLearningData(
    id: string,
  ) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,

              review:
                createDefaultVocabularyReview(),

              knowledge:
                createDefaultVocabularyKnowledge(),

              updatedAt:
                new Date()
                  .toISOString(),
            }
          : item,
      ),
    );
  }

  function getDueItems(
    referenceDate = new Date(),
  ) {
    const referenceTime =
      referenceDate.getTime();

    return items.filter((item) => {
      if (
        item.review.nextReview ===
        null
      ) {
        return true;
      }

      const nextReviewTime =
        new Date(
          item.review.nextReview,
        ).getTime();

      if (
        Number.isNaN(
          nextReviewTime,
        )
      ) {
        return true;
      }

      return (
        nextReviewTime <=
        referenceTime
      );
    });
  }

  function importItems(
    importedItems:
      VocabularyItem[],
  ) {
    const normalizedImportedItems =
      normalizeVocabulary(
        importedItems,
      );

    setItems((currentItems) => {
      const knownWords =
        new Set(
          currentItems.map(
            createVocabularyKey,
          ),
        );

      const uniqueImportedItems:
        VocabularyItem[] = [];

      normalizedImportedItems.forEach(
        (item) => {
          const key =
            createVocabularyKey(
              item,
            );

          if (
            knownWords.has(key)
          ) {
            return;
          }

          knownWords.add(key);

          uniqueImportedItems.push(
            item,
          );
        },
      );

      return [
        ...uniqueImportedItems,
        ...currentItems,
      ];
    });
  }

  function replaceItems(
    newItems:
      VocabularyItem[],
  ) {
    const normalizedItems =
      normalizeVocabulary(
        newItems,
      );

    setItems(
      normalizedItems,
    );
  }

  return {
    items,

    addItem,

    updateItem,

    deleteItem,

    toggleFavorite,

    recordReview,

    recordPracticeResult,

    resetReview,

    resetKnowledge,

    resetLearningData,

    getDueItems,

    importItems,

    replaceItems,
  };
}