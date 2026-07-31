import {
  useMemo,
  useState,
} from "react";

import {
  calculateVerbSummary,
  createVerbQuestions,
  isVerbAnswerCorrect,
} from "../lib/verbTrainerEngine";

import type {
  VerbPracticeMode,
  VerbPracticeQuestion,
  VerbPracticeResult,
} from "../types/verbPractice";
import type {
  VocabularyItem,
} from "../../../shared/types/vocabulary";

interface StartVerbTrainerOptions {
  mode: VerbPracticeMode;
  maxQuestions?: number;
  favoritesOnly?: boolean;
  level?: string | "all";
  initials?: string[];
}

export function useVerbTrainer(
  vocabulary: VocabularyItem[],
) {
  const [
    questions,
    setQuestions,
  ] =
    useState<
      VerbPracticeQuestion[]
    >([]);

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const [
    results,
    setResults,
  ] =
    useState<
      VerbPracticeResult[]
    >([]);

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

  const currentQuestion =
    questions[currentIndex];

  const started =
    questions.length > 0;

  const finished =
    started &&
    currentIndex >=
      questions.length;

  const summary =
    useMemo(
      () =>
        calculateVerbSummary(
          results,
        ),
      [results],
    );

  const progress =
    questions.length > 0
      ? Math.round(
          (Math.min(
            currentIndex + 1,
            questions.length,
          ) /
            questions.length) *
            100,
        )
      : 0;

  function startTrainer(
    options: StartVerbTrainerOptions,
  ) {
    const generatedQuestions =
      createVerbQuestions(
        vocabulary,
        options,
      );

    setQuestions(
      generatedQuestions,
    );
    setCurrentIndex(0);
    setResults([]);
    setSubmitted(false);
    setLastAnswerCorrect(null);
  }

  function submitAnswer(
    userAnswer: string,
  ) {
    if (
      !currentQuestion ||
      submitted ||
      !userAnswer.trim()
    ) {
      return null;
    }

    const correct =
      isVerbAnswerCorrect(
        userAnswer,
        currentQuestion.correctAnswer,
      );

    setResults(
      (currentResults) => [
        ...currentResults,
        {
          question:
            currentQuestion,
          userAnswer,
          correct,
        },
      ],
    );

    setSubmitted(true);
    setLastAnswerCorrect(
      correct,
    );

    return {
      question:
        currentQuestion,
      correct,
    };
  }

  function nextQuestion() {
    if (!submitted) {
      return;
    }

    setCurrentIndex(
      (index) =>
        index + 1,
    );
    setSubmitted(false);
    setLastAnswerCorrect(null);
  }

  function resetTrainer() {
    setQuestions([]);
    setCurrentIndex(0);
    setResults([]);
    setSubmitted(false);
    setLastAnswerCorrect(null);
  }

  function retryMistakes() {
    const mistakeQuestions =
      results
        .filter(
          (result) =>
            !result.correct,
        )
        .map(
          (result) => ({
            ...result.question,
            id:
              `${result.question.id}-${crypto.randomUUID()}`,
          }),
        );

    setQuestions(
      mistakeQuestions,
    );
    setCurrentIndex(0);
    setResults([]);
    setSubmitted(false);
    setLastAnswerCorrect(null);
  }

  return {
    questions,
    currentQuestion,
    currentIndex,
    results,
    summary,
    progress,
    started,
    finished,
    submitted,
    lastAnswerCorrect,
    startTrainer,
    submitAnswer,
    nextQuestion,
    resetTrainer,
    retryMistakes,
  };
}