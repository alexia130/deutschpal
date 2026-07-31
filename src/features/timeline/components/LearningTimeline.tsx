import {
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  CircleAlert,
  Link2,
  Pencil,
  Plus,
  RotateCcw,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";

import {
  formatTimelineTime,
  groupTimelineEvents,
} from "../lib/timelineFormatter";

import type {
  LearningTimelineEvent,
  TimelineEventType,
} from "../../../shared/types/learningTimeline";

interface LearningTimelineProps {
  events: LearningTimelineEvent[];
  onDeleteEvent?: (
    id: string,
  ) => void;
}

function getEventIcon(
  type: TimelineEventType,
) {
  switch (type) {
    case "word-added":
      return Plus;

    case "word-updated":
      return Pencil;

    case "word-deleted":
      return Trash2;

    case "practice":
      return BrainCircuit;

    case "review":
      return RotateCcw;

    case "mistake":
      return XCircle;

    case "correct":
      return CheckCircle2;

    case "mastered":
      return CheckCircle2;

    case "forgotten":
      return CircleAlert;

    case "favorite-added":
    case "favorite-removed":
      return Star;

    case "personal-example-added":
    case "personal-example-updated":
    case "personal-example-deleted":
      return BookOpen;

    case "connection-added":
    case "connection-deleted":
      return Link2;

    default:
      return BrainCircuit;
  }
}

function getEventStyle(
  type: TimelineEventType,
) {
  switch (type) {
    case "correct":
    case "mastered":
      return {
        icon: "bg-green-50 text-green-700",
        line: "bg-green-200",
      };

    case "mistake":
    case "forgotten":
      return {
        icon: "bg-red-50 text-red-700",
        line: "bg-red-200",
      };

    case "favorite-added":
    case "favorite-removed":
      return {
        icon: "bg-amber-50 text-amber-700",
        line: "bg-amber-200",
      };

    case "connection-added":
    case "connection-deleted":
      return {
        icon: "bg-[#F1EEF9] text-[#67558A]",
        line: "bg-[#DDD4EE]",
      };

    default:
      return {
        icon: "bg-[#FFF0E2] text-[#B85F28]",
        line: "bg-[#F2D4BB]",
      };
  }
}

export function LearningTimeline({
  events,
  onDeleteEvent,
}: LearningTimelineProps) {
  const groupedEvents =
    groupTimelineEvents(events);

  if (
    groupedEvents.length === 0
  ) {
    return (
      <div className="rounded-xl border border-dashed border-[#DCD5CE] px-4 py-10 text-center">
        <BrainCircuit
          size={26}
          className="mx-auto text-[#B4AEA8]"
        />

        <p className="mt-3 text-sm font-medium text-[#4D4843]">
          No learning events yet
        </p>

        <p className="mt-1 text-sm leading-6 text-[#77716B]">
          Practice, mistakes, examples and connections will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {groupedEvents.map(
        (group) => (
          <section
            key={group.label}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A09A94]">
              {group.label}
            </p>

            <div className="mt-4 space-y-1">
              {group.events.map(
                (
                  event,
                  index,
                ) => {
                  const Icon =
                    getEventIcon(
                      event.type,
                    );

                  const style =
                    getEventStyle(
                      event.type,
                    );

                  const isLast =
                    index ===
                    group.events.length -
                      1;

                  return (
                    <article
                      key={
                        event.id
                      }
                      className="relative flex gap-4 pb-5"
                    >
                      {!isLast && (
                        <div
                          className={`absolute left-[19px] top-10 h-[calc(100%-24px)] w-px ${style.line}`}
                        />
                      )}

                      <div
                        className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
                      >
                        <Icon
                          size={18}
                        />
                      </div>

                      <div className="min-w-0 flex-1 rounded-xl border border-[#E8E2DC] bg-[#FCFAF8] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-semibold text-[#1F1D1B]">
                              {
                                event.title
                              }
                            </h3>

                            <p className="mt-1 text-sm leading-6 text-[#77716B]">
                              {
                                event.description
                              }
                            </p>

                            <p className="mt-2 text-xs text-[#938C85]">
                              {formatTimelineTime(
                                event.createdAt,
                              )}
                            </p>
                          </div>

                          {onDeleteEvent && (
                            <button
                              type="button"
                              onClick={() =>
                                onDeleteEvent(
                                  event.id,
                                )
                              }
                              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#A09A94] transition hover:bg-red-50 hover:text-red-600"
                              aria-label="Delete timeline event"
                              title="Delete event"
                            >
                              <Trash2
                                size={15}
                              />
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          </section>
        ),
      )}
    </div>
  );
}