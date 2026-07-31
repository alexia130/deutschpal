import {
  Award,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Target,
  Trash2,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useMemo } from "react";

import { usePracticeHistory } from "../features/practice/hooks/usePracticeHistory";
import PageHeader from "../shared/components/PageHeader";
import Card from "../shared/ui/Card";

import type { PracticeSession } from "../shared/types/practice";

function formatPracticeType(
  practiceType: PracticeSession["practiceType"],
) {
  switch (practiceType) {
    case "meaning":
      return "Meanings";

    case "article":
      return "Articles";

    case "plural":
      return "Plural";

    case "perfekt":
      return "Perfekt";

    case "praeteritum":
      return "Präteritum";

    case "comparative":
      return "Comparative";

    case "mixed":
      return "Mixed";

    default:
      return "Practice";
  }
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getScoreStyle(score: number) {
  if (score >= 80) {
    return {
      text: "text-green-700",
      background: "bg-green-50",
      border: "border-green-100",
    };
  }

  if (score >= 50) {
    return {
      text: "text-amber-700",
      background: "bg-amber-50",
      border: "border-amber-100",
    };
  }

  return {
    text: "text-red-700",
    background: "bg-red-50",
    border: "border-red-100",
  };
}

function ProgressPage() {
  const {
    sessions,
    deleteSession,
    clearHistory,
  } = usePracticeHistory();

  const statistics = useMemo(() => {
    const totalSessions = sessions.length;

    const totalQuestions = sessions.reduce(
      (total, session) =>
        total + session.totalQuestions,
      0,
    );

    const totalCorrectAnswers = sessions.reduce(
      (total, session) =>
        total + session.correctAnswers,
      0,
    );

    const totalIncorrectAnswers = sessions.reduce(
      (total, session) =>
        total + session.incorrectAnswers,
      0,
    );

    const averageScore =
      totalQuestions > 0
        ? Math.round(
            (totalCorrectAnswers /
              totalQuestions) *
              100,
          )
        : 0;

    const bestScore =
      totalSessions > 0
        ? Math.max(
            ...sessions.map(
              (session) =>
                session.scorePercentage,
            ),
          )
        : 0;

    return {
      totalSessions,
      totalQuestions,
      totalCorrectAnswers,
      totalIncorrectAnswers,
      averageScore,
      bestScore,
    };
  }, [sessions]);

  const progressByType = useMemo(() => {
    const groupedSessions = new Map<
      string,
      {
        practiceType: PracticeSession["practiceType"];
        sessions: number;
        totalQuestions: number;
        correctAnswers: number;
      }
    >();

    sessions.forEach((session) => {
      const current =
        groupedSessions.get(
          session.practiceType,
        );

      if (current) {
        current.sessions += 1;
        current.totalQuestions +=
          session.totalQuestions;
        current.correctAnswers +=
          session.correctAnswers;
      } else {
        groupedSessions.set(
          session.practiceType,
          {
            practiceType:
              session.practiceType,
            sessions: 1,
            totalQuestions:
              session.totalQuestions,
            correctAnswers:
              session.correctAnswers,
          },
        );
      }
    });

    return Array.from(
      groupedSessions.values(),
    )
      .map((group) => ({
        ...group,
        averageScore:
          group.totalQuestions > 0
            ? Math.round(
                (group.correctAnswers /
                  group.totalQuestions) *
                  100,
              )
            : 0,
      }))
      .sort(
        (firstGroup, secondGroup) =>
          secondGroup.sessions -
          firstGroup.sessions,
      );
  }, [sessions]);

  function handleDeleteSession(id: string) {
    const confirmed = window.confirm(
      "Delete this practice session?",
    );

    if (!confirmed) {
      return;
    }

    deleteSession(id);
  }

  function handleClearHistory() {
    const confirmed = window.confirm(
      "Delete the entire practice history? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    clearHistory();
  }

  return (
    <>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <PageHeader
          title="Progress"
          subtitle="Track your practice results and learning activity."
        />

        {sessions.length > 0 && (
          <button
            type="button"
            onClick={handleClearHistory}
            className="flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-red-200 bg-white px-4 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <Trash2 size={17} />
            Clear history
          </button>
        )}
      </div>

      {sessions.length === 0 ? (
        <Card>
          <div className="px-6 py-20 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#FFF0E2] text-[#8A5417]">
              <BarChart3 size={26} />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-[#1F1D1B]">
              No practice history yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#77716B]">
              Complete a practice session and
              your results will appear here
              automatically.
            </p>
          </div>
        </Card>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#77716B]">
                    Practice sessions
                  </p>

                  <p className="mt-3 text-3xl font-bold text-[#1F1D1B]">
                    {
                      statistics.totalSessions
                    }
                  </p>
                </div>

                <div className="flex size-11 items-center justify-center rounded-xl bg-[#FFF0E2] text-[#8A5417]">
                  <CalendarDays
                    size={21}
                  />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#77716B]">
                    Questions answered
                  </p>

                  <p className="mt-3 text-3xl font-bold text-[#1F1D1B]">
                    {
                      statistics.totalQuestions
                    }
                  </p>
                </div>

                <div className="flex size-11 items-center justify-center rounded-xl bg-[#F1EEF9] text-[#67558A]">
                  <Target size={21} />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#77716B]">
                    Average score
                  </p>

                  <p className="mt-3 text-3xl font-bold text-[#1F1D1B]">
                    {
                      statistics.averageScore
                    }
                    %
                  </p>
                </div>

                <div className="flex size-11 items-center justify-center rounded-xl bg-green-50 text-green-700">
                  <TrendingUp size={21} />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#77716B]">
                    Best score
                  </p>

                  <p className="mt-3 text-3xl font-bold text-[#1F1D1B]">
                    {statistics.bestScore}%
                  </p>
                </div>

                <div className="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <Award size={21} />
                </div>
              </div>
            </Card>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.55fr)]">
            <Card className="p-0">
              <div className="border-b border-[#ECE8E3] px-6 py-5">
                <h2 className="text-lg font-semibold text-[#1F1D1B]">
                  Recent sessions
                </h2>

                <p className="mt-1 text-sm text-[#77716B]">
                  Your latest completed
                  vocabulary exercises.
                </p>
              </div>

              <div className="divide-y divide-[#F0ECE8]">
                {sessions.map((session) => {
                  const scoreStyle =
                    getScoreStyle(
                      session.scorePercentage,
                    );

                  return (
                    <article
                      key={session.id}
                      className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-[#1F1D1B]">
                            {formatPracticeType(
                              session.practiceType,
                            )}
                          </h3>

                          <span className="rounded-full bg-[#F8F4F0] px-2.5 py-1 text-xs font-medium text-[#625C56]">
                            {session.level ===
                            "all"
                              ? "All levels"
                              : `Level ${session.level}`}
                          </span>

                          {session.favoritesOnly && (
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                              Favorites
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#77716B]">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays
                              size={14}
                            />

                            {formatDate(
                              session.completedAt,
                            )}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Clock3
                              size={14}
                            />

                            {formatTime(
                              session.completedAt,
                            )}
                          </span>

                          <span className="flex items-center gap-1.5 text-green-700">
                            <CheckCircle2
                              size={14}
                            />

                            {
                              session.correctAnswers
                            }{" "}
                            correct
                          </span>

                          <span className="flex items-center gap-1.5 text-red-600">
                            <XCircle
                              size={14}
                            />

                            {
                              session.incorrectAnswers
                            }{" "}
                            incorrect
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                        <div
                          className={`rounded-xl border px-4 py-2 text-center ${scoreStyle.background} ${scoreStyle.border}`}
                        >
                          <p
                            className={`text-lg font-bold ${scoreStyle.text}`}
                          >
                            {
                              session.scorePercentage
                            }
                            %
                          </p>

                          <p
                            className={`text-xs ${scoreStyle.text}`}
                          >
                            {
                              session.correctAnswers
                            }
                            /
                            {
                              session.totalQuestions
                            }
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteSession(
                              session.id,
                            )
                          }
                          className="rounded-xl p-2 text-[#A09A94] transition hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete practice session"
                          title="Delete session"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </Card>

            <div className="space-y-6">
              <Card>
                <h2 className="text-lg font-semibold text-[#1F1D1B]">
                  Answer summary
                </h2>

                <div className="mt-5 space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-[#625C56]">
                        <CheckCircle2
                          size={17}
                          className="text-green-600"
                        />
                        Correct answers
                      </span>

                      <strong className="text-[#1F1D1B]">
                        {
                          statistics.totalCorrectAnswers
                        }
                      </strong>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#F0ECE8]">
                      <div
                        className="h-full rounded-full bg-green-500"
                        style={{
                          width: `${
                            statistics.totalQuestions >
                            0
                              ? (statistics.totalCorrectAnswers /
                                  statistics.totalQuestions) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-[#625C56]">
                        <XCircle
                          size={17}
                          className="text-red-500"
                        />
                        Incorrect answers
                      </span>

                      <strong className="text-[#1F1D1B]">
                        {
                          statistics.totalIncorrectAnswers
                        }
                      </strong>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#F0ECE8]">
                      <div
                        className="h-full rounded-full bg-red-400"
                        style={{
                          width: `${
                            statistics.totalQuestions >
                            0
                              ? (statistics.totalIncorrectAnswers /
                                  statistics.totalQuestions) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="text-lg font-semibold text-[#1F1D1B]">
                  Performance by type
                </h2>

                <div className="mt-5 space-y-5">
                  {progressByType.map(
                    (group) => {
                      const scoreStyle =
                        getScoreStyle(
                          group.averageScore,
                        );

                      return (
                        <div
                          key={
                            group.practiceType
                          }
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sm font-semibold text-[#1F1D1B]">
                                {formatPracticeType(
                                  group.practiceType,
                                )}
                              </p>

                              <p className="mt-0.5 text-xs text-[#77716B]">
                                {
                                  group.sessions
                                }{" "}
                                {group.sessions ===
                                1
                                  ? "session"
                                  : "sessions"}
                              </p>
                            </div>

                            <span
                              className={`rounded-lg px-2.5 py-1 text-sm font-semibold ${scoreStyle.background} ${scoreStyle.text}`}
                            >
                              {
                                group.averageScore
                              }
                              %
                            </span>
                          </div>

                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#F0ECE8]">
                            <div
                              className="h-full rounded-full bg-[#E3B48D]"
                              style={{
                                width: `${group.averageScore}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </Card>
            </div>
          </section>
        </>
      )}
    </>
  );
}

export default ProgressPage;