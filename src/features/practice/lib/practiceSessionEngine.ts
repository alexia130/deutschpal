import type {
  AdaptiveQuestionType,
} from "../../knowledge/lib/adaptivePracticeEngine";

import type {
  PracticeAnswer,
  PracticeQuestion,
  PracticeSession,
  PracticeSkillSummary,
  PracticeSummary,
} from "../types/practiceSession";

interface RecordPracticeAnswerInput {
  questionId: string;

  userAnswer: string;

  correct: boolean;

  responseTime: number;

  answeredAt?: Date;
}

function clampResponseTime(
  value: number,
) {
  if (
    !Number.isFinite(value) ||
    value < 0
  ) {
    return 0;
  }

  return Math.round(value);
}

function calculatePercentage(
  correctAnswers: number,
  totalAnswers: number,
) {
  if (totalAnswers === 0) {
    return 0;
  }

  return Math.round(
    (correctAnswers /
      totalAnswers) *
      100,
  );
}

function calculateAverage(
  values: number[],
) {
  if (values.length === 0) {
    return 0;
  }

  const total = values.reduce(
    (sum, value) =>
      sum + value,
    0,
  );

  return Math.round(
    total / values.length,
  );
}

function getQuestionById(
  session: PracticeSession,
  questionId: string,
) {
  return session.questions.find(
    (question) =>
      question.id === questionId,
  );
}

function hasAnswerForQuestion(
  session: PracticeSession,
  questionId: string,
) {
  return session.answers.some(
    (answer) =>
      answer.questionId ===
      questionId,
  );
}

function createSkillSummary(
  skill: AdaptiveQuestionType,
  answers: PracticeAnswer[],
): PracticeSkillSummary {
  const skillAnswers =
    answers.filter(
      (answer) =>
        answer.skill === skill,
    );

  const correctAnswers =
    skillAnswers.filter(
      (answer) =>
        answer.correct,
    ).length;

  const incorrectAnswers =
    skillAnswers.length -
    correctAnswers;

  const responseTimes =
    skillAnswers.map(
      (answer) =>
        answer.responseTime,
    );

  return {
    skill,

    totalAnswers:
      skillAnswers.length,

    correctAnswers,

    incorrectAnswers,

    accuracy:
      calculatePercentage(
        correctAnswers,
        skillAnswers.length,
      ),

    averageResponseTime:
      calculateAverage(
        responseTimes,
      ),
  };
}

function getSkillSummaries(
  answers: PracticeAnswer[],
) {
  const skills = Array.from(
    new Set(
      answers.map(
        (answer) =>
          answer.skill,
      ),
    ),
  );

  return skills.map((skill) =>
    createSkillSummary(
      skill,
      answers,
    ),
  );
}

function getStrongestSkill(
  summaries:
    PracticeSkillSummary[],
) {
  if (summaries.length === 0) {
    return null;
  }

  return [...summaries].sort(
    (
      firstSummary,
      secondSummary,
    ) => {
      if (
        secondSummary.accuracy !==
        firstSummary.accuracy
      ) {
        return (
          secondSummary.accuracy -
          firstSummary.accuracy
        );
      }

      if (
        firstSummary
          .averageResponseTime !==
        secondSummary
          .averageResponseTime
      ) {
        return (
          firstSummary
            .averageResponseTime -
          secondSummary
            .averageResponseTime
        );
      }

      return (
        secondSummary.totalAnswers -
        firstSummary.totalAnswers
      );
    },
  )[0].skill;
}

function getWeakestSkill(
  summaries:
    PracticeSkillSummary[],
) {
  if (summaries.length === 0) {
    return null;
  }

  return [...summaries].sort(
    (
      firstSummary,
      secondSummary,
    ) => {
      if (
        firstSummary.accuracy !==
        secondSummary.accuracy
      ) {
        return (
          firstSummary.accuracy -
          secondSummary.accuracy
        );
      }

      if (
        secondSummary
          .averageResponseTime !==
        firstSummary
          .averageResponseTime
      ) {
        return (
          secondSummary
            .averageResponseTime -
          firstSummary
            .averageResponseTime
        );
      }

      return (
        secondSummary.totalAnswers -
        firstSummary.totalAnswers
      );
    },
  )[0].skill;
}

export function createPracticeSession(
  questions: PracticeQuestion[],
  startedAt = new Date(),
): PracticeSession {
  return {
    id:
      crypto.randomUUID(),

    startedAt:
      startedAt.toISOString(),

    finishedAt: null,

    questions: [...questions],

    answers: [],
  };
}

export function recordPracticeAnswer(
  session: PracticeSession,
  input: RecordPracticeAnswerInput,
): PracticeSession {
  if (session.finishedAt) {
    return session;
  }

  const question =
    getQuestionById(
      session,
      input.questionId,
    );

  if (!question) {
    return session;
  }

  if (
    hasAnswerForQuestion(
      session,
      input.questionId,
    )
  ) {
    return session;
  }

  const answer:
    PracticeAnswer = {
    questionId:
      question.id,

    vocabularyId:
      question.item.id,

    skill:
      question.skill,

    mode:
      question.mode,

    userAnswer:
      input.userAnswer.trim(),

    correctAnswer:
      question.correctAnswer,

    correct:
      input.correct,

    responseTime:
      clampResponseTime(
        input.responseTime,
      ),

    answeredAt:
      (
        input.answeredAt ??
        new Date()
      ).toISOString(),
  };

  return {
    ...session,

    answers: [
      ...session.answers,
      answer,
    ],
  };
}

export function finishPracticeSession(
  session: PracticeSession,
  finishedAt = new Date(),
): PracticeSession {
  if (session.finishedAt) {
    return session;
  }

  return {
    ...session,

    finishedAt:
      finishedAt.toISOString(),
  };
}

export function calculatePracticeSummary(
  session: PracticeSession,
): PracticeSummary {
  const answeredQuestions =
    session.answers.length;

  const correctAnswers =
    session.answers.filter(
      (answer) =>
        answer.correct,
    ).length;

  const incorrectAnswers =
    answeredQuestions -
    correctAnswers;

  const unansweredQuestions =
    Math.max(
      0,
      session.questions.length -
        answeredQuestions,
    );

  const responseTimes =
    session.answers.map(
      (answer) =>
        answer.responseTime,
    );

  const totalResponseTime =
    responseTimes.reduce(
      (sum, responseTime) =>
        sum + responseTime,
      0,
    );

  const skillSummaries =
    getSkillSummaries(
      session.answers,
    );

  return {
    totalQuestions:
      session.questions.length,

    answeredQuestions,

    correctAnswers,

    incorrectAnswers,

    unansweredQuestions,

    accuracy:
      calculatePercentage(
        correctAnswers,
        answeredQuestions,
      ),

    averageResponseTime:
      calculateAverage(
        responseTimes,
      ),

    totalResponseTime,

    fastestResponseTime:
      responseTimes.length > 0
        ? Math.min(
            ...responseTimes,
          )
        : null,

    slowestResponseTime:
      responseTimes.length > 0
        ? Math.max(
            ...responseTimes,
          )
        : null,

    strongestSkill:
      getStrongestSkill(
        skillSummaries,
      ),

    weakestSkill:
      getWeakestSkill(
        skillSummaries,
      ),

    skillSummaries,
  };
}

export function getCurrentQuestion(
  session: PracticeSession,
) {
  return (
    session.questions.find(
      (question) =>
        !hasAnswerForQuestion(
          session,
          question.id,
        ),
    ) ?? null
  );
}

export function getAnsweredQuestionCount(
  session: PracticeSession,
) {
  return session.answers.length;
}

export function getRemainingQuestionCount(
  session: PracticeSession,
) {
  return Math.max(
    0,
    session.questions.length -
      session.answers.length,
  );
}

export function isPracticeSessionComplete(
  session: PracticeSession,
) {
  return (
    session.questions.length > 0 &&
    session.answers.length >=
      session.questions.length
  );
}

export function getPracticeProgress(
  session: PracticeSession,
) {
  if (
    session.questions.length === 0
  ) {
    return 0;
  }

  return Math.round(
    (session.answers.length /
      session.questions.length) *
      100,
  );
}