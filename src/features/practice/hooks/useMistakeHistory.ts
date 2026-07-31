import {
  useEffect,
  useState,
} from "react";

import type {
  MistakeInput,
  MistakeRecord,
  MistakeType,
} from "../../../shared/types/practice";

const STORAGE_KEY =
  "deutschpal-mistakes";

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

function getNonNegativeInteger(
  value: unknown,
  fallback = 0,
) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    return fallback;
  }

  return Math.floor(value);
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

function isMistakeType(
  value: unknown,
): value is MistakeType {
  return (
    value === "meaning" ||
    value === "article" ||
    value === "plural" ||
    value === "perfekt" ||
    value === "praeteritum" ||
    value === "comparative"
  );
}

function createMistakeKey(
  input: Pick<
    MistakeRecord,
    "vocabularyId" | "questionType"
  >,
) {
  return `${input.vocabularyId}:${input.questionType}`;
}

function normalizeMistake(
  value: unknown,
): MistakeRecord | null {
  if (!isRecord(value)) {
    return null;
  }

  if (!isMistakeType(value.questionType)) {
    return null;
  }

  const vocabularyId =
    getString(
      value.vocabularyId,
    ).trim();

  const vocabularyGerman =
    getString(
      value.vocabularyGerman,
    ).trim();

  const correctAnswer =
    getString(
      value.correctAnswer,
    ).trim();

  if (
    !vocabularyId ||
    !vocabularyGerman ||
    !correctAnswer
  ) {
    return null;
  }

  const now =
    new Date().toISOString();

  const createdAt =
    getValidDate(
      value.createdAt,
      now,
    );

  return {
    id:
      getString(
        value.id,
      ).trim() ||
      crypto.randomUUID(),

    vocabularyId,

    vocabularyGerman,

    questionType:
      value.questionType,

    userAnswer: getString(
      value.userAnswer,
    ),

    correctAnswer,

    createdAt,

    updatedAt:
      getValidDate(
        value.updatedAt,
        createdAt,
      ),

    resolved:
      getBoolean(
        value.resolved,
        false,
      ),

    attempts:
      getNonNegativeInteger(
        value.attempts,
        1,
      ),

    repeatedMistakes:
      getNonNegativeInteger(
        value.repeatedMistakes,
        1,
      ),

    correctRetries:
      getNonNegativeInteger(
        value.correctRetries,
        0,
      ),
  };
}

function loadMistakes():
  MistakeRecord[] {
  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY,
      );

    if (!stored) {
      return [];
    }

    const parsed: unknown =
      JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(normalizeMistake)
      .filter(
        (
          mistake,
        ): mistake is MistakeRecord =>
          mistake !== null,
      );
  } catch {
    return [];
  }
}

export function useMistakeHistory() {
  const [
    mistakes,
    setMistakes,
  ] =
    useState<MistakeRecord[]>(
      loadMistakes,
    );

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(mistakes),
    );
  }, [mistakes]);

  function recordMistake(
    input: MistakeInput,
  ) {
    const now =
      new Date().toISOString();

    setMistakes(
      (currentMistakes) => {
        const key =
          createMistakeKey({
            vocabularyId:
              input.vocabularyId,

            questionType:
              input.questionType,
          });

        const existingMistake =
          currentMistakes.find(
            (mistake) =>
              createMistakeKey(
                mistake,
              ) === key,
          );

        if (!existingMistake) {
          const newMistake:
            MistakeRecord = {
            id:
              crypto.randomUUID(),

            vocabularyId:
              input.vocabularyId,

            vocabularyGerman:
              input.vocabularyGerman,

            questionType:
              input.questionType,

            userAnswer:
              input.userAnswer,

            correctAnswer:
              input.correctAnswer,

            createdAt: now,

            updatedAt: now,

            resolved: false,

            attempts: 1,

            repeatedMistakes: 1,

            correctRetries: 0,
          };

          return [
            newMistake,
            ...currentMistakes,
          ];
        }

        return currentMistakes.map(
          (mistake) =>
            mistake.id ===
            existingMistake.id
              ? {
                  ...mistake,

                  vocabularyGerman:
                    input.vocabularyGerman,

                  userAnswer:
                    input.userAnswer,

                  correctAnswer:
                    input.correctAnswer,

                  updatedAt: now,

                  resolved: false,

                  attempts:
                    mistake.attempts +
                    1,

                  repeatedMistakes:
                    mistake.repeatedMistakes +
                    1,
                }
              : mistake,
        );
      },
    );
  }

  function recordCorrectRetry(
    vocabularyId: string,
    questionType: MistakeType,
  ) {
    const now =
      new Date().toISOString();

    setMistakes(
      (currentMistakes) =>
        currentMistakes.map(
          (mistake) => {
            if (
              mistake.vocabularyId !==
                vocabularyId ||
              mistake.questionType !==
                questionType
            ) {
              return mistake;
            }

            const nextCorrectRetries =
              mistake.correctRetries +
              1;

            const resolved =
              nextCorrectRetries >= 2;

            return {
              ...mistake,

              updatedAt: now,

              attempts:
                mistake.attempts + 1,

              correctRetries:
                nextCorrectRetries,

              resolved,
            };
          },
        ),
    );
  }

  function resolveMistake(
    id: string,
  ) {
    setMistakes(
      (currentMistakes) =>
        currentMistakes.map(
          (mistake) =>
            mistake.id === id
              ? {
                  ...mistake,

                  resolved: true,

                  updatedAt:
                    new Date()
                      .toISOString(),
                }
              : mistake,
        ),
    );
  }

  function reopenMistake(
    id: string,
  ) {
    setMistakes(
      (currentMistakes) =>
        currentMistakes.map(
          (mistake) =>
            mistake.id === id
              ? {
                  ...mistake,

                  resolved: false,

                  updatedAt:
                    new Date()
                      .toISOString(),
                }
              : mistake,
        ),
    );
  }

  function deleteMistake(
    id: string,
  ) {
    setMistakes(
      (currentMistakes) =>
        currentMistakes.filter(
          (mistake) =>
            mistake.id !== id,
        ),
    );
  }

  function clearMistakes() {
    setMistakes([]);
  }

  function getOpenMistakes() {
    return mistakes.filter(
      (mistake) =>
        !mistake.resolved,
    );
  }

  function getMistakesForVocabulary(
    vocabularyId: string,
  ) {
    return mistakes.filter(
      (mistake) =>
        mistake.vocabularyId ===
        vocabularyId,
    );
  }

  return {
    mistakes,

    recordMistake,

    recordCorrectRetry,

    resolveMistake,

    reopenMistake,

    deleteMistake,

    clearMistakes,

    getOpenMistakes,

    getMistakesForVocabulary,
  };
}