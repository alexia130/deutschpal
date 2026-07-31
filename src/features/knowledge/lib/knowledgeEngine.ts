import type {
  KnowledgeSkill,
  KnowledgeSkillState,
  VocabularyKnowledge,
} from "../../../shared/types/vocabulary";

const MIN_SCORE = 0;
const MAX_SCORE = 100;

function clampScore(value: number) {
  return Math.max(
    MIN_SCORE,
    Math.min(MAX_SCORE, Math.round(value)),
  );
}

function getSafeInteger(
  value: number,
  fallback = 0,
) {
  if (
    !Number.isFinite(value) ||
    value < 0
  ) {
    return fallback;
  }

  return Math.floor(value);
}

function normalizeSkillState(
  skill: KnowledgeSkillState,
): KnowledgeSkillState {
  return {
    score: clampScore(
      Number.isFinite(skill.score)
        ? skill.score
        : 0,
    ),

    attempts: getSafeInteger(
      skill.attempts,
    ),

    correctAttempts: getSafeInteger(
      skill.correctAttempts,
    ),

    wrongAttempts: getSafeInteger(
      skill.wrongAttempts,
    ),

    lastTestedAt:
      typeof skill.lastTestedAt ===
      "string"
        ? skill.lastTestedAt
        : null,
  };
}

function calculateCorrectIncrease(
  score: number,
  attempts: number,
) {
  const remainingScore =
    MAX_SCORE - score;

  const baseIncrease = Math.max(
    2,
    remainingScore * 0.12,
  );

  const attemptMultiplier =
    attempts === 0
      ? 1.2
      : attempts < 3
        ? 1.1
        : 1;

  return Math.max(
    2,
    Math.round(
      baseIncrease *
        attemptMultiplier,
    ),
  );
}

function calculateWrongDecrease(
  score: number,
  attempts: number,
) {
  const baseDecrease = Math.max(
    5,
    score * 0.16,
  );

  const attemptMultiplier =
    attempts >= 5
      ? 1.1
      : 1;

  return Math.max(
    5,
    Math.round(
      baseDecrease *
        attemptMultiplier,
    ),
  );
}

export function updateKnowledgeSkill(
  currentSkill: KnowledgeSkillState,
  correct: boolean,
  testedAt = new Date(),
): KnowledgeSkillState {
  const normalizedSkill =
    normalizeSkillState(
      currentSkill,
    );

  const scoreChange = correct
    ? calculateCorrectIncrease(
        normalizedSkill.score,
        normalizedSkill.attempts,
      )
    : -calculateWrongDecrease(
        normalizedSkill.score,
        normalizedSkill.attempts,
      );

  return {
    score: clampScore(
      normalizedSkill.score +
        scoreChange,
    ),

    attempts:
      normalizedSkill.attempts + 1,

    correctAttempts:
      normalizedSkill.correctAttempts +
      (correct ? 1 : 0),

    wrongAttempts:
      normalizedSkill.wrongAttempts +
      (correct ? 0 : 1),

    lastTestedAt:
      testedAt.toISOString(),
  };
}

export function updateKnowledge(
  knowledge: VocabularyKnowledge,
  skill: KnowledgeSkill,
  correct: boolean,
  testedAt = new Date(),
): VocabularyKnowledge {
  return {
    ...knowledge,

    [skill]: updateKnowledgeSkill(
      knowledge[skill],
      correct,
      testedAt,
    ),
  };
}

export function getSkillAccuracy(
  skill: KnowledgeSkillState,
) {
  const attempts = getSafeInteger(
    skill.attempts,
  );

  if (attempts === 0) {
    return null;
  }

  const correctAttempts =
    getSafeInteger(
      skill.correctAttempts,
    );

  return Math.round(
    (correctAttempts / attempts) *
      100,
  );
}

export function getKnowledgeAverage(
  knowledge: VocabularyKnowledge,
) {
  const skills =
    Object.values(knowledge);

  if (skills.length === 0) {
    return 0;
  }

  const totalScore =
    skills.reduce(
      (total, skill) =>
        total +
        clampScore(skill.score),
      0,
    );

  return Math.round(
    totalScore / skills.length,
  );
}