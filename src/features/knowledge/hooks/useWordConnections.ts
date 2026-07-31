import {
  useEffect,
  useState,
} from "react";

import type {
  WordConnection,
  WordConnectionInput,
  WordConnectionType,
} from "../../../shared/types/connections";

const STORAGE_KEY =
  "deutschpal-word-connections";

type UnknownRecord = Record<
  string,
  unknown
>;

const connectionTypes: WordConnectionType[] = [
  "word-family",
  "synonym",
  "antonym",
  "grammar",
  "collocation",
  "confusable",
  "context",
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

function getNullableString(
  value: unknown,
) {
  return typeof value === "string"
    ? value
    : null;
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

function isConnectionType(
  value: unknown,
): value is WordConnectionType {
  return (
    typeof value === "string" &&
    connectionTypes.includes(
      value as WordConnectionType,
    )
  );
}

function normalizeConnection(
  value: unknown,
): WordConnection | null {
  if (!isRecord(value)) {
    return null;
  }

  const sourceVocabularyId =
    getString(
      value.sourceVocabularyId,
    ).trim();

  const targetLabel =
    getString(
      value.targetLabel,
    ).trim();

  if (
    !sourceVocabularyId ||
    !targetLabel ||
    !isConnectionType(value.type)
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

    sourceVocabularyId,

    targetVocabularyId:
      getNullableString(
        value.targetVocabularyId,
      ),

    targetLabel,

    type: value.type,

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

function loadConnections():
  WordConnection[] {
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
      .map(normalizeConnection)
      .filter(
        (
          connection,
        ): connection is WordConnection =>
          connection !== null,
      );
  } catch {
    return [];
  }
}

function createConnectionKey(
  connection: Pick<
    WordConnection,
    | "sourceVocabularyId"
    | "targetVocabularyId"
    | "targetLabel"
    | "type"
  >,
) {
  return [
    connection.sourceVocabularyId,
    connection.targetVocabularyId ??
      connection.targetLabel
        .trim()
        .toLocaleLowerCase("de-DE"),
    connection.type,
  ].join(":");
}

export function useWordConnections() {
  const [
    connections,
    setConnections,
  ] =
    useState<WordConnection[]>(
      loadConnections,
    );

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(connections),
    );
  }, [connections]);

  function addConnection(
    input: WordConnectionInput,
  ) {
    const targetLabel =
      input.targetLabel.trim();

    if (
      !input.sourceVocabularyId ||
      !targetLabel
    ) {
      return;
    }

    const now =
      new Date().toISOString();

    const newConnection:
      WordConnection = {
      id:
        crypto.randomUUID(),

      sourceVocabularyId:
        input.sourceVocabularyId,

      targetVocabularyId:
        input.targetVocabularyId ??
        null,

      targetLabel,

      type: input.type,

      note:
        input.note?.trim() ?? "",

      createdAt: now,

      updatedAt: now,
    };

    setConnections(
      (currentConnections) => {
        const existingKeys =
          new Set(
            currentConnections.map(
              createConnectionKey,
            ),
          );

        const newKey =
          createConnectionKey(
            newConnection,
          );

        if (
          existingKeys.has(newKey)
        ) {
          return currentConnections;
        }

        return [
          newConnection,
          ...currentConnections,
        ];
      },
    );
  }

  function updateConnection(
    id: string,
    input: WordConnectionInput,
  ) {
    setConnections(
      (currentConnections) =>
        currentConnections.map(
          (connection) =>
            connection.id === id
              ? {
                  ...connection,

                  sourceVocabularyId:
                    input.sourceVocabularyId,

                  targetVocabularyId:
                    input.targetVocabularyId ??
                    null,

                  targetLabel:
                    input.targetLabel.trim(),

                  type: input.type,

                  note:
                    input.note?.trim() ??
                    "",

                  updatedAt:
                    new Date()
                      .toISOString(),
                }
              : connection,
        ),
    );
  }

  function deleteConnection(
    id: string,
  ) {
    setConnections(
      (currentConnections) =>
        currentConnections.filter(
          (connection) =>
            connection.id !== id,
        ),
    );
  }

  function getConnectionsForVocabulary(
    vocabularyId: string,
  ) {
    return connections.filter(
      (connection) =>
        connection.sourceVocabularyId ===
          vocabularyId ||
        connection.targetVocabularyId ===
          vocabularyId,
    );
  }

  function deleteConnectionsForVocabulary(
    vocabularyId: string,
  ) {
    setConnections(
      (currentConnections) =>
        currentConnections.filter(
          (connection) =>
            connection.sourceVocabularyId !==
              vocabularyId &&
            connection.targetVocabularyId !==
              vocabularyId,
        ),
    );
  }

  return {
    connections,

    addConnection,

    updateConnection,

    deleteConnection,

    getConnectionsForVocabulary,

    deleteConnectionsForVocabulary,
  };
}