
import { createContext } from "react";

import type {
  LearningTimelineEvent,
  TimelineEventType,
} from "../../../shared/types/learningTimeline";

export type TimelineMetadata = Record<
  string,
  string | number | boolean
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

  addEvent: (input: AddTimelineEvent) => void;

  deleteEvent: (id: string) => void;

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

export const LearningTimelineContext =
  createContext<LearningTimelineContextValue | undefined>(
    undefined,
  );
