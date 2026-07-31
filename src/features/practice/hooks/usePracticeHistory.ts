import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type { PracticeSession } from "../../../shared/types/practice";

const STORAGE_KEY =
  "deutschpal-practice-history";

function isPracticeSession(
  value: unknown,
): value is PracticeSession {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const session = value as Record<
    string,
    unknown
  >;

  return (
    typeof session.id === "string" &&
    typeof session.completedAt ===
      "string" &&
    typeof session.practiceType ===
      "string" &&
    typeof session.level === "string" &&
    typeof session.favoritesOnly ===
      "boolean" &&
    typeof session.totalQuestions ===
      "number" &&
    typeof session.correctAnswers ===
      "number" &&
    typeof session.incorrectAnswers ===
      "number" &&
    typeof session.scorePercentage ===
      "number"
  );
}

function loadPracticeHistory(): PracticeSession[] {
  try {
    const storedHistory =
      localStorage.getItem(STORAGE_KEY);

    if (!storedHistory) {
      return [];
    }

    const parsed: unknown =
      JSON.parse(storedHistory);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      isPracticeSession,
    );
  } catch {
    return [];
  }
}

export function usePracticeHistory() {
  const [sessions, setSessions] =
    useState<PracticeSession[]>(
      loadPracticeHistory,
    );

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(sessions),
    );
  }, [sessions]);

  const addSession = useCallback(
    (
      session: Omit<
        PracticeSession,
        "id"
      >,
    ) => {
      const newSession: PracticeSession = {
        ...session,
        id: crypto.randomUUID(),
      };

      setSessions((currentSessions) => [
        newSession,
        ...currentSessions,
      ]);
    },
    [],
  );

  const deleteSession = useCallback(
    (id: string) => {
      setSessions((currentSessions) =>
        currentSessions.filter(
          (session) =>
            session.id !== id,
        ),
      );
    },
    [],
  );

  const clearHistory =
    useCallback(() => {
      setSessions([]);
    }, []);

  return {
    sessions,
    addSession,
    deleteSession,
    clearHistory,
  };
}