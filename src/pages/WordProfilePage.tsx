import {
  ArrowLeft,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Link2,
  RotateCcw,
} from "lucide-react";
import { useMemo } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";

import { PersonalExamplesPanel } from "../features/knowledge/components/PersonalExamplesPanel";
import { WordConnectionsPanel } from "../features/knowledge/components/WordConnectionsPanel";
import { LearningTimeline } from "../features/timeline/components/LearningTimeline";
import { useLearningTimeline } from "../features/timeline/hooks/useLearningTimeline";
import {
  getPrimaryWordRecommendation,
  getWordRecommendations,
} from "../features/knowledge/lib/wordRecommendationEngine";
import {
  analyseMistake,
  getMistakeTypeLabel,
} from "../features/practice/lib/mistakeAnalysisEngine";
import { useMistakeHistory } from "../features/practice/hooks/useMistakeHistory";
import { useVocabulary } from "../features/vocabulary/hooks/useVocabulary";
import Card from "../shared/ui/Card";

import type {
  KnowledgeSkill,
  VocabularyItem,
} from "../shared/types/vocabulary";

const skillLabels: Record<
  KnowledgeSkill,
  string
> = {
  meaning: "Meaning",
  article: "Article",
  plural: "Plural",
  perfekt: "Perfekt",
  praeteritum: "Präteritum",
  comparative: "Comparative",
  recognition: "Recognition",
  recall: "Recall",
  sentence: "Sentence use",
};

function getDisplayGerman(
  item: VocabularyItem,
) {
  return item.type === "noun"
    ? `${item.article} ${item.german}`
    : item.german;
}

function getTypeDetails(
  item: VocabularyItem,
) {
  switch (item.type) {
    case "noun":
      return [
        {
          label: "Article",
          value: item.article,
        },
        {
          label: "Plural",
          value: item.plural,
        },
      ];

    case "verb":
      return [
        {
          label: "Auxiliary",
          value: item.auxiliary,
        },
        {
          label: "Präteritum",
          value: item.praeteritum,
        },
        {
          label: "Perfekt",
          value: item.perfekt,
        },
        {
          label: "Reflexive",
          value: item.reflexive
            ? "Yes"
            : "No",
        },
        {
          label: "Separable",
          value: item.separable
            ? "Yes"
            : "No",
        },
      ];

    case "adjective":
      return [
        {
          label: "Comparative",
          value: item.comparative,
        },
        {
          label: "Superlative",
          value: item.superlative,
        },
      ];

    case "expression":
    default:
      return [];
  }
}

function getRelevantSkills(
  item: VocabularyItem,
): KnowledgeSkill[] {
  const skills: KnowledgeSkill[] = [
    "meaning",
    "recognition",
    "recall",
    "sentence",
  ];

  if (item.type === "noun") {
    skills.push(
      "article",
      "plural",
    );
  }

  if (item.type === "verb") {
    skills.push(
      "perfekt",
      "praeteritum",
    );
  }

  if (item.type === "adjective") {
    skills.push(
      "comparative",
    );
  }

  return skills;
}

function getScoreStyle(
  score: number,
  attempts: number,
) {
  if (attempts === 0) {
    return {
      text: "text-slate-600",
      background: "bg-slate-100",
      bar: "bg-slate-300",
      label: "Untested",
    };
  }

  if (score >= 80) {
    return {
      text: "text-green-700",
      background: "bg-green-50",
      bar: "bg-green-500",
      label: "Strong",
    };
  }

  if (score >= 50) {
    return {
      text: "text-amber-700",
      background: "bg-amber-50",
      bar: "bg-amber-500",
      label: "Developing",
    };
  }

  return {
    text: "text-red-700",
    background: "bg-red-50",
    bar: "bg-red-500",
    label: "Needs focus",
  };
}

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "Not scheduled";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Unavailable";
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

function WordProfilePage() {
  const { id } = useParams<{
    id: string;
  }>();

  const {
    items,
    resetLearningData,
  } = useVocabulary();

  const {
    getMistakesForVocabulary,
  } = useMistakeHistory();

  const {
    deleteEvent,
    getEventsForVocabulary,
  } = useLearningTimeline();

  const item = items.find(
    (candidate) =>
      candidate.id === id,
  );

  const mistakes = useMemo(
    () =>
      id
        ? getMistakesForVocabulary(
            id,
          )
        : [],
    [id, getMistakesForVocabulary],
  );

  const timelineEvents =
    useMemo(
      () =>
        id
          ? getEventsForVocabulary(
              id,
            )
          : [],
      [
        id,
        getEventsForVocabulary,
      ],
    );

  if (!item) {
    return (
      <Card>
        <div className="px-6 py-20 text-center">
          <CircleAlert
            size={30}
            className="mx-auto text-[#B85F28]"
          />

          <h1 className="mt-4 text-xl font-semibold text-[#1F1D1B]">
            Vocabulary item not found
          </h1>

          <p className="mt-2 text-sm text-[#77716B]">
            The requested item may have been deleted.
          </p>

          <Link
            to="/vocabulary"
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1F1D1B] px-5 text-sm font-semibold text-white transition hover:bg-black"
          >
            <ArrowLeft size={17} />
            Back to vocabulary
          </Link>
        </div>
      </Card>
    );
  }

  const selectedItem: VocabularyItem =
    item;

  const details =
    getTypeDetails(selectedItem);

  const relevantSkills =
    getRelevantSkills(selectedItem);

  const testedSkills =
    relevantSkills.filter(
      (skill) =>
        selectedItem.knowledge[skill]
          .attempts > 0,
    );

  const overallScore =
    testedSkills.length > 0
      ? Math.round(
          testedSkills.reduce(
            (total, skill) =>
              total +
              selectedItem.knowledge[skill]
                .score,
            0,
          ) /
            testedSkills.length,
        )
      : 0;

  const openMistakes =
    mistakes.filter(
      (mistake) =>
        !mistake.resolved,
    );

  const recommendations =
    getWordRecommendations(
      selectedItem,
    );

  const primaryRecommendation =
    getPrimaryWordRecommendation(
      selectedItem,
    );

  function handleReset() {
    const confirmed =
      window.confirm(
        `Reset all learning data for "${selectedItem.german}"?`,
      );

    if (!confirmed) {
      return;
    }

    resetLearningData(
      selectedItem.id,
    );
  }

  return (
    <>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <Link
            to="/vocabulary"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#77716B] transition hover:text-[#1F1D1B]"
          >
            <ArrowLeft size={16} />
            Vocabulary
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-[#1F1D1B]">
              {getDisplayGerman(
                selectedItem,
              )}
            </h1>

            <span className="rounded-full bg-[#F8F4F0] px-3 py-1 text-xs font-semibold capitalize text-[#625C56]">
              {selectedItem.type}
            </span>

            <span className="rounded-full bg-[#FFF0E2] px-3 py-1 text-xs font-semibold text-[#8A5417]">
              {selectedItem.level}
            </span>
          </div>

          <p className="mt-2 text-sm text-[#77716B]">
            A complete view of what you know, what you miss and what should be practised next.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-red-200 bg-white px-4 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <RotateCcw size={17} />
          Reset learning data
        </button>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm font-medium text-[#77716B]">
            Overall knowledge
          </p>

          <p className="mt-3 text-4xl font-bold text-[#1F1D1B]">
            {overallScore}%
          </p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-[#77716B]">
            Reviews
          </p>

          <p className="mt-3 text-4xl font-bold text-[#1F1D1B]">
            {
              selectedItem.review
                .reviewCount
            }
          </p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-[#77716B]">
            Open mistakes
          </p>

          <p className="mt-3 text-4xl font-bold text-red-700">
            {
              openMistakes.length
            }
          </p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-[#77716B]">
            Next review
          </p>

          <p className="mt-3 text-lg font-bold text-[#1F1D1B]">
            {formatDate(
              selectedItem.review.nextReview,
            )}
          </p>
        </Card>
      </section>

      {primaryRecommendation && (
        <section className="mt-6">
          <Card>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF0E2] text-[#B85F28]">
                  <BrainCircuit
                    size={21}
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A09A94]">
                    Recommended next step
                  </p>

                  <h2 className="mt-2 text-xl font-semibold text-[#1F1D1B]">
                    Focus on{" "}
                    {
                      primaryRecommendation.label
                    }
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#625C56]">
                    {
                      primaryRecommendation.reason
                    }
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#77716B]">
                    <strong className="font-semibold text-[#4D4843]">
                      Action:
                    </strong>{" "}
                    {
                      primaryRecommendation.action
                    }
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-[#F8F4F0] px-4 py-3 lg:min-w-[150px] lg:text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-[#938C85]">
                  Current score
                </p>

                <p className="mt-1 text-3xl font-bold text-[#1F1D1B]">
                  {
                    primaryRecommendation.score
                  }
                  %
                </p>
              </div>
            </div>
          </Card>
        </section>
      )}

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Card className="p-0">
            <div className="border-b border-[#ECE8E3] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#FFF0E2] text-[#B85F28]">
                  <BrainCircuit
                    size={20}
                  />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-[#1F1D1B]">
                    Knowledge profile
                  </h2>

                  <p className="mt-1 text-sm text-[#77716B]">
                    Each part of this vocabulary item is measured separately.
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-[#F0ECE8]">
              {relevantSkills.map(
                (skill) => {
                  const state =
                    selectedItem.knowledge[
                      skill
                    ];

                  const style =
                    getScoreStyle(
                      state.score,
                      state.attempts,
                    );

                  return (
                    <div
                      key={skill}
                      className="px-6 py-5"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-[#1F1D1B]">
                            {
                              skillLabels[
                                skill
                              ]
                            }
                          </p>

                          <p className="mt-1 text-xs text-[#77716B]">
                            {
                              state.correctAttempts
                            }{" "}
                            correct ·{" "}
                            {
                              state.wrongAttempts
                            }{" "}
                            wrong
                          </p>
                        </div>

                        <div className="text-right">
                          <p
                            className={`text-2xl font-bold ${style.text}`}
                          >
                            {state.score}%
                          </p>

                          <span
                            className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${style.background} ${style.text}`}
                          >
                            {style.label}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#F0ECE8]">
                        <div
                          className={`h-full rounded-full ${style.bar}`}
                          style={{
                            width: `${state.score}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </Card>

          <Card className="p-0">
            <div className="border-b border-[#ECE8E3] px-6 py-5">
              <h2 className="text-lg font-semibold text-[#1F1D1B]">
                Meanings and examples
              </h2>
            </div>

            <div className="divide-y divide-[#F0ECE8]">
              {selectedItem.meanings.map(
                (meaning) => (
                  <div
                    key={meaning.id}
                    className="px-6 py-5"
                  >
                    <p className="font-semibold text-[#1F1D1B]">
                      {
                        meaning.translation
                      }
                    </p>

                    {meaning.exampleGerman && (
                      <p className="mt-3 text-sm font-medium text-[#4D4843]">
                        {
                          meaning.exampleGerman
                        }
                      </p>
                    )}

                    {meaning.exampleRomanian && (
                      <p className="mt-1 text-sm text-[#77716B]">
                        {
                          meaning.exampleRomanian
                        }
                      </p>
                    )}
                  </div>
                ),
              )}
            </div>
          </Card>

          <Card>
            <PersonalExamplesPanel
              item={selectedItem}
            />
          </Card>

          <Card className="p-0">
            <div className="border-b border-[#ECE8E3] px-6 py-5">
              <h2 className="text-lg font-semibold text-[#1F1D1B]">
                Learning timeline
              </h2>

              <p className="mt-1 text-sm text-[#77716B]">
                A chronological record of practice, mistakes, examples and connections.
              </p>
            </div>

            <div className="px-6 py-5">
              <LearningTimeline
                events={timelineEvents}
                onDeleteEvent={
                  deleteEvent
                }
              />
            </div>
          </Card>

          {mistakes.length > 0 && (
            <Card className="p-0">
              <div className="border-b border-[#ECE8E3] px-6 py-5">
                <h2 className="text-lg font-semibold text-[#1F1D1B]">
                  Mistake memory
                </h2>

                <p className="mt-1 text-sm text-[#77716B]">
                  Error patterns connected to this vocabulary selectedItem.
                </p>
              </div>

              <div className="divide-y divide-[#F0ECE8]">
                {mistakes.map(
                  (mistake) => {
                    const analysis =
                      analyseMistake(
                        mistake,
                      );

                    return (
                      <div
                        key={
                          mistake.id
                        }
                        className="px-6 py-5"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#FFF0E2] px-2.5 py-1 text-xs font-semibold text-[#8A5417]">
                            {getMistakeTypeLabel(
                              mistake.questionType,
                            )}
                          </span>

                          <span
                            className={
                              mistake.resolved
                                ? "rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700"
                                : "rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700"
                            }
                          >
                            {mistake.resolved
                              ? "Resolved"
                              : "Open"}
                          </span>
                        </div>

                        <h3 className="mt-3 font-semibold text-[#1F1D1B]">
                          {
                            analysis.title
                          }
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-[#625C56]">
                          {
                            analysis.explanation
                          }
                        </p>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-xl bg-red-50 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                              Your answer
                            </p>

                            <p className="mt-1 text-sm font-medium text-red-900">
                              {mistake.userAnswer ||
                                "No answer"}
                            </p>
                          </div>

                          <div className="rounded-xl bg-green-50 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                              Correct answer
                            </p>

                            <p className="mt-1 text-sm font-medium text-green-900">
                              {
                                mistake.correctAnswer
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {details.length > 0 && (
            <Card>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#F1EEF9] text-[#67558A]">
                  <Link2 size={19} />
                </div>

                <h2 className="text-lg font-semibold text-[#1F1D1B]">
                  Word structure
                </h2>
              </div>

              <div className="mt-5 space-y-4">
                {details.map(
                  (detail) => (
                    <div
                      key={
                        detail.label
                      }
                      className="flex items-start justify-between gap-4 border-b border-[#F0ECE8] pb-4 last:border-0 last:pb-0"
                    >
                      <span className="text-sm text-[#77716B]">
                        {
                          detail.label
                        }
                      </span>

                      <strong className="text-right text-sm text-[#1F1D1B]">
                        {
                          detail.value ||
                          "Not provided"
                        }
                      </strong>
                    </div>
                  ),
                )}
              </div>
            </Card>
          )}

          <Card>
            <h2 className="text-lg font-semibold text-[#1F1D1B]">
              Practice priorities
            </h2>

            <div className="mt-5 space-y-4">
              {recommendations
                .slice(0, 4)
                .map(
                  (
                    recommendation,
                    index,
                  ) => (
                    <div
                      key={
                        recommendation.skill
                      }
                      className="flex items-start gap-3"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#FFF0E2] text-xs font-bold text-[#8A5417]">
                        {index + 1}
                      </span>

                      <div>
                        <p className="text-sm font-semibold text-[#1F1D1B]">
                          {
                            recommendation.label
                          }
                        </p>

                        <p className="mt-0.5 text-xs leading-5 text-[#77716B]">
                          {
                            recommendation.reason
                          }
                        </p>
                      </div>
                    </div>
                  ),
                )}
            </div>
          </Card>

          <Card>
            <WordConnectionsPanel
              item={selectedItem}
              vocabulary={items}
            />
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
                <CalendarClock
                  size={19}
                />
              </div>

              <h2 className="text-lg font-semibold text-[#1F1D1B]">
                Review state
              </h2>
            </div>

            <div className="mt-5 space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#77716B]">
                  Correct reviews
                </span>

                <strong className="text-green-700">
                  {
                    selectedItem.review
                      .correctCount
                  }
                </strong>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-[#77716B]">
                  Incorrect reviews
                </span>

                <strong className="text-red-700">
                  {
                    selectedItem.review
                      .wrongCount
                  }
                </strong>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-[#77716B]">
                  Current interval
                </span>

                <strong className="text-[#1F1D1B]">
                  {
                    selectedItem.review
                      .interval
                  }{" "}
                  days
                </strong>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-[#77716B]">
                  Ease factor
                </span>

                <strong className="text-[#1F1D1B]">
                  {
                    selectedItem.review
                      .easeFactor
                  }
                </strong>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-[#77716B]">
                  Last reviewed
                </span>

                <strong className="text-right text-[#1F1D1B]">
                  {formatDate(
                    selectedItem.review.lastReviewed,
                  )}
                </strong>
              </div>
            </div>
          </Card>

          <Link
            to="/practice"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1F1D1B] px-5 text-sm font-semibold text-white transition hover:bg-black"
          >
            <CheckCircle2
              size={18}
            />
            Practise vocabulary
          </Link>
        </div>
      </section>
    </>
  );
}

export default WordProfilePage;