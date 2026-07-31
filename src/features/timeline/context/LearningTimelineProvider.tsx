import {
  createContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  LearningTimelineEvent,
  TimelineEventType,
} from "../../../shared/types/learningTimeline";

const STORAGE_KEY =
  "deutschpal-learning-timeline";

type TimelineMetadata = Record<
  string,
  string | number | boolean
>;

type UnknownRecord = Record<
  string,
  unknown
>;

export interface AddTimelineEvent {
  vocabularyId: string;
  type: TimelineEventType;
  title: string;
  description: string;
  metadata?: TimelineMetadata;
  icon?: string;
}

export interface LearningTimelineContextValue {
  events: LearningTimelineEvent[];

  addEvent: (
    input: AddTimelineEvent,
  ) => void;

  deleteEvent: (
    id: string,
  ) => void;

  clearTimeline: () => void;

  clearVocabularyTimeline: (
    vocabularyId: string,
  ) => void;

  getEventsForVocabulary: (
    vocabularyId: string,
  ) => LearningTimelineEvent[];

  getLatestEvent: (
    vocabularyId: string,
  ) => LearningTimelineEvent | null;
}

interface LearningTimelineProviderProps {
  children: React.ReactNode;
}

export const LearningTimelineContext =
  createContext<
    LearningTimelineContextValue | undefined
  >(undefined);

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

function isTimelineEventType(
  value: unknown,
): value is TimelineEventType {
  return (
    value === "word-added" ||
    value === "word-updated" ||
    value === "word-deleted" ||
    value === "practice" ||
    value === "review" ||
    value === "mistake" ||
    value === "correct" ||
    value === "mastered" ||
    value === "forgotten" ||
    value === "favorite-added" ||
    value === "favorite-removed" ||
    value ===
      "personal-example-added" ||
    value ===
      "personal-example-updated" ||
    value ===
      "personal-example-deleted" ||
    value === "connection-added" ||
    value === "connection-deleted"
  );
}

function normalizeMetadata(
  value: unknown,
): TimelineMetadata | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const metadata: TimelineMetadata =
    {};

  Object.entries(value).forEach(
    ([key, entry]) => {
      if (
        typeof entry ===
          "string" ||
        typeof entry ===
          "number" ||
        typeof entry ===
          "boolean"
      ) {
        metadata[key] = entry;
      }
    },
  );

  return Object.keys(metadata)
    .length > 0
    ? metadata
    : undefined;
}

function normalizeTimelineEvent(
  value: unknown,
): LearningTimelineEvent | null {
  if (!isRecord(value)) {
    return null;
  }

  const vocabularyId =
    getString(
      value.vocabularyId,
    ).trim();

  const title =
    getString(
      value.title,
    ).trim();

  const description =
    getString(
      value.description,
    ).trim();

  if (
    !vocabularyId ||
    !title ||
    !description ||
    !isTimelineEventType(
      value.type,
    )
  ) {
    return null;
  }

  const now =
    new Date().toISOString();

  return {
    id:
      getString(
        value.id,
      ).trim() ||
      crypto.randomUUID(),

    vocabularyId,

    type: value.type,

    title,

    description,

    metadata:
      normalizeMetadata(
        value.metadata,
      ),

    icon:
      getString(
        value.icon,
      ),

    createdAt:
      getValidDate(
        value.createdAt,
        now,
      ),
  };
}

function loadTimeline():
  LearningTimelineEvent[] {
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
      .map(
        normalizeTimelineEvent,
      )
      .filter(
        (
          event,
        ): event is LearningTimelineEvent =>
          event !== null,
      );
  } catch {
    return [];
  }
}

function sortEventsNewestFirst(
  events: LearningTimelineEvent[],
) {
  return [...events].sort(
    (
      firstEvent,
      secondEvent,
    ) =>
      new Date(
        secondEvent.createdAt,
      ).getTime() -
      new Date(
        firstEvent.createdAt,
      ).getTime(),
  );
}

export function LearningTimelineProvider({
  children,
}: LearningTimelineProviderProps) {
  const [
    events,
    setEvents,
  ] =
    useState<
      LearningTimelineEvent[]
    >(loadTimeline);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(events),
    );
  }, [events]);

  function addEvent(
    input: AddTimelineEvent,
  ) {
    const vocabularyId =
      input.vocabularyId.trim();

    const title =
      input.title.trim();

    const description =
      input.description.trim();

    if (
      !vocabularyId ||
      !title ||
      !description
    ) {
      return;
    }

    const newEvent:
      LearningTimelineEvent = {
      id:
        crypto.randomUUID(),

      vocabularyId,

      type: input.type,

      title,

      description,

      metadata:
        input.metadata,

      icon:
        input.icon ?? "",

      createdAt:
        new Date().toISOString(),
    };

    setEvents(
      (currentEvents) => [
        newEvent,
        ...currentEvents,
      ],
    );
  }

  function deleteEvent(
    id: string,
  ) {
    setEvents(
      (currentEvents) =>
        currentEvents.filter(
          (event) =>
            event.id !== id,
        ),
    );
  }

  function clearTimeline() {
    setEvents([]);
  }

  function clearVocabularyTimeline(
    vocabularyId: string,
  ) {
    setEvents(
      (currentEvents) =>
        currentEvents.filter(
          (event) =>
            event.vocabularyId !==
            vocabularyId,
        ),
    );
  }

  function getEventsForVocabulary(
    vocabularyId: string,
  ) {
    return sortEventsNewestFirst(
      events.filter(
        (event) =>
          event.vocabularyId ===
          vocabularyId,
      ),
    );
  }

  function getLatestEvent(
    vocabularyId: string,
  ) {
    return (
      getEventsForVocabulary(
        vocabularyId,
      )[0] ?? null
    );
  }

  const contextValue =
    useMemo<
      LearningTimelineContextValue
    >(
      () => ({
        events,

        addEvent,

        deleteEvent,

        clearTimeline,

        clearVocabularyTimeline,

        getEventsForVocabulary,

        getLatestEvent,
      }),
      [events],
    );

  return (
    <LearningTimelineContext.Provider
      value={contextValue}
    >
      {children}
    </LearningTimelineContext.Provider>
  );
}