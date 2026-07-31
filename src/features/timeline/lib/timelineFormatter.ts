import type {
  LearningTimelineEvent,
} from "../../../shared/types/learningTimeline";

export interface TimelineGroup {
  label: string;
  events: LearningTimelineEvent[];
}

function isSameDay(
  firstDate: Date,
  secondDate: Date,
) {
  return (
    firstDate.getFullYear() ===
      secondDate.getFullYear() &&
    firstDate.getMonth() ===
      secondDate.getMonth() &&
    firstDate.getDate() ===
      secondDate.getDate()
  );
}

export function formatTimelineDate(
  value: string,
) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Unknown date";
  }

  const now = new Date();

  if (
    isSameDay(
      date,
      now,
    )
  ) {
    return "Today";
  }

  const yesterday =
    new Date(now);

  yesterday.setDate(
    yesterday.getDate() - 1,
  );

  if (
    isSameDay(
      date,
      yesterday,
    )
  ) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

export function formatTimelineTime(
  value: string,
) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

export function groupTimelineEvents(
  events: LearningTimelineEvent[],
): TimelineGroup[] {
  const groups =
    new Map<
      string,
      LearningTimelineEvent[]
    >();

  [...events]
    .sort(
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
    )
    .forEach((event) => {
      const label =
        formatTimelineDate(
          event.createdAt,
        );

      const currentEvents =
        groups.get(label) ?? [];

      currentEvents.push(event);

      groups.set(
        label,
        currentEvents,
      );
    });

  return Array.from(
    groups.entries(),
  ).map(
    ([label, groupedEvents]) => ({
      label,
      events: groupedEvents,
    }),
  );
}