import type {
  LearningTimelineEvent,
} from "../../../shared/types/learningTimeline";
import type {
  PersonalExample,
} from "../../../shared/types/personalExamples";
import type {
  MistakeRecord,
} from "../../../shared/types/practice";
import type {
  KnowledgeSkill,
  VocabularyItem,
} from "../../../shared/types/vocabulary";

import type {
  LearningAchievement,
  LearningInsight,
  LearningInsightsResult,
  LearningRecommendation,
} from "../types/insights";

const skillLabels: Record<
  KnowledgeSkill,
  string
> = {
  meaning: "Meanings",
  article: "Articles",
  plural: "Plurals",
  perfekt: "Perfekt",
  praeteritum: "Präteritum",
  comparative: "Comparatives",
  recognition: "Recognition",
  recall: "Active recall",
  sentence: "Sentence production",
};

interface SkillProfile {
  skill: KnowledgeSkill;
  averageScore: number;
  totalAttempts: number;
  correctAttempts: number;
  wrongAttempts: number;
  testedItems: number;
}

interface LearningInsightsInput {
  vocabulary: VocabularyItem[];
  mistakes: MistakeRecord[];
  personalExamples: PersonalExample[];
  timelineEvents: LearningTimelineEvent[];
}

function calculatePercentage(
  value: number,
  total: number,
) {
  if (total === 0) {
    return 0;
  }

  return Math.round(
    (value / total) * 100,
  );
}

function getSkillProfiles(
  vocabulary: VocabularyItem[],
): SkillProfile[] {
  const skills: KnowledgeSkill[] = [
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

  return skills.map((skill) => {
    const relevantStates =
      vocabulary
        .map(
          (item) =>
            item.knowledge[skill],
        )
        .filter(
          (state) =>
            state.attempts > 0,
        );

    const testedItems =
      relevantStates.length;

    const totalAttempts =
      relevantStates.reduce(
        (total, state) =>
          total + state.attempts,
        0,
      );

    const correctAttempts =
      relevantStates.reduce(
        (total, state) =>
          total +
          state.correctAttempts,
        0,
      );

    const wrongAttempts =
      relevantStates.reduce(
        (total, state) =>
          total +
          state.wrongAttempts,
        0,
      );

    const averageScore =
      testedItems > 0
        ? Math.round(
            relevantStates.reduce(
              (total, state) =>
                total + state.score,
              0,
            ) / testedItems,
          )
        : 0;

    return {
      skill,
      averageScore,
      totalAttempts,
      correctAttempts,
      wrongAttempts,
      testedItems,
    };
  });
}

function getMasteredVocabulary(
  vocabulary: VocabularyItem[],
) {
  return vocabulary.filter(
    (item) => {
      const testedSkills =
        Object.values(
          item.knowledge,
        ).filter(
          (state) =>
            state.attempts > 0,
        );

      if (
        testedSkills.length === 0
      ) {
        return false;
      }

      const averageScore =
        testedSkills.reduce(
          (total, state) =>
            total + state.score,
          0,
        ) /
        testedSkills.length;

      return (
        averageScore >= 80 &&
        item.review.reviewCount >= 5 &&
        item.review.correctCount >
          item.review.wrongCount
      );
    },
  );
}

function createSkillInsights(
  profiles: SkillProfile[],
): LearningInsight[] {
  const testedProfiles =
    profiles.filter(
      (profile) =>
        profile.testedItems > 0,
    );

  if (
    testedProfiles.length === 0
  ) {
    return [
      {
        id: "insight-no-practice",
        severity: "info",
        title: "Your knowledge profile is still empty",
        description:
          "Complete a practice session to generate personalised learning insights.",
      },
    ];
  }

  const strongestProfile =
    [...testedProfiles].sort(
      (first, second) =>
        second.averageScore -
        first.averageScore,
    )[0];

  const weakestProfile =
    [...testedProfiles].sort(
      (first, second) =>
        first.averageScore -
        second.averageScore,
    )[0];

  const insights: LearningInsight[] =
    [];

  if (
    strongestProfile &&
    strongestProfile.averageScore >= 70
  ) {
    insights.push({
      id: `strength-${strongestProfile.skill}`,
      severity: "positive",
      title: `${skillLabels[strongestProfile.skill]} are currently strong`,
      description: `Your estimated mastery for this skill is ${strongestProfile.averageScore}%.`,
    });
  }

  if (
    weakestProfile &&
    weakestProfile.averageScore < 60
  ) {
    insights.push({
      id: `weakness-${weakestProfile.skill}`,
      severity: "warning",
      title: `${skillLabels[weakestProfile.skill]} need attention`,
      description: `Your estimated mastery for this skill is ${weakestProfile.averageScore}%.`,
    });
  }

  const highAccuracyProfiles =
    testedProfiles.filter(
      (profile) =>
        profile.totalAttempts >= 3 &&
        calculatePercentage(
          profile.correctAttempts,
          profile.totalAttempts,
        ) >= 85,
    );

  if (
    highAccuracyProfiles.length >= 2
  ) {
    insights.push({
      id: "insight-stable-learning",
      severity: "positive",
      title: "Several skills are becoming stable",
      description: `${highAccuracyProfiles.length} skills currently have an accuracy of at least 85%.`,
    });
  }

  return insights;
}

function createMistakeInsights(
  mistakes: MistakeRecord[],
): LearningInsight[] {
  const openMistakes =
    mistakes.filter(
      (mistake) =>
        !mistake.resolved,
    );

  if (
    openMistakes.length === 0
  ) {
    return [];
  }

  const mistakesByType =
    new Map<string, number>();

  openMistakes.forEach(
    (mistake) => {
      mistakesByType.set(
        mistake.questionType,
        (mistakesByType.get(
          mistake.questionType,
        ) ?? 0) +
          mistake.repeatedMistakes,
      );
    },
  );

  const mostFrequentMistake =
    Array.from(
      mistakesByType.entries(),
    ).sort(
      (first, second) =>
        second[1] - first[1],
    )[0];

  const insights: LearningInsight[] =
    [
      {
        id: "insight-open-mistakes",
        severity: "warning",
        title: `${openMistakes.length} unresolved mistakes remain`,
        description:
          "Focused mistake practice can prevent these errors from becoming recurring habits.",
      },
    ];

  if (mostFrequentMistake) {
    const [
      mistakeType,
      mistakeCount,
    ] = mostFrequentMistake;

    insights.push({
      id: `mistake-pattern-${mistakeType}`,
      severity: "warning",
      title: `${skillLabels[mistakeType as KnowledgeSkill] ?? mistakeType} are your most frequent mistake pattern`,
      description: `${mistakeCount} repeated errors are currently connected to this skill.`,
    });
  }

  return insights;
}

function createVocabularyInsights(
  vocabulary: VocabularyItem[],
  personalExamples: PersonalExample[],
): LearningInsight[] {
  const insights: LearningInsight[] =
    [];

  const neverPractised =
    vocabulary.filter(
      (item) =>
        item.review.reviewCount === 0,
    ).length;

  if (neverPractised > 0) {
    insights.push({
      id: "insight-never-practised",
      severity: "info",
      title: `${neverPractised} vocabulary items have never been practised`,
      description:
        "An adaptive session can introduce these items gradually.",
    });
  }

  const wordsWithExamples =
    new Set(
      personalExamples.map(
        (example) =>
          example.vocabularyId,
      ),
    ).size;

  if (
    personalExamples.length > 0
  ) {
    insights.push({
      id: "insight-personal-examples",
      severity: "positive",
      title: `${wordsWithExamples} words are connected to personal examples`,
      description:
        "Personal context supports active recall and sentence production.",
    });
  }

  return insights;
}

function createRecommendations(
  profiles: SkillProfile[],
  mistakes: MistakeRecord[],
  vocabulary: VocabularyItem[],
): LearningRecommendation[] {
  const recommendations:
    LearningRecommendation[] = [];

  const testedProfiles =
    profiles.filter(
      (profile) =>
        profile.testedItems > 0,
    );

  const weakestProfile =
    [...testedProfiles].sort(
      (first, second) =>
        first.averageScore -
        second.averageScore,
    )[0];

  if (weakestProfile) {
    recommendations.push({
      id: `recommendation-${weakestProfile.skill}`,
      priority:
        100 -
        weakestProfile.averageScore,
      title: `Practise ${skillLabels[
        weakestProfile.skill
      ].toLocaleLowerCase()}`,
      description: `This is currently your weakest tested skill at ${weakestProfile.averageScore}% mastery.`,
      actionPath: "/practice",
    });
  }

  const openMistakes =
    mistakes.filter(
      (mistake) =>
        !mistake.resolved,
    );

  if (
    openMistakes.length > 0
  ) {
    recommendations.push({
      id: "recommendation-mistakes",
      priority: Math.min(
        100,
        60 +
          openMistakes.length * 3,
      ),
      title: "Repeat unresolved mistakes",
      description: `${openMistakes.length} mistake records are still open.`,
      actionPath:
        "/practice?mode=mistakes",
    });
  }

  const dueItems =
    vocabulary.filter(
      (item) => {
        if (
          !item.review.nextReview
        ) {
          return true;
        }

        const nextReview =
          new Date(
            item.review.nextReview,
          ).getTime();

        return (
          Number.isNaN(nextReview) ||
          nextReview <= Date.now()
        );
      },
    );

  if (
    dueItems.length > 0
  ) {
    recommendations.push({
      id: "recommendation-due",
      priority: Math.min(
        100,
        50 + dueItems.length * 2,
      ),
      title: "Complete today’s reviews",
      description: `${dueItems.length} vocabulary items are ready for review.`,
      actionPath: "/practice",
    });
  }

  return recommendations.sort(
    (first, second) =>
      second.priority -
      first.priority,
  );
}

function createAchievements(
  vocabulary: VocabularyItem[],
  mistakes: MistakeRecord[],
  personalExamples: PersonalExample[],
  timelineEvents: LearningTimelineEvent[],
): LearningAchievement[] {
  const masteredVocabulary =
    getMasteredVocabulary(
      vocabulary,
    );

  const totalCorrectReviews =
    vocabulary.reduce(
      (total, item) =>
        total +
        item.review.correctCount,
      0,
    );

  const resolvedMistakes =
    mistakes.filter(
      (mistake) =>
        mistake.resolved,
    ).length;

  const firstMasteredDate =
    timelineEvents.find(
      (event) =>
        event.type === "mastered",
    )?.createdAt;

  return [
    {
      id: "achievement-first-word",
      title: "First vocabulary item",
      description:
        "Add your first German vocabulary item.",
      unlocked:
        vocabulary.length >= 1,
      unlockedAt:
        vocabulary[0]?.createdAt,
    },
    {
      id: "achievement-first-mastered",
      title: "First mastered word",
      description:
        "Reach stable mastery for one vocabulary item.",
      unlocked:
        masteredVocabulary.length >= 1,
      unlockedAt:
        firstMasteredDate,
    },
    {
      id: "achievement-ten-mastered",
      title: "Ten mastered words",
      description:
        "Reach stable mastery for ten vocabulary items.",
      unlocked:
        masteredVocabulary.length >= 10,
    },
    {
      id: "achievement-fifty-reviews",
      title: "Fifty correct reviews",
      description:
        "Complete fifty successful vocabulary reviews.",
      unlocked:
        totalCorrectReviews >= 50,
    },
    {
      id: "achievement-ten-examples",
      title: "Personal context builder",
      description:
        "Create ten personal German examples.",
      unlocked:
        personalExamples.length >= 10,
    },
    {
      id: "achievement-ten-corrections",
      title: "Mistake resolver",
      description:
        "Resolve ten recurring mistakes.",
      unlocked:
        resolvedMistakes >= 10,
    },
  ];
}

export function generateLearningInsights({
  vocabulary,
  mistakes,
  personalExamples,
  timelineEvents,
}: LearningInsightsInput): LearningInsightsResult {
  const profiles =
    getSkillProfiles(vocabulary);

  const insights = [
    ...createSkillInsights(
      profiles,
    ),
    ...createMistakeInsights(
      mistakes,
    ),
    ...createVocabularyInsights(
      vocabulary,
      personalExamples,
    ),
  ].slice(0, 6);

  const recommendations =
    createRecommendations(
      profiles,
      mistakes,
      vocabulary,
    ).slice(0, 4);

  const achievements =
    createAchievements(
      vocabulary,
      mistakes,
      personalExamples,
      timelineEvents,
    );

  return {
    insights,
    recommendations,
    achievements,
  };
}