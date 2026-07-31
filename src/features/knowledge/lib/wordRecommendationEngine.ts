import type {
  KnowledgeSkill,
  VocabularyItem,
} from "../../../shared/types/vocabulary";

export interface WordRecommendation {
  skill: KnowledgeSkill;
  label: string;
  score: number;
  attempts: number;
  priority: number;
  reason: string;
  action: string;
}

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

function supportsSkill(
  item: VocabularyItem,
  skill: KnowledgeSkill,
) {
  switch (skill) {
    case "meaning":
      return item.meanings.some(
        (meaning) =>
          meaning.translation.trim()
            .length > 0,
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
        item.praeteritum.trim().length >
          0
      );

    case "comparative":
      return (
        item.type === "adjective" &&
        item.comparative.trim().length >
          0
      );

    case "recognition":
    case "recall":
    case "sentence":
      return true;

    default:
      return false;
  }
}

function getAction(
  skill: KnowledgeSkill,
) {
  switch (skill) {
    case "meaning":
      return "Practise recalling the Romanian meaning without looking at examples.";

    case "article":
      return "Say the noun together with its article before checking the answer.";

    case "plural":
      return "Write the singular and plural together and mark any stem or umlaut change.";

    case "perfekt":
      return "Practise the complete Perfekt form, including the auxiliary.";

    case "praeteritum":
      return "Write the infinitive and Präteritum form as a pair.";

    case "comparative":
      return "Practise the positive, comparative and superlative forms together.";

    case "recognition":
      return "Read the word in short examples and identify its meaning quickly.";

    case "recall":
      return "Start from the Romanian meaning and produce the German word from memory.";

    case "sentence":
      return "Write one original German sentence using this vocabulary item.";

    default:
      return "Practise this skill again.";
  }
}

function getReason(
  score: number,
  attempts: number,
  wrongAttempts: number,
) {
  if (attempts === 0) {
    return "This part of the word has not been tested yet.";
  }

  if (wrongAttempts > attempts / 2) {
    return "Most attempts for this skill have been incorrect.";
  }

  if (score < 35) {
    return "This is currently a weak part of the word.";
  }

  if (score < 60) {
    return "This skill is developing but still unstable.";
  }

  if (score < 80) {
    return "This skill is usable, but not yet automatic.";
  }

  return "This skill is currently strong.";
}

export function getWordRecommendations(
  item: VocabularyItem,
): WordRecommendation[] {
  const skills = (
    Object.keys(
      item.knowledge,
    ) as KnowledgeSkill[]
  ).filter((skill) =>
    supportsSkill(item, skill),
  );

  return skills
    .map((skill) => {
      const state =
        item.knowledge[skill];

      const untestedBonus =
        state.attempts === 0
          ? 25
          : 0;

      const errorBonus = Math.min(
        25,
        state.wrongAttempts * 5,
      );

      const priority = Math.min(
        100,
        Math.round(
          (100 - state.score) * 0.7 +
            untestedBonus +
            errorBonus,
        ),
      );

      return {
        skill,
        label: skillLabels[skill],
        score: state.score,
        attempts: state.attempts,
        priority,
        reason: getReason(
          state.score,
          state.attempts,
          state.wrongAttempts,
        ),
        action: getAction(skill),
      };
    })
    .sort(
      (first, second) =>
        second.priority -
        first.priority,
    );
}

export function getPrimaryWordRecommendation(
  item: VocabularyItem,
) {
  return (
    getWordRecommendations(item)[0] ??
    null
  );
}