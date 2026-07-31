import {
  useEffect,
  useState,
} from "react";

import type {
  PersonalExample,
  PersonalExampleInput,
  PersonalExampleContext,
} from "../../../shared/types/personalExamples";

const STORAGE_KEY =
  "deutschpal-personal-examples";

type UnknownRecord = Record<
  string,
  unknown
>;

const exampleContexts: PersonalExampleContext[] = [
  "daily-life",
  "university",
  "work",
  "telc",
  "administration",
  "travel",
  "conversation",
  "other",
];

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

function isExampleContext(
  value: unknown,
): value is PersonalExampleContext {
  return (
    typeof value === "string" &&
    exampleContexts.includes(
      value as PersonalExampleContext,
    )
  );
}

function normalizeExample(
  value: unknown,
): PersonalExample | null {
  if (!isRecord(value)) {
    return null;
  }

  const vocabularyId =
    getString(
      value.vocabularyId,
    ).trim();

  const germanSentence =
    getString(
      value.germanSentence,
    ).trim();

  if (
    !vocabularyId ||
    !germanSentence
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

    germanSentence,

    romanianTranslation:
      getString(
        value.romanianTranslation,
      ),

    context:
      isExampleContext(
        value.context,
      )
        ? value.context
        : "other",

    note: getString(
      value.note,
    ),

    createdAt,

    updatedAt:
      getValidDate(
        value.updatedAt,
        createdAt,
      ),
  };
}

function loadExamples():
  PersonalExample[] {
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
      .map(normalizeExample)
      .filter(
        (
          example,
        ): example is PersonalExample =>
          example !== null,
      );
  } catch {
    return [];
  }
}

export function usePersonalExamples() {
  const [
    examples,
    setExamples,
  ] =
    useState<PersonalExample[]>(
      loadExamples,
    );

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(examples),
    );
  }, [examples]);

  function addExample(
    input: PersonalExampleInput,
  ) {
    const germanSentence =
      input.germanSentence.trim();

    if (
      !input.vocabularyId ||
      !germanSentence
    ) {
      return;
    }

    const now =
      new Date().toISOString();

    const newExample:
      PersonalExample = {
      id:
        crypto.randomUUID(),

      vocabularyId:
        input.vocabularyId,

      germanSentence,

      romanianTranslation:
        input.romanianTranslation
          ?.trim() ?? "",

      context: input.context,

      note:
        input.note?.trim() ?? "",

      createdAt: now,

      updatedAt: now,
    };

    setExamples(
      (currentExamples) => [
        newExample,
        ...currentExamples,
      ],
    );
  }

  function updateExample(
    id: string,
    input: PersonalExampleInput,
  ) {
    const germanSentence =
      input.germanSentence.trim();

    if (!germanSentence) {
      return;
    }

    setExamples(
      (currentExamples) =>
        currentExamples.map(
          (example) =>
            example.id === id
              ? {
                  ...example,

                  vocabularyId:
                    input.vocabularyId,

                  germanSentence,

                  romanianTranslation:
                    input.romanianTranslation
                      ?.trim() ?? "",

                  context:
                    input.context,

                  note:
                    input.note?.trim() ??
                    "",

                  updatedAt:
                    new Date()
                      .toISOString(),
                }
              : example,
        ),
    );
  }

  function deleteExample(
    id: string,
  ) {
    setExamples(
      (currentExamples) =>
        currentExamples.filter(
          (example) =>
            example.id !== id,
        ),
    );
  }

  function getExamplesForVocabulary(
    vocabularyId: string,
  ) {
    return examples.filter(
      (example) =>
        example.vocabularyId ===
        vocabularyId,
    );
  }

  function deleteExamplesForVocabulary(
    vocabularyId: string,
  ) {
    setExamples(
      (currentExamples) =>
        currentExamples.filter(
          (example) =>
            example.vocabularyId !==
            vocabularyId,
        ),
    );
  }

  return {
    examples,

    addExample,

    updateExample,

    deleteExample,

    getExamplesForVocabulary,

    deleteExamplesForVocabulary,
  };
}