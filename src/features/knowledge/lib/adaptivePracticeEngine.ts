import type {
  VocabularyItem,
} from "../../../shared/types/vocabulary";

export type AdaptiveQuestionType =
  | "meaning"
  | "article"
  | "plural"
  | "perfekt"
  | "praeteritum"
  | "comparative";

export interface AdaptivePracticeSelection {
  item: VocabularyItem;
  skill: AdaptiveQuestionType;
  priority: number;
  reason: string;
}

interface AdaptivePracticeOptions {
  maxQuestions?: number;
  level?: string | "all";
  favoritesOnly?: boolean;
  dueOnly?: boolean;
  referenceDate?: Date;
}

const DEFAULT_MAX_QUESTIONS = 10;

const practiceSkills: AdaptiveQuestionType[] = [
  "meaning",
  "article",
  "plural",
  "perfekt",
  "praeteritum",
  "comparative",
];

function clamp(
  value: number,
  minimum: number,
  maximum: number,
) {
  return Math.max(
    minimum,
    Math.min(maximum, value),
  );
}

function isDue(
  item: VocabularyItem,
  referenceDate: Date,
) {
  const nextReview =
    item.review.nextReview;

  if (!nextReview) {
    return true;
  }

  const nextReviewTime =
    new Date(nextReview).getTime();

  if (
    Number.isNaN(nextReviewTime)
  ) {
    return true;
  }

  return (
    nextReviewTime <=
    referenceDate.getTime()
  );
}

function supportsSkill(
  item: VocabularyItem,
  skill: AdaptiveQuestionType,
) {
  switch (skill) {
    case "meaning":
      return (
        Array.isArray(item.meanings) &&
        item.meanings.some(
          (meaning) =>
            meaning.translation
              .trim()
              .length > 0,
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
        item.praeteritum
          .trim()
          .length > 0
      );

    case "comparative":
      return (
        item.type === "adjective" &&
        item.comparative
          .trim()
          .length > 0
      );

    default:
      return false;
  }
}

function calculateSkillPriority(
  item: VocabularyItem,
  skill: AdaptiveQuestionType,
  referenceDate: Date,
) {
  const skillState =
    item.knowledge[skill];

  const masteryPriority =
    100 - skillState.score;

  const untestedPriority =
    skillState.attempts === 0
      ? 30
      : 0;

  const wrongAnswerPriority =
    skillState.wrongAttempts > 0
      ? Math.min(
          25,
          skillState.wrongAttempts * 5,
        )
      : 0;

  const accuracy =
    skillState.attempts > 0
      ? skillState.correctAttempts /
        skillState.attempts
      : null;

  const lowAccuracyPriority =
    accuracy !== null
      ? Math.round(
          (1 - accuracy) * 25,
        )
      : 0;

  const duePriority = isDue(
    item,
    referenceDate,
  )
    ? 20
    : 0;

  const reviewDifficultyPriority =
    Math.round(
      Math.max(
        0,
        2.5 -
          item.review.easeFactor,
      ) * 10,
    );

  return clamp(
    Math.round(
      masteryPriority * 0.55 +
        untestedPriority +
        wrongAnswerPriority +
        lowAccuracyPriority +
        duePriority +
        reviewDifficultyPriority,
    ),
    0,
    100,
  );
}

function createReason(
  item: VocabularyItem,
  skill: AdaptiveQuestionType,
  referenceDate: Date,
) {
  const skillState =
    item.knowledge[skill];

  if (skillState.attempts === 0) {
    return "This skill has not been tested yet.";
  }

  const accuracy =
    skillState.attempts > 0
      ? Math.round(
          (skillState.correctAttempts /
            skillState.attempts) *
            100,
        )
      : 0;

  if (
    skillState.wrongAttempts >
    skillState.correctAttempts
  ) {
    return "Incorrect answers currently outnumber correct answers.";
  }

  if (skillState.score < 35) {
    return "This is a weak area for this vocabulary item.";
  }

  if (accuracy < 60) {
    return "Accuracy is currently below 60%.";
  }

  if (
    isDue(
      item,
      referenceDate,
    )
  ) {
    return "This vocabulary item is due for review.";
  }

  return "This skill would benefit from additional reinforcement.";
}

function createCandidates(
  items: VocabularyItem[],
  referenceDate: Date,
) {
  return items.flatMap((item) =>
    practiceSkills
      .filter((skill) =>
        supportsSkill(
          item,
          skill,
        ),
      )
      .map((skill) => ({
        item,
        skill,
        priority:
          calculateSkillPriority(
            item,
            skill,
            referenceDate,
          ),
        reason: createReason(
          item,
          skill,
          referenceDate,
        ),
      })),
  );
}

function preventExcessiveRepetition(
  selections: AdaptivePracticeSelection[],
  maximumPerItem = 2,
) {
  const itemCounts =
    new Map<string, number>();

  return selections.filter(
    (selection) => {
      const currentCount =
        itemCounts.get(
          selection.item.id,
        ) ?? 0;

      if (
        currentCount >=
        maximumPerItem
      ) {
        return false;
      }

      itemCounts.set(
        selection.item.id,
        currentCount + 1,
      );

      return true;
    },
  );
}

function preventSingleSkillDominance(
  selections: AdaptivePracticeSelection[],
  maximumShare = 0.5,
) {
  if (
    selections.length <= 2
  ) {
    return selections;
  }

  const maximumPerSkill =
    Math.max(
      1,
      Math.ceil(
        selections.length *
          maximumShare,
      ),
    );

  const skillCounts =
    new Map<
      AdaptiveQuestionType,
      number
    >();

  return selections.filter(
    (selection) => {
      const currentCount =
        skillCounts.get(
          selection.skill,
        ) ?? 0;

      if (
        currentCount >=
        maximumPerSkill
      ) {
        return false;
      }

      skillCounts.set(
        selection.skill,
        currentCount + 1,
      );

      return true;
    },
  );
}

export function generateAdaptivePractice(
  vocabulary: VocabularyItem[],
  options: AdaptivePracticeOptions = {},
): AdaptivePracticeSelection[] {
  const {
    maxQuestions =
      DEFAULT_MAX_QUESTIONS,

    level = "all",

    favoritesOnly = false,

    dueOnly = false,

    referenceDate = new Date(),
  } = options;

  const filteredVocabulary =
    vocabulary.filter((item) => {
      const matchesLevel =
        level === "all" ||
        item.level === level;

      const matchesFavorite =
        !favoritesOnly ||
        item.favorite;

      const matchesDue =
        !dueOnly ||
        isDue(
          item,
          referenceDate,
        );

      return (
        matchesLevel &&
        matchesFavorite &&
        matchesDue
      );
    });

  const candidates =
    createCandidates(
      filteredVocabulary,
      referenceDate,
    ).sort(
      (
        firstCandidate,
        secondCandidate,
      ) =>
        secondCandidate.priority -
        firstCandidate.priority,
    );

  const itemBalanced =
    preventExcessiveRepetition(
      candidates,
    );

  const skillBalanced =
    preventSingleSkillDominance(
      itemBalanced,
    );

  return skillBalanced.slice(
    0,
    Math.max(
      1,
      maxQuestions,
    ),
  );
}

export function getAdaptivePracticeSummary(
  selections: AdaptivePracticeSelection[],
) {
  const summary =
    new Map<
      AdaptiveQuestionType,
      number
    >();

  selections.forEach(
    (selection) => {
      summary.set(
        selection.skill,
        (summary.get(
          selection.skill,
        ) ?? 0) + 1,
      );
    },
  );

  return Array.from(
    summary.entries(),
  )
    .map(
      ([skill, count]) => ({
        skill,
        count,
      }),
    )
    .sort(
      (
        firstSummary,
        secondSummary,
      ) =>
        secondSummary.count -
        firstSummary.count,
    );
}

export function getHighestPrioritySelection(
  vocabulary: VocabularyItem[],
) {
  return generateAdaptivePractice(
    vocabulary,
    {
      maxQuestions: 1,
    },
  )[0] ?? null;
}