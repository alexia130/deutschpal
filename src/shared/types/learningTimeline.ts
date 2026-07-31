export type TimelineEventType =
  | "word-added"
  | "word-updated"
  | "word-deleted"
  | "practice"
  | "review"
  | "mistake"
  | "correct"
  | "mastered"
  | "forgotten"
  | "favorite-added"
  | "favorite-removed"
  | "personal-example-added"
  | "personal-example-updated"
  | "personal-example-deleted"
  | "connection-added"
  | "connection-deleted";

export interface LearningTimelineEvent {
  id: string;

  vocabularyId: string;

  type: TimelineEventType;

  title: string;

  description: string;

  metadata?: Record<
    string,
    string | number | boolean
  >;

  icon?: string;

  createdAt: string;
}