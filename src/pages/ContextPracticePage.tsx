import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  RefreshCcw,
  XCircle,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

import { usePersonalExamples } from "../features/knowledge/hooks/usePersonalExamples";
import { useMistakeHistory } from "../features/practice/hooks/useMistakeHistory";
import { useVocabulary } from "../features/vocabulary/hooks/useVocabulary";
import PageHeader from "../shared/components/PageHeader";
import Card from "../shared/ui/Card";

import type {
  PersonalExample,
} from "../shared/types/personalExamples";
import type {
  VocabularyItem,
  VocabularyLevel,
} from "../shared/types/vocabulary";

type LevelFilter =
  | "all"
  | VocabularyLevel;

type ContextQuestion = {
  id: string;
  example: PersonalExample;
  item: VocabularyItem;
  prompt: string;
  correctAnswer: string;
};

type ContextResult = {
  question: ContextQuestion;
  userAnswer: string;
  correct: boolean;
};

const MAX_QUESTIONS = 10;

function normalizeAnswer(
  value: string,
) {
  return value
    .trim()
    .toLocaleLowerCase("de-DE")
    .replace(/[.!?]+$/g, "")
    .replace(/\s+/g, " ");
}

function shuffleArray<T>(
  values: T[],
) {
  const copy = [...values];

  for (
    let index = copy.length - 1;
    index > 0;
    index -= 1
  ) {
    const randomIndex =
      Math.floor(
        Math.random() *
          (index + 1),
      );

    [
      copy[index],
      copy[randomIndex],
    ] = [
      copy[randomIndex],
      copy[index],
    ];
  }

  return copy;
}

function ContextPracticePage() {
  const {
    items,
    recordPracticeResult,
  } = useVocabulary();

  const {
    examples,
  } = usePersonalExamples();

  const {
    recordMistake,
    recordCorrectRetry,
  } = useMistakeHistory();

  const [
    selectedLevel,
    setSelectedLevel,
  ] =
    useState<LevelFilter>(
      "all",
    );

  const [
    favoritesOnly,
    setFavoritesOnly,
  ] = useState(false);

  const [
    questions,
    setQuestions,
  ] =
    useState<ContextQuestion[]>(
      [],
    );

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const [
    answer,
    setAnswer,
  ] = useState("");

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    currentCorrect,
    setCurrentCorrect,
  ] = useState(false);

  const [
    results,
    setResults,
  ] =
    useState<ContextResult[]>(
      [],
    );

  const vocabularyById =
    useMemo(
      () =>
        new Map(
          items.map((item) => [
            item.id,
            item,
          ]),
        ),
      [items],
    );

  const eligibleQuestions =
    useMemo(
      () =>
        examples
          .map((example) => {
            const item =
              vocabularyById.get(
                example.vocabularyId,
              );

            if (!item) {
              return null;
            }

            const matchesLevel =
              selectedLevel ===
                "all" ||
              item.level ===
                selectedLevel;

            const matchesFavorite =
              !favoritesOnly ||
              item.favorite;

            const hasPrompt =
              example.romanianTranslation
                .trim().length > 0;

            if (
              !matchesLevel ||
              !matchesFavorite ||
              !hasPrompt
            ) {
              return null;
            }

            return {
              id:
                `${example.id}-${crypto.randomUUID()}`,

              example,

              item,

              prompt:
                example.romanianTranslation,

              correctAnswer:
                example.germanSentence,
            };
          })
          .filter(
            (
              question,
            ): question is ContextQuestion =>
              question !== null,
          ),
      [
        examples,
        vocabularyById,
        selectedLevel,
        favoritesOnly,
      ],
    );

  const currentQuestion =
    questions[currentIndex];

  const started =
    questions.length > 0;

  const finished =
    started &&
    currentIndex >=
      questions.length;

  const correctCount =
    results.filter(
      (result) =>
        result.correct,
    ).length;

  const score =
    results.length > 0
      ? Math.round(
          (correctCount /
            results.length) *
            100,
        )
      : 0;

  function clearAnswer() {
    setAnswer("");
    setSubmitted(false);
    setCurrentCorrect(false);
  }

  function startPractice() {
    setQuestions(
      shuffleArray(
        eligibleQuestions,
      ).slice(
        0,
        MAX_QUESTIONS,
      ),
    );

    setCurrentIndex(0);
    setResults([]);
    clearAnswer();
  }

  function resetPractice() {
    setQuestions([]);
    setCurrentIndex(0);
    setResults([]);
    clearAnswer();
  }

  function submitAnswer() {
    if (
      !currentQuestion ||
      submitted ||
      !answer.trim()
    ) {
      return;
    }

    const isCorrect =
      normalizeAnswer(answer) ===
      normalizeAnswer(
        currentQuestion.correctAnswer,
      );

    setSubmitted(true);
    setCurrentCorrect(isCorrect);

    recordPracticeResult(
      currentQuestion.item.id,
      "sentence",
      isCorrect,
    );

    if (isCorrect) {
      recordCorrectRetry(
        currentQuestion.item.id,
        "sentence",
      );
    } else {
      recordMistake({
        vocabularyId:
          currentQuestion.item.id,

        vocabularyGerman:
          currentQuestion.item.german,

        questionType:
          "sentence",

        userAnswer: answer,

        correctAnswer:
          currentQuestion.correctAnswer,
      });
    }

    setResults(
      (currentResults) => [
        ...currentResults,
        {
          question:
            currentQuestion,

          userAnswer: answer,

          correct: isCorrect,
        },
      ],
    );
  }

  function nextQuestion() {
    setCurrentIndex(
      (index) =>
        index + 1,
    );

    clearAnswer();
  }

  if (!started) {
    return (
      <>
        <PageHeader
          title="Context Practice"
          subtitle="Recall complete German sentences from your own personal examples."
        />

        <Card className="mx-auto max-w-3xl">
          <div className="space-y-7 p-2">
            <section>
              <h2 className="text-lg font-semibold text-[#1F1D1B]">
                How it works
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#77716B]">
                DeutschPal shows the Romanian meaning of one of your personal examples. You reproduce the complete German sentence from memory.
              </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-medium text-[#4D4843]">
                  Level
                </span>

                <select
                  value={
                    selectedLevel
                  }
                  onChange={(event) =>
                    setSelectedLevel(
                      event.target
                        .value as LevelFilter,
                    )
                  }
                  className="min-h-12 w-full rounded-xl border border-[#E4DED8] bg-white px-4 text-sm outline-none transition focus:border-[#E3B48D] focus:ring-4 focus:ring-[#FFF0E2]"
                >
                  <option value="all">
                    All levels
                  </option>

                  <option value="A1">
                    A1
                  </option>

                  <option value="A2">
                    A2
                  </option>

                  <option value="B1">
                    B1
                  </option>

                  <option value="B2">
                    B2
                  </option>

                  <option value="C1">
                    C1
                  </option>

                  <option value="C2">
                    C2
                  </option>
                </select>
              </label>

              <label className="flex min-h-12 items-center gap-3 self-end rounded-xl border border-[#E4DED8] bg-white px-4">
                <input
                  type="checkbox"
                  checked={
                    favoritesOnly
                  }
                  onChange={(event) =>
                    setFavoritesOnly(
                      event.target
                        .checked,
                    )
                  }
                />

                <span className="text-sm font-medium text-[#4D4843]">
                  Favorites only
                </span>
              </label>
            </section>

            <div
              className={
                eligibleQuestions.length >
                0
                  ? "rounded-xl bg-[#F8F4F0] px-4 py-3 text-sm text-[#625C56]"
                  : "rounded-xl border border-amber-100 bg-amber-50 px-4 py-4 text-sm text-amber-700"
              }
            >
              {eligibleQuestions.length >
              0
                ? `${Math.min(
                    eligibleQuestions.length,
                    MAX_QUESTIONS,
                  )} personal examples are ready.`
                : "Add Romanian translations to your personal examples before starting context practice."}
            </div>

            <button
              type="button"
              onClick={startPractice}
              disabled={
                eligibleQuestions.length ===
                0
              }
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1F1D1B] px-5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              Start context practice
              <ArrowRight
                size={18}
              />
            </button>
          </div>
        </Card>
      </>
    );
  }

  if (finished) {
    const mistakes =
      results.filter(
        (result) =>
          !result.correct,
      );

    return (
      <>
        <PageHeader
          title="Context practice complete"
          subtitle="Review your sentence recall results."
        />

        <Card className="mx-auto max-w-3xl">
          <div className="p-2">
            <div className="rounded-2xl bg-[#F8F4F0] px-6 py-8 text-center">
              <p className="text-sm font-medium uppercase tracking-wide text-[#77716B]">
                Sentence recall
              </p>

              <p className="mt-3 text-5xl font-bold text-[#1F1D1B]">
                {score}%
              </p>

              <p className="mt-3 text-sm text-[#625C56]">
                {correctCount} of{" "}
                {results.length} correct
              </p>
            </div>

            {mistakes.length >
            0 ? (
              <section className="mt-8">
                <h2 className="text-lg font-semibold text-[#1F1D1B]">
                  Sentences to repeat
                </h2>

                <div className="mt-4 space-y-3">
                  {mistakes.map(
                    (result) => (
                      <div
                        key={
                          result
                            .question.id
                        }
                        className="rounded-xl border border-red-100 bg-red-50/50 p-4"
                      >
                        <p className="font-semibold text-[#1F1D1B]">
                          {
                            result
                              .question.prompt
                          }
                        </p>

                        <p className="mt-2 text-sm text-red-700">
                          Your answer:{" "}
                          {
                            result.userAnswer
                          }
                        </p>

                        <p className="mt-1 text-sm text-green-700">
                          Correct answer:{" "}
                          {
                            result
                              .question
                              .correctAnswer
                          }
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </section>
            ) : (
              <div className="mt-8 flex items-center justify-center gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-5 text-sm font-medium text-green-700">
                <CheckCircle2
                  size={20}
                />
                Every sentence was correct.
              </div>
            )}

            <button
              type="button"
              onClick={resetPractice}
              className="mt-8 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#E4DED8] bg-white px-5 text-sm font-semibold text-[#4D4843] transition hover:bg-[#F8F4F0]"
            >
              <RefreshCcw
                size={18}
              />
              New context practice
            </button>
          </div>
        </Card>
      </>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <PageHeader
          title="Context Practice"
          subtitle={`Sentence ${
            currentIndex + 1
          } of ${
            questions.length
          }`}
        />

        <button
          type="button"
          onClick={resetPractice}
          className="flex min-h-10 items-center justify-center gap-2 self-start rounded-xl border border-[#E4DED8] bg-white px-4 text-sm font-medium text-[#4D4843] transition hover:bg-[#F8F4F0]"
        >
          <ArrowLeft
            size={16}
          />
          End practice
        </button>
      </div>

      <Card className="mx-auto max-w-3xl">
        <div className="p-2">
          <div className="h-2 overflow-hidden rounded-full bg-[#F0ECE8]">
            <div
              className="h-full rounded-full bg-[#E3B48D]"
              style={{
                width: `${
                  ((currentIndex +
                    1) /
                    questions.length) *
                  100
                }%`,
              }}
            />
          </div>

          <div className="mt-8 text-center">
            <span className="rounded-full bg-[#F1EEF9] px-3 py-1 text-xs font-semibold text-[#67558A]">
              Personal context
            </span>

            <p className="mt-6 text-sm font-medium uppercase tracking-wide text-[#938C85]">
              Reproduce this in German
            </p>

            <h2 className="mt-3 text-2xl font-semibold leading-relaxed text-[#1F1D1B]">
              {
                currentQuestion.prompt
              }
            </h2>

            <p className="mt-3 text-sm text-[#77716B]">
              Target word:{" "}
              <strong className="text-[#4D4843]">
                {
                  currentQuestion
                    .item.german
                }
              </strong>
            </p>
          </div>

          <textarea
            value={answer}
            onChange={(event) => {
              if (!submitted) {
                setAnswer(
                  event.target.value,
                );
              }
            }}
            onKeyDown={(event) => {
              if (
                event.key ===
                  "Enter" &&
                (event.ctrlKey ||
                  event.metaKey) &&
                !submitted
              ) {
                submitAnswer();
              }
            }}
            disabled={submitted}
            autoFocus
            rows={4}
            placeholder="Write the complete German sentence..."
            className="mt-8 w-full resize-none rounded-xl border border-[#E4DED8] bg-white px-4 py-3 text-base outline-none transition focus:border-[#E3B48D] focus:ring-4 focus:ring-[#FFF0E2]"
          />

          <p className="mt-2 text-xs text-[#938C85]">
            Press Ctrl + Enter to check your answer.
          </p>

          {submitted && (
            <div
              className={
                currentCorrect
                  ? "mt-6 rounded-xl border border-green-100 bg-green-50 p-4"
                  : "mt-6 rounded-xl border border-red-100 bg-red-50 p-4"
              }
            >
              <div className="flex gap-3">
                {currentCorrect ? (
                  <CheckCircle2
                    size={22}
                    className="shrink-0 text-green-600"
                  />
                ) : (
                  <XCircle
                    size={22}
                    className="shrink-0 text-red-600"
                  />
                )}

                <div>
                  <p
                    className={
                      currentCorrect
                        ? "font-semibold text-green-800"
                        : "font-semibold text-red-800"
                    }
                  >
                    {currentCorrect
                      ? "Correct sentence."
                      : "The sentence does not match yet."}
                  </p>

                  {!currentCorrect && (
                    <p className="mt-2 text-sm leading-6 text-[#625C56]">
                      Expected:{" "}
                      <strong>
                        {
                          currentQuestion.correctAnswer
                        }
                      </strong>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            {!submitted ? (
              <button
                type="button"
                onClick={submitAnswer}
                disabled={!answer.trim()}
                className="flex min-h-12 items-center gap-2 rounded-xl bg-[#1F1D1B] px-6 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                Check sentence
                <CheckCircle2
                  size={18}
                />
              </button>
            ) : (
              <button
                type="button"
                onClick={nextQuestion}
                className="flex min-h-12 items-center gap-2 rounded-xl bg-[#1F1D1B] px-6 text-sm font-semibold text-white transition hover:bg-black"
              >
                {currentIndex ===
                questions.length - 1
                  ? "View results"
                  : "Next sentence"}

                <ArrowRight
                  size={18}
                />
              </button>
            )}
          </div>
        </div>
      </Card>
    </>
  );
}

export default ContextPracticePage;