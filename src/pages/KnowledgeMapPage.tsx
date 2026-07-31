import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  CircleAlert,
  CircleDashed,
  Target,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import { calculateKnowledgeRecommendations } from "../features/knowledge/lib/recommendationEngine";
import { useVocabulary } from "../features/vocabulary/hooks/useVocabulary";
import PageHeader from "../shared/components/PageHeader";
import Card from "../shared/ui/Card";

import type {
  KnowledgeSkill,
  VocabularyItem,
} from "../shared/types/vocabulary";

const skillLabels: Record<KnowledgeSkill, string> = {
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

function supportsSkill(
  item: VocabularyItem,
  skill: KnowledgeSkill,
) {
  switch (skill) {
    case "meaning":
      return (
        Array.isArray(item.meanings) &&
        item.meanings.some(
          (meaning) =>
            meaning.translation.trim().length > 0,
        )
      );

    case "article":
      return (
        item.type === "noun" &&
        item.article.trim().length > 0
      );

    case "plural":
      return (
        item.type === "noun" &&
        item.plural.trim().length > 0
      );

    case "perfekt":
      return (
        item.type === "verb" &&
        item.perfekt.trim().length > 0
      );

    case "praeteritum":
      return (
        item.type === "verb" &&
        item.praeteritum.trim().length > 0
      );

    case "comparative":
      return (
        item.type === "adjective" &&
        item.comparative.trim().length > 0
      );

    case "recognition":
    case "recall":
    case "sentence":
      return true;

    default:
      return false;
  }
}

function getScoreClassName(score: number) {
  if (score >= 80) {
    return "text-green-700";
  }

  if (score >= 50) {
    return "text-amber-700";
  }

  if (score > 0) {
    return "text-red-700";
  }

  return "text-[#77716B]";
}

function getStatus(
  score: number,
  attempts: number,
) {
  if (attempts === 0) {
    return {
      label: "Untested",
      icon: CircleDashed,
      className:
        "border-slate-200 bg-slate-50 text-slate-600",
    };
  }

  if (score >= 80) {
    return {
      label: "Strong",
      icon: CheckCircle2,
      className:
        "border-green-200 bg-green-50 text-green-700",
    };
  }

  if (score >= 50) {
    return {
      label: "Developing",
      icon: Target,
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "Needs focus",
    icon: CircleAlert,
    className:
      "border-red-200 bg-red-50 text-red-700",
  };
}

function getWordAverage(
  item: VocabularyItem,
) {
  const relevantSkills = (
    Object.keys(
      item.knowledge,
    ) as KnowledgeSkill[]
  ).filter((skill) =>
    supportsSkill(item, skill),
  );

  const testedSkills =
    relevantSkills.filter(
      (skill) =>
        item.knowledge[skill].attempts > 0,
    );

  if (testedSkills.length === 0) {
    return 0;
  }

  const total = testedSkills.reduce(
    (sum, skill) =>
      sum + item.knowledge[skill].score,
    0,
  );

  return Math.round(
    total / testedSkills.length,
  );
}

function getWordWeakestSkill(
  item: VocabularyItem,
) {
  const relevantSkills = (
    Object.keys(
      item.knowledge,
    ) as KnowledgeSkill[]
  ).filter((skill) =>
    supportsSkill(item, skill),
  );

  if (relevantSkills.length === 0) {
    return null;
  }

  return [...relevantSkills].sort(
    (firstSkill, secondSkill) =>
      item.knowledge[firstSkill].score -
      item.knowledge[secondSkill].score,
  )[0];
}

function KnowledgeMapPage() {
  const { items } = useVocabulary();

  const recommendations = useMemo(
    () =>
      calculateKnowledgeRecommendations(
        items,
      ),
    [items],
  );

  const overallKnowledge =
    useMemo(() => {
      const testedScores =
        items.flatMap((item) =>
          (
            Object.keys(
              item.knowledge,
            ) as KnowledgeSkill[]
          )
            .filter(
              (skill) =>
                supportsSkill(
                  item,
                  skill,
                ) &&
                item.knowledge[skill]
                  .attempts > 0,
            )
            .map(
              (skill) =>
                item.knowledge[skill]
                  .score,
            ),
        );

      if (
        testedScores.length === 0
      ) {
        return 0;
      }

      return Math.round(
        testedScores.reduce(
          (sum, score) =>
            sum + score,
          0,
        ) /
          testedScores.length,
      );
    }, [items]);

  const testedVocabularyCount =
    useMemo(
      () =>
        items.filter((item) =>
          Object.values(
            item.knowledge,
          ).some(
            (skill) =>
              skill.attempts > 0,
          ),
        ).length,
      [items],
    );

  const wordProfiles =
    useMemo(
      () =>
        [...items]
          .map((item) => ({
            item,
            average:
              getWordAverage(item),
            weakestSkill:
              getWordWeakestSkill(
                item,
              ),
          }))
          .sort(
            (first, second) =>
              first.average -
              second.average,
          ),
      [items],
    );

  const topRecommendations =
    recommendations.slice(0, 3);

  return (
    <>
      <PageHeader
        title="Knowledge Map"
        subtitle="See exactly which parts of your vocabulary are strong, weak or still untested."
      />

      {items.length === 0 ? (
        <Card>
          <div className="px-6 py-20 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#FFF0E2] text-[#B85F28]">
              <BrainCircuit size={26} />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-[#1F1D1B]">
              No vocabulary available
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#77716B]">
              Add vocabulary first. Your knowledge map will build itself as you practise.
            </p>

            <Link
              to="/vocabulary"
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1F1D1B] px-5 text-sm font-semibold text-white transition hover:bg-black"
            >
              Open vocabulary
              <ArrowRight size={17} />
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <Card>
              <p className="text-sm font-medium text-[#77716B]">
                Overall knowledge
              </p>

              <p className="mt-3 text-4xl font-bold text-[#1F1D1B]">
                {overallKnowledge}%
              </p>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#F0ECE8]">
                <div
                  className="h-full rounded-full bg-[#E3B48D]"
                  style={{
                    width: `${overallKnowledge}%`,
                  }}
                />
              </div>
            </Card>

            <Card>
              <p className="text-sm font-medium text-[#77716B]">
                Vocabulary profiled
              </p>

              <p className="mt-3 text-4xl font-bold text-[#1F1D1B]">
                {testedVocabularyCount}
              </p>

              <p className="mt-2 text-sm text-[#77716B]">
                of {items.length} saved items
              </p>
            </Card>

            <Card>
              <p className="text-sm font-medium text-[#77716B]">
                Highest-priority skill
              </p>

              <p className="mt-3 text-2xl font-bold text-[#1F1D1B]">
                {topRecommendations[0]?.label ??
                  "No data yet"}
              </p>

              <p className="mt-2 text-sm text-[#77716B]">
                {topRecommendations[0]
                  ? `${topRecommendations[0].averageScore}% estimated mastery`
                  : "Complete practice sessions to generate recommendations."}
              </p>
            </Card>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <Card className="p-0">
              <div className="border-b border-[#ECE8E3] px-6 py-5">
                <h2 className="text-lg font-semibold text-[#1F1D1B]">
                  Skill profile
                </h2>

                <p className="mt-1 text-sm text-[#77716B]">
                  Each skill is measured independently across eligible vocabulary.
                </p>
              </div>

              <div className="divide-y divide-[#F0ECE8]">
                {recommendations.map(
                  (recommendation) => {
                    const status =
                      getStatus(
                        recommendation.averageScore,
                        recommendation.testedItems,
                      );

                    const StatusIcon =
                      status.icon;

                    return (
                      <div
                        key={
                          recommendation.skill
                        }
                        className="px-6 py-5"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-[#1F1D1B]">
                                {
                                  recommendation.label
                                }
                              </h3>

                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}
                              >
                                <StatusIcon
                                  size={13}
                                />
                                {
                                  status.label
                                }
                              </span>
                            </div>

                            <p className="mt-1 text-sm text-[#77716B]">
                              {
                                recommendation.reason
                              }
                            </p>
                          </div>

                          <div className="text-left sm:text-right">
                            <p
                              className={`text-2xl font-bold ${getScoreClassName(
                                recommendation.averageScore,
                              )}`}
                            >
                              {
                                recommendation.averageScore
                              }
                              %
                            </p>

                            <p className="text-xs text-[#938C85]">
                              {
                                recommendation.testedItems
                              }
                              /
                              {
                                recommendation.availableItems
                              }{" "}
                              items tested
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#F0ECE8]">
                          <div
                            className="h-full rounded-full bg-[#E3B48D]"
                            style={{
                              width: `${recommendation.averageScore}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </Card>

            <div className="space-y-6">
              <Card>
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-[#FFF0E2] text-[#B85F28]">
                    <BrainCircuit
                      size={21}
                    />
                  </div>

                  <div>
                    <p className="text-sm text-[#77716B]">
                      Recommended focus
                    </p>

                    <h2 className="text-lg font-semibold text-[#1F1D1B]">
                      Next practice priorities
                    </h2>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {topRecommendations.map(
                    (
                      recommendation,
                      index,
                    ) => (
                      <div
                        key={
                          recommendation.skill
                        }
                        className="rounded-xl border border-[#E8E2DC] bg-[#FCFAF8] p-4"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#FFF0E2] text-xs font-bold text-[#8A5417]">
                            {index + 1}
                          </span>

                          <div>
                            <p className="font-semibold text-[#1F1D1B]">
                              {
                                recommendation.label
                              }
                            </p>

                            <p className="mt-1 text-sm leading-6 text-[#77716B]">
                              {
                                recommendation.reason
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>

                <Link
                  to="/practice"
                  className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1F1D1B] px-4 text-sm font-semibold text-white transition hover:bg-black"
                >
                  Open practice
                  <ArrowRight
                    size={17}
                  />
                </Link>
              </Card>

              <Card>
                <h2 className="text-lg font-semibold text-[#1F1D1B]">
                  How to read this map
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#77716B]">
                  Scores describe specific parts of your knowledge. Knowing a word&apos;s meaning does not automatically mean that you know its article, plural, verb forms or active use.
                </p>
              </Card>
            </div>
          </section>

          <section className="mt-6">
            <Card className="p-0">
              <div className="border-b border-[#ECE8E3] px-6 py-5">
                <h2 className="text-lg font-semibold text-[#1F1D1B]">
                  Vocabulary profiles
                </h2>

                <p className="mt-1 text-sm text-[#77716B]">
                  Items with the lowest estimated knowledge appear first.
                </p>
              </div>

              <div className="divide-y divide-[#F0ECE8]">
                {wordProfiles.map(
                  ({
                    item,
                    average,
                    weakestSkill,
                  }) => (
                    <article
                      key={item.id}
                      className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-[#1F1D1B]">
                            {item.type ===
                            "noun"
                              ? `${item.article} ${item.german}`
                              : item.german}
                          </h3>

                          <span className="rounded-full bg-[#F8F4F0] px-2.5 py-1 text-xs font-medium capitalize text-[#625C56]">
                            {item.type}
                          </span>

                          <span className="rounded-full bg-[#FFF0E2] px-2.5 py-1 text-xs font-semibold text-[#8A5417]">
                            {item.level}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-[#77716B]">
                          Weakest area:{" "}
                          <strong className="font-semibold text-[#4D4843]">
                            {weakestSkill
                              ? skillLabels[
                                  weakestSkill
                                ]
                              : "No eligible skill"}
                          </strong>
                        </p>
                      </div>

                      <div className="sm:text-right">
                        <p
                          className={`text-2xl font-bold ${getScoreClassName(
                            average,
                          )}`}
                        >
                          {average}%
                        </p>

                        <p className="text-xs text-[#938C85]">
                          current profile
                        </p>
                      </div>
                    </article>
                  ),
                )}
              </div>
            </Card>
          </section>
        </>
      )}
    </>
  );
}

export default KnowledgeMapPage;