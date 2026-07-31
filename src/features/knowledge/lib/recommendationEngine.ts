import type {
  KnowledgeSkill,
  VocabularyItem,
} from "../../../shared/types/vocabulary";

export interface KnowledgeRecommendation {
  skill: KnowledgeSkill;
  label: string;
  averageScore: number;
  testedItems: number;
  availableItems: number;
  priority: number;
  reason: string;
}

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

const trackedSkills: KnowledgeSkill[] = [
  "meaning",
  "article",
  "plural",
  "perfekt",
  "praeteritum",
  "comparative",
  "recognition",
  "recall",
  "sentence",
];

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

function createReason(
  averageScore: number,
  testedItems: number,
  availableItems: number,
) {
  if (availableItems === 0) {
    return "No eligible vocabulary is available for this skill.";
  }

  if (testedItems === 0) {
    return "This skill has not been tested yet.";
  }

  if (averageScore < 35) {
    return "This is currently one of your weakest skills.";
  }

  if (averageScore < 60) {
    return "This skill is developing but still needs focused practice.";
  }

  if (averageScore < 80) {
    return "This skill is stable, but not yet automatic.";
  }

  return "This skill is currently strong.";
}

export function calculateKnowledgeRecommendations(
  vocabulary: VocabularyItem[],
): KnowledgeRecommendation[] {
  return trackedSkills
    .map((skill) => {
      const eligibleItems = vocabulary.filter(
        (item) => supportsSkill(item, skill),
      );

      const testedItems = eligibleItems.filter(
        (item) =>
          item.knowledge[skill].attempts > 0,
      );

      const totalScore = testedItems.reduce(
        (sum, item) =>
          sum + item.knowledge[skill].score,
        0,
      );

      const averageScore =
        testedItems.length > 0
          ? Math.round(
              totalScore / testedItems.length,
            )
          : 0;

      const coverage =
        eligibleItems.length > 0
          ? testedItems.length /
            eligibleItems.length
          : 0;

      const weaknessWeight =
        100 - averageScore;

      const coverageWeight =
        Math.round((1 - coverage) * 35);

      const priority = Math.min(
        100,
        Math.round(
          weaknessWeight * 0.75 +
            coverageWeight,
        ),
      );

      return {
        skill,
        label: skillLabels[skill],
        averageScore,
        testedItems: testedItems.length,
        availableItems: eligibleItems.length,
        priority,
        reason: createReason(
          averageScore,
          testedItems.length,
          eligibleItems.length,
        ),
      };
    })
    .filter(
      (recommendation) =>
        recommendation.availableItems > 0,
    )
    .sort(
      (first, second) =>
        second.priority - first.priority,
    );
}