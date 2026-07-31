import {
  useContext,
} from "react";

import {
  LearningTimelineContext,
} from "../context/LearningTimelineProvider";

export type {
  AddTimelineEvent,
  LearningTimelineContextValue,
} from "../context/LearningTimelineProvider";

export function useLearningTimeline() {
  const context =
    useContext(
      LearningTimelineContext,
    );

  if (!context) {
    throw new Error(
      "useLearningTimeline must be used inside LearningTimelineProvider.",
    );
  }

  return context;
}