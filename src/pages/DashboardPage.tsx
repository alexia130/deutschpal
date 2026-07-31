import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  Languages,
  Target,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import { usePracticeHistory } from "../features/practice/hooks/usePracticeHistory";
import { useVocabulary } from "../features/vocabulary/hooks/useVocabulary";
import PageHeader from "../shared/components/PageHeader";
import Card from "../shared/ui/Card";

import type { VocabularyItem } from "../shared/types/vocabulary";

const actions = [
  {
    title: "Review vocabulary",
    description:
      "Practise meanings, articles, plural forms and verb forms.",
    path: "/practice",
    icon: Brain,
  },
  {
    title: "Browse vocabulary",
    description:
      "Search, filter and review your saved German words.",
    path: "/vocabulary",
    icon: BookOpen,
  },
  {
    title: "Study grammar",
    description:
      "Open your B1 grammar topics and explanations.",
    path: "/grammar",
    icon: Languages,
  },
];

function getVocabularyTypeLabel(
  item: VocabularyItem,
) {
  switch (item.type) {
    case "noun":
      return "Noun";

    case "verb":
      return "Verb";

    case "adjective":
      return "Adjective";

    case "expression":
      return "Expression";

    default:
      return "Vocabulary";
  }
}

function getMainTranslation(
  item: VocabularyItem,
) {
  const meanings = Array.isArray(
    item.meanings,
  )
    ? item.meanings
    : [];

  const firstMeaning = meanings.find(
    (meaning) =>
      meaning.translation?.trim()
        .length > 0,
  );

  return (
    firstMeaning?.translation ??
    "No translation"
  );
}

function getCreatedAtTime(
  value: string | undefined,
) {
  if (!value) {
    return 0;
  }

  const time = new Date(
    value,
  ).getTime();

  return Number.isNaN(time)
    ? 0
    : time;
}

function getScoreLabel(score: number) {
  if (score >= 80) {
    return "Very good";
  }

  if (score >= 50) {
    return "In progress";
  }

  if (score > 0) {
    return "Needs review";
  }

  return "Not started";
}

function DashboardPage() {
  const { items } = useVocabulary();

  const { sessions } =
    usePracticeHistory();

  const statistics = useMemo(() => {
    const totalWords = items.length;

    const favoriteWords = items.filter(
      (item) => item.favorite,
    ).length;

    const totalQuestions =
      sessions.reduce(
        (total, session) =>
          total +
          session.totalQuestions,
        0,
      );

    const totalCorrectAnswers =
      sessions.reduce(
        (total, session) =>
          total +
          session.correctAnswers,
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
      sessions.length > 0
        ? Math.max(
            ...sessions.map(
              (session) =>
                session.scorePercentage,
            ),
          )
        : 0;

    return {
      totalWords,
      favoriteWords,
      totalQuestions,
      totalCorrectAnswers,
      averageScore,
      bestScore,
      sessionsCount:
        sessions.length,
    };
  }, [items, sessions]);

  const recentWords = useMemo(
    () =>
      [...items]
        .sort(
          (
            firstItem,
            secondItem,
          ) =>
            getCreatedAtTime(
              secondItem.createdAt,
            ) -
            getCreatedAtTime(
              firstItem.createdAt,
            ),
        )
        .slice(0, 5),
    [items],
  );

  const vocabularyByType =
    useMemo(() => {
      return {
        nouns: items.filter(
          (item) =>
            item.type === "noun",
        ).length,

        verbs: items.filter(
          (item) =>
            item.type === "verb",
        ).length,

        adjectives: items.filter(
          (item) =>
            item.type ===
            "adjective",
        ).length,

        expressions: items.filter(
          (item) =>
            item.type ===
            "expression",
        ).length,
      };
    }, [items]);

  const vocabularyProgress =
    Math.min(
      100,
      statistics.totalWords * 2,
    );

  const practiceProgress =
    statistics.averageScore;

  return (
    <>
      <PageHeader
        title="Home"
        subtitle="Continue your German learning from one focused workspace."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#77716B]">
                Vocabulary
              </p>

              <p className="mt-3 text-3xl font-bold text-[#1F1D1B]">
                {
                  statistics.totalWords
                }
              </p>

              <p className="mt-1 text-xs text-[#A09A94]">
                saved words
              </p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-xl bg-[#FFF0E2] text-[#B85F28]">
              <BookOpen size={21} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#77716B]">
                Practice sessions
              </p>

              <p className="mt-3 text-3xl font-bold text-[#1F1D1B]">
                {
                  statistics.sessionsCount
                }
              </p>

              <p className="mt-1 text-xs text-[#A09A94]">
                completed sessions
              </p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-xl bg-[#F1EEF9] text-[#67558A]">
              <Brain size={21} />
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

              <p className="mt-1 text-xs text-[#A09A94]">
                {getScoreLabel(
                  statistics.averageScore,
                )}
              </p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-xl bg-green-50 text-green-700">
              <TrendingUp
                size={21}
              />
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
                {
                  statistics.bestScore
                }
                %
              </p>

              <p className="mt-1 text-xs text-[#A09A94]">
                personal best
              </p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Award size={21} />
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#A09A94]">
          Continue learning
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {actions.map((action) => {
            const Icon =
              action.icon;

            return (
              <Link
                key={action.title}
                to={action.path}
              >
                <Card className="group h-full p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#E3C6AF] hover:shadow-[0_12px_32px_rgba(31,29,27,0.07)]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF0E2] text-[#B85F28]">
                      <Icon
                        size={21}
                        strokeWidth={
                          1.8
                        }
                      />
                    </div>

                    <ArrowRight
                      size={18}
                      className="text-[#B4AEA8] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#B85F28]"
                    />
                  </div>

                  <h2 className="mt-6 text-lg font-semibold text-[#1F1D1B]">
                    {action.title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#77716B]">
                    {
                      action.description
                    }
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-10 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="p-0">
          <div className="flex items-start justify-between gap-4 border-b border-[#ECE8E3] px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-[#1F1D1B]">
                Recent vocabulary
              </h2>

              <p className="mt-1 text-sm text-[#77716B]">
                Your most recently
                added German words.
              </p>
            </div>

            <Link
              to="/vocabulary"
              className="text-sm font-medium text-[#B85F28] transition hover:text-[#944719]"
            >
              View all
            </Link>
          </div>

          {recentWords.length > 0 ? (
            <div>
              {recentWords.map(
                (word, index) => (
                  <div
                    key={word.id}
                    className={[
                      "flex items-center justify-between gap-6 px-6 py-4",
                      index !==
                      recentWords.length -
                        1
                        ? "border-b border-[#F0ECE8]"
                        : "",
                    ].join(" ")}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#1F1D1B]">
                        {word.type ===
                        "noun"
                          ? `${word.article ?? ""} ${word.german}`.trim()
                          : word.german}
                      </p>

                      <p className="mt-1 truncate text-sm text-[#77716B]">
                        {getMainTranslation(
                          word,
                        )}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full border border-[#E8E2DC] bg-[#FAF8F6] px-3 py-1 text-xs font-medium text-[#77716B]">
                      {getVocabularyTypeLabel(
                        word,
                      )}
                    </span>
                  </div>
                ),
              )}
            </div>
          ) : (
            <div className="px-6 py-14 text-center">
              <p className="font-medium text-[#1F1D1B]">
                No vocabulary yet
              </p>

              <p className="mt-2 text-sm text-[#77716B]">
                Add your first German
                word to see it here.
              </p>

              <Link
                to="/vocabulary"
                className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#1F1D1B] px-4 text-sm font-semibold text-white transition hover:bg-black"
              >
                Add vocabulary
                <ArrowRight
                  size={16}
                />
              </Link>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#A09A94]">
              Learning overview
            </p>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[#1F1D1B]">
              TELC B1 preparation
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#77716B]">
              Build vocabulary and
              improve recall through
              regular practice sessions.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[#1F1D1B]">
                    Vocabulary
                  </span>

                  <span className="text-[#77716B]">
                    {
                      statistics.totalWords
                    }{" "}
                    words
                  </span>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F1ECE7]">
                  <div
                    className="h-full rounded-full bg-[#EFA86A]"
                    style={{
                      width: `${vocabularyProgress}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[#1F1D1B]">
                    Practice
                  </span>

                  <span className="text-[#77716B]">
                    {
                      statistics.averageScore
                    }
                    % average
                  </span>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F1ECE7]">
                  <div
                    className="h-full rounded-full bg-[#EFA86A]"
                    style={{
                      width: `${practiceProgress}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[#1F1D1B]">
                    Correct answers
                  </span>

                  <span className="text-[#77716B]">
                    {
                      statistics.totalCorrectAnswers
                    }
                    /
                    {
                      statistics.totalQuestions
                    }
                  </span>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F1ECE7]">
                  <div
                    className="h-full rounded-full bg-[#EFA86A]"
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
            </div>

            <Link
              to="/progress"
              className="mt-7 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#E4DED8] bg-white px-4 text-sm font-semibold text-[#4D4843] transition hover:bg-[#F8F4F0]"
            >
              View progress
              <ArrowRight
                size={17}
              />
            </Link>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
                <CheckCircle2
                  size={20}
                />
              </div>

              <div>
                <p className="text-sm text-[#77716B]">
                  Favorite vocabulary
                </p>

                <p className="text-lg font-semibold text-[#1F1D1B]">
                  {
                    statistics.favoriteWords
                  }{" "}
                  saved favorites
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-[#1F1D1B]">
              Vocabulary types
            </h2>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#F8F4F0] p-4">
                <p className="text-2xl font-bold text-[#1F1D1B]">
                  {
                    vocabularyByType.nouns
                  }
                </p>

                <p className="mt-1 text-xs text-[#77716B]">
                  Nouns
                </p>
              </div>

              <div className="rounded-xl bg-[#F8F4F0] p-4">
                <p className="text-2xl font-bold text-[#1F1D1B]">
                  {
                    vocabularyByType.verbs
                  }
                </p>

                <p className="mt-1 text-xs text-[#77716B]">
                  Verbs
                </p>
              </div>

              <div className="rounded-xl bg-[#F8F4F0] p-4">
                <p className="text-2xl font-bold text-[#1F1D1B]">
                  {
                    vocabularyByType.adjectives
                  }
                </p>

                <p className="mt-1 text-xs text-[#77716B]">
                  Adjectives
                </p>
              </div>

              <div className="rounded-xl bg-[#F8F4F0] p-4">
                <p className="text-2xl font-bold text-[#1F1D1B]">
                  {
                    vocabularyByType.expressions
                  }
                </p>

                <p className="mt-1 text-xs text-[#77716B]">
                  Expressions
                </p>
              </div>
            </div>

            <Link
              to="/practice"
              className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1F1D1B] px-4 text-sm font-semibold text-white transition hover:bg-black"
            >
              Start practice
              <Target size={17} />
            </Link>
          </Card>
        </div>
      </section>
    </>
  );
}

export default DashboardPage;