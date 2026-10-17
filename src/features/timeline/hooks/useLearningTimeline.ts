
import { useContext } from "react";

import {
  LearningTimelineContext,
} from "../context/LearningTimelineContext";

export type {
  AddTimelineEvent,
  LearningTimelineContextValue,
} from "../context/LearningTimelineContext";

export function useLearningTimeline() {
  const context = useContext(
    LearningTimelineContext,
  );

  if (context === undefined) {
    throw new Error(
      "useLearningTimeline must be used inside LearningTimelineProvider.",
    );
  }

  return context;
}
