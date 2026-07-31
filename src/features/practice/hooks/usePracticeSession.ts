import {
  useMemo,
  useRef,
  useState,
} from "react";

import {
  createCorrectEvent,
  createMistakeEvent,
} from "../../timeline/lib/timelineEvents";
import {
  useLearningTimeline,
} from "../../timeline/hooks/useLearningTimeline";
import {
  useVocabulary,
} from "../../vocabulary/hooks/useVocabulary";
import {
  useMistakeHistory,
} from "./useMistakeHistory";

import {
  calculatePracticeSummary,
  createPracticeSession,
  finishPracticeSession,
  getCurrentQuestion,
  getPracticeProgress,
  isPracticeSessionComplete,
  recordPracticeAnswer,
} from "../lib/practiceSessionEngine";

import type {
  PracticeQuestion,
  PracticeSession,
  PracticeSummary,
} from "../types/practiceSession";

interface SubmitAnswerInput {
  userAnswer: string;
  correct: boolean;
}

export function usePracticeSession() {
  const {
    recordPracticeResult,
  } = useVocabulary();

  const {
    recordMistake,
    recordCorrectRetry,
  } = useMistakeHistory();

  const {
    addEvent,
  } = useLearningTimeline();

  const [
    session,
    setSession,
  ] =
    useState<PracticeSession | null>(
      null,
    );

  const [
    summary,
    setSummary,
  ] =
    useState<PracticeSummary | null>(
      null,
    );

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    lastAnswerCorrect,
    setLastAnswerCorrect,
  ] =
    useState<boolean | null>(
      null,
    );

  const questionStartedAtRef =
    useRef<number | null>(null);

  function startQuestionTimer() {
    questionStartedAtRef.current =
      performance.now();
  }

  function resetQuestionState() {
    setSubmitted(false);
    setLastAnswerCorrect(null);
    startQuestionTimer();
  }

  function startSession(
    questions: PracticeQuestion[],
  ) {
    if (
      questions.length === 0
    ) {
      return;
    }

    const newSession =
      createPracticeSession(
        questions,
      );

    setSession(newSession);
    setSummary(null);

    resetQuestionState();
  }

  function submitAnswer({
    userAnswer,
    correct,
  }: SubmitAnswerInput) {
    if (
      !session ||
      submitted
    ) {
      return;
    }

    const currentQuestion =
      getCurrentQuestion(session);

    if (!currentQuestion) {
      return;
    }

    const answeredAt =
      new Date();

    const responseTime =
      questionStartedAtRef.current !==
      null
        ? Math.max(
            0,
            Math.round(
              performance.now() -
                questionStartedAtRef.current,
            ),
          )
        : 0;

    const updatedSession =
      recordPracticeAnswer(
        session,
        {
          questionId:
            currentQuestion.id,

          userAnswer,

          correct,

          responseTime,

          answeredAt,
        },
      );

    setSession(updatedSession);
    setSubmitted(true);
    setLastAnswerCorrect(correct);

    recordPracticeResult(
      currentQuestion.item.id,
      currentQuestion.skill,
      correct,
    );

    if (correct) {
      recordCorrectRetry(
        currentQuestion.item.id,
        currentQuestion.skill,
      );

      addEvent(
        createCorrectEvent(
          currentQuestion.item.id,
          currentQuestion.item.german,
          currentQuestion.skill,
        ),
      );
    } else {
      recordMistake({
        vocabularyId:
          currentQuestion.item.id,

        vocabularyGerman:
          currentQuestion.item.german,

        questionType:
          currentQuestion.skill,

        userAnswer,

        correctAnswer:
          currentQuestion.correctAnswer,
      });

      addEvent(
        createMistakeEvent(
          currentQuestion.item.id,
          currentQuestion.item.german,
          currentQuestion.skill,
          userAnswer,
          currentQuestion.correctAnswer,
        ),
      );
    }
  }

  function continueSession() {
    if (
      !session ||
      !submitted
    ) {
      return;
    }

    const complete =
      isPracticeSessionComplete(
        session,
      );

    if (complete) {
      finishSession();
      return;
    }

    resetQuestionState();
  }

  function finishSession() {
    if (!session) {
      return;
    }

    const finishedSession =
      finishPracticeSession(
        session,
      );

    const sessionSummary =
      calculatePracticeSummary(
        finishedSession,
      );

    setSession(
      finishedSession,
    );

    setSummary(
      sessionSummary,
    );

    setSubmitted(false);
    setLastAnswerCorrect(null);

    questionStartedAtRef.current =
      null;
  }

  function restartSession() {
    setSession(null);
    setSummary(null);
    setSubmitted(false);
    setLastAnswerCorrect(null);

    questionStartedAtRef.current =
      null;
  }

  const currentQuestion =
    useMemo(() => {
      if (!session) {
        return null;
      }

      return getCurrentQuestion(
        session,
      );
    }, [session]);

  const progress =
    useMemo(() => {
      if (!session) {
        return 0;
      }

      return getPracticeProgress(
        session,
      );
    }, [session]);

  const completed =
    useMemo(() => {
      if (!session) {
        return false;
      }

      return isPracticeSessionComplete(
        session,
      );
    }, [session]);

  const started =
    session !== null;

  const finished =
    session?.finishedAt !== null &&
    session?.finishedAt !==
      undefined;

  const currentQuestionNumber =
    session
      ? Math.min(
          session.answers.length + 1,
          session.questions.length,
        )
      : 0;

  const totalQuestions =
    session?.questions.length ?? 0;

  return {
    session,

    summary,

    currentQuestion,

    currentQuestionNumber,

    totalQuestions,

    progress,

    started,

    completed,

    finished,

    submitted,

    lastAnswerCorrect,

    startSession,

    submitAnswer,

    continueSession,

    finishSession,

    restartSession,
  };
}