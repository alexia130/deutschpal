import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Home,
  RefreshCcw,
  Volume2,
  RotateCcw,
  XCircle,
} from "lucide-react";
import {
  useState,
} from "react";
import {
  Link,
} from "react-router-dom";

import {
  speakGerman,
} from "../shared/lib/speech";

import {
  getVerbModeLabel,
} from "../features/verbs/lib/verbTrainerEngine";
import {
  useVerbTrainer,
} from "../features/verbs/hooks/useVerbTrainer";
import {
  useVocabulary,
} from "../features/vocabulary/hooks/useVocabulary";
import PageHeader from "../shared/components/PageHeader";
import Card from "../shared/ui/Card";

import type {
  VerbPracticeMode,
} from "../features/verbs/types/verbPractice";
import type {
  VocabularyLevel,
} from "../shared/types/vocabulary";

type LevelFilter =
  | "all"
  | VocabularyLevel;

const modeOptions: {
  value: VerbPracticeMode;
  label: string;
  description: string;
}[] = [
  {
    value: "mixed",
    label: "Mixed",
    description:
      "Alternate between all available verb forms.",
  },
  {
    value: "praeteritum",
    label: "Präteritum",
    description:
      "Write the simple past form.",
  },
  {
    value: "perfekt",
    label: "Perfekt",
    description:
      "Write the complete Perfekt form.",
  },
  {
    value: "partizip",
    label: "Partizip II",
    description:
      "Recall only the participle.",
  },
  {
    value: "auxiliary",
    label: "Auxiliary",
    description:
      "Choose haben, sein or both.",
  },
  {
    value: "translation",
    label: "Meaning",
    description:
      "Translate the German verb into Romanian.",
  },
  {
    value: "infinitive",
    label: "Infinitive",
    description:
      "Produce the German verb from Romanian.",
  },
];

const alphabetLetters = [
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ",
];

function getRomanianTranslation(
  item: {
    meanings: {
      translation: string;
    }[];
  },
) {
  return (
    item.meanings.find(
      (meaning) =>
        meaning.translation.trim()
          .length > 0,
    )?.translation ?? ""
  );
}

function VerbTrainerPage() {
  const {
    items,
    recordPracticeResult,
  } = useVocabulary();

  const {
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
  } = useVerbTrainer(items);

  const [
    selectedMode,
    setSelectedMode,
  ] =
    useState<VerbPracticeMode>(
      "mixed",
    );

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
    selectedInitials,
    setSelectedInitials,
  ] = useState<string[]>([]);

  const [
    answer,
    setAnswer,
  ] = useState("");

  const [
    selectedOption,
    setSelectedOption,
  ] = useState("");

  function toggleInitial(
    initial: string,
  ) {
    setSelectedInitials(
      (currentInitials) =>
        currentInitials.includes(
          initial,
        )
          ? currentInitials.filter(
              (currentInitial) =>
                currentInitial !==
                initial,
            )
          : [
              ...currentInitials,
              initial,
            ],
    );
  }

  function clearInitials() {
    setSelectedInitials([]);
  }

  const verbCount =
    items.filter((item) => {
      if (
        item.type !== "verb"
      ) {
        return false;
      }

      const matchesLevel =
        selectedLevel ===
          "all" ||
        item.level ===
          selectedLevel;

      const matchesFavorite =
        !favoritesOnly ||
        item.favorite;

      const firstLetter =
        item.german
          .trim()
          .charAt(0)
          .toLocaleUpperCase(
            "de-DE",
          );

      const matchesInitial =
        selectedInitials.length ===
          0 ||
        selectedInitials.includes(
          firstLetter,
        );

      return (
        matchesLevel &&
        matchesFavorite &&
        matchesInitial
      );
    }).length;

  function start() {
    setAnswer("");
    setSelectedOption("");

    startTrainer({
      mode: selectedMode,
      maxQuestions: 10,
      level: selectedLevel,
      favoritesOnly,
      initials:
        selectedInitials,
    });
  }

  function checkAnswer() {
    if (!currentQuestion) {
      return;
    }

    const userAnswer =
      currentQuestion.options
        ? selectedOption
        : answer;

    const result =
      submitAnswer(
        userAnswer,
      );

    if (!result) {
      return;
    }

    const knowledgeSkill =
      result.question.mode ===
        "praeteritum"
        ? "praeteritum"
        : result.question.mode ===
            "translation"
          ? "meaning"
          : result.question.mode ===
              "infinitive"
            ? "recall"
            : "perfekt";

    recordPracticeResult(
      result.question.item.id,
      knowledgeSkill,
      result.correct,
    );
  }

  function continuePractice() {
    setAnswer("");
    setSelectedOption("");
    nextQuestion();
  }

  function reset() {
    setAnswer("");
    setSelectedOption("");
    resetTrainer();
  }

  function repeatMistakes() {
    setAnswer("");
    setSelectedOption("");
    retryMistakes();
  }

  if (!started) {
    return (
      <>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <PageHeader
            title="Verb Trainer"
            subtitle="Practise German verb forms separately and discover exactly which form needs more attention."
          />

          <div className="flex flex-wrap gap-2">
            <Link
              to="/vocabulary"
              className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#E4DED8] bg-white px-4 text-sm font-medium text-[#4D4843] transition hover:bg-[#F8F4F0]"
            >
              <ArrowLeft
                size={16}
              />
              Back to vocabulary
            </Link>

            <Link
              to="/"
              className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#E4DED8] bg-white px-4 text-sm font-medium text-[#4D4843] transition hover:bg-[#F8F4F0]"
            >
              <Home
                size={16}
              />
              Home
            </Link>
          </div>
        </div>

        <Card className="mx-auto max-w-4xl">
          <div className="space-y-7 p-2">
            <section>
              <h2 className="text-lg font-semibold text-[#1F1D1B]">
                Training mode
              </h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {modeOptions.map(
                  (option) => {
                    const selected =
                      selectedMode ===
                      option.value;

                    return (
                      <button
                        key={
                          option.value
                        }
                        type="button"
                        onClick={() =>
                          setSelectedMode(
                            option.value,
                          )
                        }
                        className={
                          selected
                            ? "rounded-2xl border border-[#E3B48D] bg-[#FFF0E2] p-4 text-left text-[#7A4B29]"
                            : "rounded-2xl border border-[#E4DED8] bg-white p-4 text-left text-[#4D4843] transition hover:bg-[#F8F4F0]"
                        }
                      >
                        <p className="font-semibold">
                          {
                            option.label
                          }
                        </p>

                        <p className="mt-1 text-sm leading-6 opacity-80">
                          {
                            option.description
                          }
                        </p>
                      </button>
                    );
                  },
                )}
              </div>
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

            <section>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#1F1D1B]">
                    Initial letters
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-[#77716B]">
                    Select one or more starting letters. Leave all unselected to use every verb.
                  </p>
                </div>

                {selectedInitials.length >
                  0 && (
                  <button
                    type="button"
                    onClick={
                      clearInitials
                    }
                    className="self-start text-sm font-medium text-[#B85F28] transition hover:text-[#8A5417]"
                  >
                    Clear letters
                  </button>
                )}
              </div>

              <div className="mt-4 grid grid-cols-7 gap-2 sm:grid-cols-10 lg:grid-cols-13">
                {alphabetLetters.map(
                  (letter) => {
                    const selected =
                      selectedInitials.includes(
                        letter,
                      );

                    return (
                      <button
                        key={letter}
                        type="button"
                        onClick={() =>
                          toggleInitial(
                            letter,
                          )
                        }
                        aria-pressed={
                          selected
                        }
                        className={
                          selected
                            ? "flex aspect-square items-center justify-center rounded-xl border border-[#E3B48D] bg-[#FFF0E2] text-sm font-bold text-[#7A4B29]"
                            : "flex aspect-square items-center justify-center rounded-xl border border-[#E4DED8] bg-white text-sm font-semibold text-[#625C56] transition hover:bg-[#F8F4F0]"
                        }
                      >
                        {letter}
                      </button>
                    );
                  },
                )}
              </div>

              <p className="mt-3 text-sm text-[#77716B]">
                {selectedInitials.length >
                0
                  ? `Selected: ${selectedInitials
                      .sort()
                      .join(", ")}`
                  : "Selected: all letters"}
              </p>
            </section>

            <div className="rounded-xl bg-[#F8F4F0] px-4 py-3 text-sm text-[#625C56]">
              {verbCount > 0
                ? `${Math.min(
                    verbCount,
                    10,
                  )} questions will be generated from ${verbCount} eligible verbs.`
                : "No verbs match the selected filters."}
            </div>

            <button
              type="button"
              onClick={start}
              disabled={
                verbCount === 0
              }
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1F1D1B] px-5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              Start verb training
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
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <PageHeader
            title="Verb training complete"
            subtitle="Review your results and repeat the forms that still need attention."
          />

          <div className="flex flex-wrap gap-2">
            <Link
              to="/verbs"
              onClick={reset}
              className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#E4DED8] bg-white px-4 text-sm font-medium text-[#4D4843] transition hover:bg-[#F8F4F0]"
            >
              <ArrowLeft
                size={16}
              />
              Back
            </Link>

            <Link
              to="/"
              className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#E4DED8] bg-white px-4 text-sm font-medium text-[#4D4843] transition hover:bg-[#F8F4F0]"
            >
              <Home
                size={16}
              />
              Home
            </Link>
          </div>
        </div>

        <Card className="mx-auto max-w-3xl">
          <div className="p-2">
            <div className="rounded-2xl bg-[#F8F4F0] px-6 py-8 text-center">
              <p className="text-sm font-medium uppercase tracking-wide text-[#77716B]">
                Score
              </p>

              <p className="mt-3 text-5xl font-bold text-[#1F1D1B]">
                {
                  summary.scorePercentage
                }
                %
              </p>

              <p className="mt-3 text-sm text-[#625C56]">
                {
                  summary.correctAnswers
                }{" "}
                of{" "}
                {
                  summary.totalQuestions
                }{" "}
                correct
              </p>
            </div>

            {mistakes.length > 0 ? (
              <section className="mt-8">
                <h2 className="text-lg font-semibold text-[#1F1D1B]">
                  Forms to repeat
                </h2>

                <div className="mt-4 space-y-3">
                  {mistakes.map(
                    (result) => (
                      <article
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

                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#938C85]">
                          {getVerbModeLabel(
                            result
                              .question.mode,
                          )}
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
                      </article>
                    ),
                  )}
                </div>
              </section>
            ) : (
              <div className="mt-8 flex items-center justify-center gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-5 text-sm font-medium text-green-700">
                <CheckCircle2
                  size={20}
                />
                Perfect score.
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {mistakes.length >
                0 && (
                <button
                  type="button"
                  onClick={
                    repeatMistakes
                  }
                  className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#1F1D1B] px-5 text-sm font-semibold text-white transition hover:bg-black"
                >
                  <RefreshCcw
                    size={18}
                  />
                  Repeat mistakes
                </button>
              )}

              <button
                type="button"
                onClick={reset}
                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#E4DED8] bg-white px-5 text-sm font-semibold text-[#4D4843] transition hover:bg-[#F8F4F0]"
              >
                <RotateCcw
                  size={18}
                />
                New training
              </button>
            </div>
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
          title="Verb Trainer"
          subtitle={`Question ${
            currentIndex + 1
          } of 10`}
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={reset}
            className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#E4DED8] bg-white px-4 text-sm font-medium text-[#4D4843] transition hover:bg-[#F8F4F0]"
          >
            <ArrowLeft
              size={16}
            />
            Back
          </button>

          <Link
            to="/"
            className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#E4DED8] bg-white px-4 text-sm font-medium text-[#4D4843] transition hover:bg-[#F8F4F0]"
          >
            <Home
              size={16}
            />
            Home
          </Link>

          <button
            type="button"
            onClick={reset}
            className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#E4DED8] bg-white px-4 text-sm font-medium text-[#4D4843] transition hover:bg-[#F8F4F0]"
          >
            <RotateCcw
              size={16}
            />
            End training
          </button>
        </div>
      </div>

      <Card className="mx-auto max-w-3xl">
        <div className="p-2">
          <div className="h-2 overflow-hidden rounded-full bg-[#F0ECE8]">
            <div
              className="h-full rounded-full bg-[#E3B48D] transition-all"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="mt-8 text-center">
            <span className="rounded-full bg-[#FFF0E2] px-3 py-1 text-xs font-semibold text-[#8A5417]">
              {getVerbModeLabel(
                currentQuestion.mode,
              )}
            </span>

            <div className="mt-6 flex items-center justify-center gap-3">
              <h2 className="text-3xl font-semibold leading-relaxed text-[#1F1D1B]">
                {
                  currentQuestion.prompt
                }
              </h2>

              {currentQuestion.mode !==
                "infinitive" && (
                  <button
                    type="button"
                    onClick={() =>
                      speakGerman(
                        currentQuestion.item
                          .german,
                      )
                    }
                    className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#E4DED8] bg-white text-[#625C56] transition hover:bg-[#F8F4F0] hover:text-[#1F1D1B]"
                    aria-label={`Play pronunciation for ${currentQuestion.item.german}`}
                    title="Play pronunciation"
                  >
                    <Volume2
                      size={20}
                    />
                  </button>
                )}
            </div>

            {currentQuestion.mode !==
              "infinitive" &&
              getRomanianTranslation(
                currentQuestion.item,
              ) && (
                <p className="mt-3 text-base font-medium text-[#625C56]">
                  {
                    getRomanianTranslation(
                      currentQuestion.item,
                    )
                  }
                </p>
              )}

            <p className="mt-3 text-sm text-[#77716B]">
              Level{" "}
              {
                currentQuestion
                  .item.level
              }
            </p>
          </div>

          <div className="mt-8">
            {currentQuestion.options ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {currentQuestion.options.map(
                  (option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        if (
                          !submitted
                        ) {
                          setSelectedOption(
                            option,
                          );
                        }
                      }}
                      disabled={
                        submitted
                      }
                      className={
                        selectedOption ===
                        option
                          ? "min-h-14 rounded-xl border border-[#E3B48D] bg-[#FFF0E2] px-4 text-lg font-semibold text-[#7A4B29]"
                          : "min-h-14 rounded-xl border border-[#E4DED8] bg-white px-4 text-lg font-semibold text-[#4D4843] transition hover:bg-[#F8F4F0]"
                      }
                    >
                      {option}
                    </button>
                  ),
                )}
              </div>
            ) : (
              <input
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
                    !submitted
                  ) {
                    checkAnswer();
                  }
                }}
                disabled={submitted}
                autoFocus
                placeholder="Type your answer..."
                className="min-h-14 w-full rounded-xl border border-[#E4DED8] bg-white px-4 text-base outline-none transition focus:border-[#E3B48D] focus:ring-4 focus:ring-[#FFF0E2]"
              />
            )}
          </div>

          {submitted && (
            <div
              className={
                lastAnswerCorrect
                  ? "mt-6 rounded-xl border border-green-100 bg-green-50 p-4"
                  : "mt-6 rounded-xl border border-red-100 bg-red-50 p-4"
              }
            >
              <div className="flex gap-3">
                {lastAnswerCorrect ? (
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
                      lastAnswerCorrect
                        ? "font-semibold text-green-800"
                        : "font-semibold text-red-800"
                    }
                  >
                    {lastAnswerCorrect
                      ? "Correct!"
                      : "Not quite."}
                  </p>

                  {!lastAnswerCorrect && (
                    <p className="mt-1 text-sm text-[#625C56]">
                      Correct answer:{" "}
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
                onClick={
                  checkAnswer
                }
                disabled={
                  currentQuestion.options
                    ? !selectedOption
                    : !answer.trim()
                }
                className="flex min-h-12 items-center gap-2 rounded-xl bg-[#1F1D1B] px-6 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                Check answer
                <CheckCircle2
                  size={18}
                />
              </button>
            ) : (
              <button
                type="button"
                onClick={
                  continuePractice
                }
                className="flex min-h-12 items-center gap-2 rounded-xl bg-[#1F1D1B] px-6 text-sm font-semibold text-white transition hover:bg-black"
              >
                {currentIndex === 9
                  ? "View results"
                  : "Next question"}

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

export default VerbTrainerPage;