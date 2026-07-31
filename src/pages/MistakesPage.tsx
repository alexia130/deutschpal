import {
  CheckCircle2,
  CircleAlert,
  RotateCcw,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";

import {
  analyseMistake,
  getMistakeTypeLabel,
} from "../features/practice/lib/mistakeAnalysisEngine";
import { useMistakeHistory } from "../features/practice/hooks/useMistakeHistory";
import PageHeader from "../shared/components/PageHeader";
import Card from "../shared/ui/Card";

import type {
  MistakeRecord,
  MistakeType,
} from "../shared/types/practice";

type MistakeStatusFilter =
  | "open"
  | "resolved"
  | "all";

type MistakeTypeFilter =
  | "all"
  | MistakeType;


function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

function getMistakePriority(
  mistake: MistakeRecord,
) {
  if (mistake.resolved) {
    return 0;
  }

  return (
    mistake.repeatedMistakes * 10 -
    mistake.correctRetries * 4
  );
}

function MistakesPage() {
  const {
    mistakes,
    resolveMistake,
    reopenMistake,
    deleteMistake,
    clearMistakes,
  } = useMistakeHistory();

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<MistakeStatusFilter>(
      "open",
    );

  const [
    typeFilter,
    setTypeFilter,
  ] =
    useState<MistakeTypeFilter>(
      "all",
    );

  const statistics = useMemo(() => {
    const open = mistakes.filter(
      (mistake) =>
        !mistake.resolved,
    ).length;

    const resolved =
      mistakes.length - open;

    const repeated =
      mistakes.filter(
        (mistake) =>
          mistake.repeatedMistakes >
          1,
      ).length;

    return {
      total: mistakes.length,
      open,
      resolved,
      repeated,
    };
  }, [mistakes]);

  const filteredMistakes =
    useMemo(() => {
      const normalizedSearch =
        searchTerm
          .trim()
          .toLocaleLowerCase(
            "de-DE",
          );

      return [...mistakes]
        .filter((mistake) => {
          const matchesStatus =
            statusFilter === "all" ||
            (statusFilter ===
              "open" &&
              !mistake.resolved) ||
            (statusFilter ===
              "resolved" &&
              mistake.resolved);

          const matchesType =
            typeFilter === "all" ||
            mistake.questionType ===
              typeFilter;

          const searchableText = [
            mistake.vocabularyGerman,
            mistake.userAnswer,
            mistake.correctAnswer,
            getMistakeTypeLabel(
              mistake.questionType,
            ),
          ]
            .join(" ")
            .toLocaleLowerCase(
              "de-DE",
            );

          const matchesSearch =
            normalizedSearch.length ===
              0 ||
            searchableText.includes(
              normalizedSearch,
            );

          return (
            matchesStatus &&
            matchesType &&
            matchesSearch
          );
        })
        .sort(
          (
            firstMistake,
            secondMistake,
          ) => {
            const priorityDifference =
              getMistakePriority(
                secondMistake,
              ) -
              getMistakePriority(
                firstMistake,
              );

            if (
              priorityDifference !== 0
            ) {
              return priorityDifference;
            }

            return (
              new Date(
                secondMistake.updatedAt,
              ).getTime() -
              new Date(
                firstMistake.updatedAt,
              ).getTime()
            );
          },
        );
    }, [
      mistakes,
      searchTerm,
      statusFilter,
      typeFilter,
    ]);

  function handleDelete(
    mistake: MistakeRecord,
  ) {
    const confirmed =
      window.confirm(
        `Delete the mistake record for "${mistake.vocabularyGerman}"?`,
      );

    if (!confirmed) {
      return;
    }

    deleteMistake(
      mistake.id,
    );
  }

  function handleClearAll() {
    const confirmed =
      window.confirm(
        "Delete all mistake records? This action cannot be undone.",
      );

    if (!confirmed) {
      return;
    }

    clearMistakes();
  }

  function resetFilters() {
    setSearchTerm("");
    setStatusFilter("open");
    setTypeFilter("all");
  }

  return (
    <>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <PageHeader
          title="Mistakes"
          subtitle="Review recurring errors and track which ones you have corrected."
        />

        {mistakes.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {statistics.open > 0 && (
              <Link
                to="/practice?mode=mistakes"
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1F1D1B] px-4 text-sm font-semibold text-white transition hover:bg-black"
              >
                <RotateCcw size={17} />
                Practice open mistakes
              </Link>
            )}

          <button
            type="button"
            onClick={handleClearAll}
            className="flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-red-200 bg-white px-4 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <Trash2 size={17} />
            Clear all
          </button>
          </div>
        )}
      </div>

      {mistakes.length === 0 ? (
        <Card>
          <div className="px-6 py-20 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#FFF0E2] text-[#B85F28]">
              <CheckCircle2
                size={26}
              />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-[#1F1D1B]">
              No mistakes recorded
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#77716B]">
              Incorrect answers from practice sessions will appear here automatically.
            </p>

            <Link
              to="/practice"
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1F1D1B] px-5 text-sm font-semibold text-white transition hover:bg-black"
            >
              Open practice
              <RotateCcw
                size={17}
              />
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <p className="text-sm font-medium text-[#77716B]">
                Open mistakes
              </p>

              <p className="mt-3 text-3xl font-bold text-red-700">
                {statistics.open}
              </p>
            </Card>

            <Card>
              <p className="text-sm font-medium text-[#77716B]">
                Resolved
              </p>

              <p className="mt-3 text-3xl font-bold text-green-700">
                {statistics.resolved}
              </p>
            </Card>

            <Card>
              <p className="text-sm font-medium text-[#77716B]">
                Repeated mistakes
              </p>

              <p className="mt-3 text-3xl font-bold text-amber-700">
                {statistics.repeated}
              </p>
            </Card>

            <Card>
              <p className="text-sm font-medium text-[#77716B]">
                Total records
              </p>

              <p className="mt-3 text-3xl font-bold text-[#1F1D1B]">
                {statistics.total}
              </p>
            </Card>
          </section>

          <Card className="mt-6 p-0">
            <div className="border-b border-[#ECE8E3] p-5">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_190px_auto]">
                <label className="relative">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A09A94]"
                  />

                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(
                        event.target.value,
                      )
                    }
                    placeholder="Search words or answers..."
                    className="min-h-12 w-full rounded-xl border border-[#E4DED8] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#E3B48D] focus:ring-4 focus:ring-[#FFF0E2]"
                  />
                </label>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target
                        .value as MistakeStatusFilter,
                    )
                  }
                  className="min-h-12 rounded-xl border border-[#E4DED8] bg-white px-4 text-sm outline-none transition focus:border-[#E3B48D] focus:ring-4 focus:ring-[#FFF0E2]"
                >
                  <option value="open">
                    Open
                  </option>

                  <option value="resolved">
                    Resolved
                  </option>

                  <option value="all">
                    All statuses
                  </option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(
                      event.target
                        .value as MistakeTypeFilter,
                    )
                  }
                  className="min-h-12 rounded-xl border border-[#E4DED8] bg-white px-4 text-sm outline-none transition focus:border-[#E3B48D] focus:ring-4 focus:ring-[#FFF0E2]"
                >
                  <option value="all">
                    All skills
                  </option>

                  {(
                    [
                      "meaning",
                      "article",
                      "plural",
                      "perfekt",
                      "praeteritum",
                      "comparative",
                    ] as MistakeType[]
                  ).map((value) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {getMistakeTypeLabel(
                        value,
                      )}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="min-h-12 rounded-xl border border-[#E4DED8] bg-white px-4 text-sm font-medium text-[#4D4843] transition hover:bg-[#F8F4F0]"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="border-b border-[#ECE8E3] px-6 py-3">
              <p className="text-sm text-[#77716B]">
                {filteredMistakes.length}{" "}
                {filteredMistakes.length ===
                1
                  ? "record"
                  : "records"}
              </p>
            </div>

            {filteredMistakes.length >
            0 ? (
              <div className="divide-y divide-[#F0ECE8]">
                {filteredMistakes.map(
                  (mistake) => {
                    const analysis =
                      analyseMistake(
                        mistake,
                      );

                    return (
                    <article
                      key={mistake.id}
                      className="px-6 py-5"
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-semibold text-[#1F1D1B]">
                              {
                                mistake.vocabularyGerman
                              }
                            </h2>

                            <span className="rounded-full bg-[#FFF0E2] px-2.5 py-1 text-xs font-semibold text-[#8A5417]">
                              {getMistakeTypeLabel(
                                mistake.questionType,
                              )}
                            </span>

                            <span
                              className={
                                mistake.resolved
                                  ? "inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700"
                                  : "inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700"
                              }
                            >
                              {mistake.resolved ? (
                                <CheckCircle2
                                  size={13}
                                />
                              ) : (
                                <CircleAlert
                                  size={13}
                                />
                              )}

                              {mistake.resolved
                                ? "Resolved"
                                : "Open"}
                            </span>
                          </div>

                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-red-100 bg-red-50/60 p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                                Last incorrect answer
                              </p>

                              <p className="mt-2 text-sm font-medium text-red-900">
                                {mistake.userAnswer ||
                                  "No answer"}
                              </p>
                            </div>

                            <div className="rounded-xl border border-green-100 bg-green-50/60 p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                                Correct answer
                              </p>

                              <p className="mt-2 text-sm font-medium text-green-900">
                                {
                                  mistake.correctAnswer
                                }
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 rounded-xl border border-[#E8E2DC] bg-[#FCFAF8] p-4">
                            <div className="flex items-start gap-3">
                              <CircleAlert
                                size={18}
                                className="mt-0.5 shrink-0 text-[#B85F28]"
                              />

                              <div>
                                <p className="text-sm font-semibold text-[#1F1D1B]">
                                  {
                                    analysis.title
                                  }
                                </p>

                                <p className="mt-1 text-sm leading-6 text-[#625C56]">
                                  {
                                    analysis.explanation
                                  }
                                </p>

                                <p className="mt-2 text-sm leading-6 text-[#77716B]">
                                  <strong className="font-semibold text-[#4D4843]">
                                    Next step:
                                  </strong>{" "}
                                  {
                                    analysis.suggestion
                                  }
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#77716B]">
                            <span>
                              Repeated mistakes:{" "}
                              <strong className="text-[#4D4843]">
                                {
                                  mistake.repeatedMistakes
                                }
                              </strong>
                            </span>

                            <span>
                              Correct retries:{" "}
                              <strong className="text-[#4D4843]">
                                {
                                  mistake.correctRetries
                                }
                                /2
                              </strong>
                            </span>

                            <span>
                              Total attempts:{" "}
                              <strong className="text-[#4D4843]">
                                {
                                  mistake.attempts
                                }
                              </strong>
                            </span>

                            <span>
                              Updated:{" "}
                              <strong className="text-[#4D4843]">
                                {formatDate(
                                  mistake.updatedAt,
                                )}
                              </strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          {mistake.resolved ? (
                            <button
                              type="button"
                              onClick={() =>
                                reopenMistake(
                                  mistake.id,
                                )
                              }
                              className="flex min-h-10 items-center gap-2 rounded-xl border border-[#E4DED8] bg-white px-4 text-sm font-medium text-[#4D4843] transition hover:bg-[#F8F4F0]"
                            >
                              <RotateCcw
                                size={16}
                              />
                              Reopen
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                resolveMistake(
                                  mistake.id,
                                )
                              }
                              className="flex min-h-10 items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 text-sm font-medium text-green-700 transition hover:bg-green-100"
                            >
                              <CheckCircle2
                                size={16}
                              />
                              Mark resolved
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                mistake,
                              )
                            }
                            className="flex size-10 items-center justify-center rounded-xl text-[#A09A94] transition hover:bg-red-50 hover:text-red-600"
                            aria-label={`Delete mistake for ${mistake.vocabularyGerman}`}
                            title="Delete mistake"
                          >
                            <Trash2
                              size={18}
                            />
                          </button>
                        </div>
                      </div>
                    </article>
                    );
                  },
                )}
              </div>
            ) : (
              <div className="px-6 py-20 text-center">
                <XCircle
                  size={30}
                  className="mx-auto text-[#B4AEA8]"
                />

                <h2 className="mt-4 text-lg font-semibold text-[#1F1D1B]">
                  No matching mistakes
                </h2>

                <p className="mt-2 text-sm text-[#77716B]">
                  Adjust the search term or selected filters.
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 rounded-xl border border-[#E4DED8] bg-white px-4 py-2 text-sm font-medium text-[#4D4843] transition hover:bg-[#F8F4F0]"
                >
                  Reset filters
                </button>
              </div>
            )}
          </Card>
        </>
      )}
    </>
  );
}

export default MistakesPage;