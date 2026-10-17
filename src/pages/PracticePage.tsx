import {
  ArrowRight,
  BrainCircuit,
  CalendarClock,
  CircleAlert,
  CheckCircle2,
  RefreshCcw,
  RotateCcw,
  Shuffle,
  XCircle,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";

import {
  generateAdaptivePractice,
  getAdaptivePracticeSummary,
} from "../features/knowledge/lib/adaptivePracticeEngine";
import { useMistakeHistory } from "../features/practice/hooks/useMistakeHistory";
import { usePracticeHistory } from "../features/practice/hooks/usePracticeHistory";
import { useVocabulary } from "../features/vocabulary/hooks/useVocabulary";
import PageHeader from "../shared/components/PageHeader";
import Card from "../shared/ui/Card";

import type {
  VocabularyItem,
  VocabularyLevel,
} from "../shared/types/vocabulary";
import type { SavedPracticeType } from "../shared/types/practice";

type PracticeType = SavedPracticeType;

type QuestionType = Exclude<
  PracticeType,
  "mixed"
>;

type PracticeMode =
  | "adaptive"
  | "mistakes"
  | "random"
  | "review";

type PracticeLevelFilter =
  | "all"
  | VocabularyLevel;

type Question = {
  id: string;
  item: VocabularyItem;
  type: QuestionType;
  prompt: string;
  correctAnswer: string;
  options?: string[];
};

type AnswerResult = {
  question: Question;
  userAnswer: string;
  correct: boolean;
};

const MAX_QUESTIONS = 10;

const practiceOptions: {
  value: PracticeType;
  label: string;
}[] = [
  {
    value: "mixed",
    label: "Mixed",
  },
  {
    value: "meaning",
    label: "Meanings",
  },
  {
    value: "article",
    label: "Articles",
  },
  {
    value: "plural",
    label: "Plural",
  },
  {
    value: "perfekt",
    label: "Perfekt",
  },
  {
    value: "praeteritum",
    label: "Präteritum",
  },
  {
    value: "comparative",
    label: "Comparative",
  },
];

function normalizeAnswer(
  value: string,
) {
  return value
    .trim()
    .toLocaleLowerCase("de-DE")
    .replace(/\s+/g, " ");
}

function shuffleArray<T>(
  items: T[],
) {
  const copy = [...items];

  for (
    let currentIndex =
      copy.length - 1;
    currentIndex > 0;
    currentIndex -= 1
  ) {
    const randomIndex =
      Math.floor(
        Math.random() *
          (currentIndex + 1),
      );

    [
      copy[currentIndex],
      copy[randomIndex],
    ] = [
      copy[randomIndex],
      copy[currentIndex],
    ];
  }

  return copy;
}

function getMeanings(
  item: VocabularyItem,
) {
  return Array.isArray(
    item.meanings,
  )
    ? item.meanings
    : [];
}

function getRomanianTranslation(
  item: VocabularyItem,
) {
  return (
    getMeanings(item).find(
      (meaning) =>
        meaning.translation
          .trim()
          .length > 0,
    )?.translation ?? ""
  );
}

function getAvailableQuestionTypes(
  item: VocabularyItem,
): QuestionType[] {
  const types: QuestionType[] =
    [];

  const hasMeaning =
    getMeanings(item).some(
      (meaning) =>
        meaning.translation
          ?.trim()
          .length > 0,
    );

  if (hasMeaning) {
    types.push("meaning");
  }

  if (item.type === "noun") {
    if (item.article) {
      types.push("article");
    }

    if (
      item.plural?.trim().length >
      0
    ) {
      types.push("plural");
    }
  }

  if (item.type === "verb") {
    if (
      item.perfekt?.trim().length >
      0
    ) {
      types.push("perfekt");
    }

    if (
      item.praeteritum?.trim()
        .length > 0
    ) {
      types.push(
        "praeteritum",
      );
    }
  }

  if (
    item.type === "adjective" &&
    item.comparative?.trim()
      .length > 0
  ) {
    types.push("comparative");
  }

  return types;
}

function supportsPracticeType(
  item: VocabularyItem,
  practiceType: PracticeType,
) {
  const availableTypes =
    getAvailableQuestionTypes(
      item,
    );

  if (
    practiceType === "mixed"
  ) {
    return (
      availableTypes.length > 0
    );
  }

  return availableTypes.includes(
    practiceType,
  );
}

function createQuestion(
  item: VocabularyItem,
  requestedType: PracticeType,
): Question | null {
  const availableTypes =
    getAvailableQuestionTypes(
      item,
    );

  if (
    availableTypes.length === 0
  ) {
    return null;
  }

  const questionType =
    requestedType === "mixed"
      ? availableTypes[
          Math.floor(
            Math.random() *
              availableTypes.length,
          )
        ]
      : requestedType;

  if (
    !questionType ||
    !availableTypes.includes(
      questionType,
    )
  ) {
    return null;
  }

  const questionId =
    `${item.id}-${questionType}-${crypto.randomUUID()}`;

  if (
    questionType === "meaning"
  ) {
    const availableMeanings =
      getMeanings(item).filter(
        (meaning) =>
          meaning.translation
            ?.trim()
            .length > 0,
      );

    if (
      availableMeanings.length ===
      0
    ) {
      return null;
    }

    const selectedMeaning =
      availableMeanings[
        Math.floor(
          Math.random() *
            availableMeanings.length,
        )
      ];

    if (!selectedMeaning) {
      return null;
    }

    return {
      id: questionId,
      item,
      type: "meaning",
      prompt: item.german,
      correctAnswer:
        selectedMeaning.translation,
    };
  }

  if (
    questionType === "article" &&
    item.type === "noun"
  ) {
    return {
      id: questionId,
      item,
      type: "article",
      prompt: item.german,
      correctAnswer: item.article,
      options: [
        "der",
        "die",
        "das",
      ],
    };
  }

  if (
    questionType === "plural" &&
    item.type === "noun"
  ) {
    return {
      id: questionId,
      item,
      type: "plural",
      prompt: item.german,
      correctAnswer: item.plural,
    };
  }

  if (
    questionType === "perfekt" &&
    item.type === "verb"
  ) {
    return {
      id: questionId,
      item,
      type: "perfekt",
      prompt: item.german,
      correctAnswer: item.perfekt,
    };
  }

  if (
    questionType ===
      "praeteritum" &&
    item.type === "verb"
  ) {
    return {
      id: questionId,
      item,
      type: "praeteritum",
      prompt: item.german,
      correctAnswer:
        item.praeteritum,
    };
  }

  if (
    questionType ===
      "comparative" &&
    item.type ===
      "adjective"
  ) {
    return {
      id: questionId,
      item,
      type: "comparative",
      prompt: item.german,
      correctAnswer:
        item.comparative,
    };
  }

  return null;
}

function filterEligibleItems(
  items: VocabularyItem[],
  practiceType: PracticeType,
  selectedLevel: PracticeLevelFilter,
  favoritesOnly: boolean,
) {
  return items.filter((item) => {
    const matchesLevel =
      selectedLevel === "all" ||
      item.level === selectedLevel;

    const matchesFavorite =
      !favoritesOnly ||
      item.favorite;

    return (
      matchesLevel &&
      matchesFavorite &&
      supportsPracticeType(
        item,
        practiceType,
      )
    );
  });
}

function createQuestions(
  items: VocabularyItem[],
  practiceType: PracticeType,
  selectedLevel: PracticeLevelFilter,
  favoritesOnly: boolean,
) {
  const eligibleItems =
    filterEligibleItems(
      items,
      practiceType,
      selectedLevel,
      favoritesOnly,
    );

  return shuffleArray(
    eligibleItems,
  )
    .slice(0, MAX_QUESTIONS)
    .map((item) =>
      createQuestion(
        item,
        practiceType,
      ),
    )
    .filter(
      (
        question,
      ): question is Question =>
        question !== null,
    );
}

function getQuestionTypeLabel(
  type: QuestionType,
) {
  switch (type) {
    case "meaning":
      return "Romanian meaning";

    case "article":
      return "Choose the article";

    case "plural":
      return "Write the plural";

    case "perfekt":
      return "Write the Perfekt form";

    case "praeteritum":
      return "Write the Präteritum form";

    case "comparative":
      return "Write the comparative";

    default:
      return "Practice";
  }
}

function getAnswerPlaceholder(
  type: QuestionType,
) {
  switch (type) {
    case "meaning":
      return "Write the Romanian meaning...";

    case "plural":
      return "Write the plural form...";

    case "perfekt":
      return "Write the Perfekt form...";

    case "praeteritum":
      return "Write the Präteritum form...";

    case "comparative":
      return "Write the comparative form...";

    default:
      return "Type your answer...";
  }
}

function PracticePage() {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const {
    items,
    recordPracticeResult,
    getDueItems,
  } = useVocabulary();

  const { addSession } =
    usePracticeHistory();

  const {
    mistakes,
    recordMistake,
    recordCorrectRetry,
  } = useMistakeHistory();

  const requestedMode =
    searchParams.get("mode");

  const initialPracticeMode:
    PracticeMode =
      requestedMode ===
      "mistakes"
        ? "mistakes"
        : "adaptive";

  const [
    practiceMode,
    setPracticeMode,
  ] =
    useState<PracticeMode>(
      initialPracticeMode,
    );

  const [
    activePracticeMode,
    setActivePracticeMode,
  ] =
    useState<PracticeMode>(
      initialPracticeMode,
    );

  const [
    practiceType,
    setPracticeType,
  ] =
    useState<PracticeType>(
      "mixed",
    );

  const [
    selectedLevel,
    setSelectedLevel,
  ] =
    useState<PracticeLevelFilter>(
      "all",
    );

  const [
    favoritesOnly,
    setFavoritesOnly,
  ] = useState(false);

  const [
    questions,
    setQuestions,
  ] = useState<Question[]>([]);

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const [answer, setAnswer] =
    useState("");

  const [
    selectedOption,
    setSelectedOption,
  ] = useState("");

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    currentAnswerCorrect,
    setCurrentAnswerCorrect,
  ] = useState(false);

  const [
    results,
    setResults,
  ] =
    useState<AnswerResult[]>(
      [],
    );

  const savedResultRef =
    useRef(false);

  const currentQuestion =
    questions[currentIndex];

  const practiceStarted =
    questions.length > 0;

  const practiceFinished =
    practiceStarted &&
    currentIndex >=
      questions.length;

  const dueItems = getDueItems();

  const openMistakeSelections =
    useMemo(() => {
      const vocabularyById =
        new Map(
          items.map((item) => [
            item.id,
            item,
          ]),
        );

      return mistakes
        .filter(
          (mistake) =>
            !mistake.resolved,
        )
        .map((mistake) => {
          const item =
            vocabularyById.get(
              mistake.vocabularyId,
            );

          if (!item) {
            return null;
          }

          return {
            item,
            skill:
              mistake.questionType,
            priority:
              mistake.repeatedMistakes *
                10 -
              mistake.correctRetries *
                4,
          };
        })
        .filter(
          (
            selection,
          ): selection is {
            item: VocabularyItem;
            skill: QuestionType;
            priority: number;
          } =>
            selection !== null,
        )
        .sort(
          (
            firstSelection,
            secondSelection,
          ) =>
            secondSelection.priority -
            firstSelection.priority,
        );
    }, [items, mistakes]);

  const sourceItems =
    practiceMode === "review"
      ? dueItems
      : items;

  const adaptiveSelections =
    useMemo(
      () =>
        generateAdaptivePractice(
          items,
          {
            maxQuestions:
              MAX_QUESTIONS,
            level:
              selectedLevel,
            favoritesOnly,
          },
        ),
      [
        items,
        selectedLevel,
        favoritesOnly,
      ],
    );

  const adaptiveSummary =
    useMemo(
      () =>
        getAdaptivePracticeSummary(
          adaptiveSelections,
        ),
      [adaptiveSelections],
    );

  const eligibleItemsCount =
    useMemo(() => {
      if (
        practiceMode ===
        "adaptive"
      ) {
        return adaptiveSelections.length;
      }

      if (
        practiceMode ===
        "mistakes"
      ) {
        return Math.min(
          openMistakeSelections.length,
          MAX_QUESTIONS,
        );
      }

      return filterEligibleItems(
        sourceItems,
        practiceType,
        selectedLevel,
        favoritesOnly,
      ).length;
    }, [
      adaptiveSelections,
      openMistakeSelections,
      sourceItems,
      practiceMode,
      practiceType,
      selectedLevel,
      favoritesOnly,
    ]);

  const correctAnswersCount =
    results.filter(
      (result) =>
        result.correct,
    ).length;

  const scorePercentage =
    results.length > 0
      ? Math.round(
          (correctAnswersCount /
            results.length) *
            100,
        )
      : 0;

  useEffect(() => {
    if (
      !practiceFinished ||
      results.length === 0 ||
      savedResultRef.current
    ) {
      return;
    }

    savedResultRef.current =
      true;

    addSession({
      completedAt:
        new Date().toISOString(),

      practiceType,

      level: selectedLevel,

      favoritesOnly,

      totalQuestions:
        results.length,

      correctAnswers:
        correctAnswersCount,

      incorrectAnswers:
        results.length -
        correctAnswersCount,

      scorePercentage,
    });
  }, [
    addSession,
    correctAnswersCount,
    favoritesOnly,
    practiceFinished,
    practiceType,
    results.length,
    scorePercentage,
    selectedLevel,
  ]);

  function clearCurrentAnswer() {
    setAnswer("");
    setSelectedOption("");
    setSubmitted(false);

    setCurrentAnswerCorrect(
      false,
    );
  }

  function startPractice() {
    const generatedQuestions =
      practiceMode === "adaptive"
        ? adaptiveSelections
            .map((selection) =>
              createQuestion(
                selection.item,
                selection.skill,
              ),
            )
            .filter(
              (
                question,
              ): question is Question =>
                question !== null,
            )
        : practiceMode ===
            "mistakes"
          ? openMistakeSelections
              .slice(
                0,
                MAX_QUESTIONS,
              )
              .map((selection) =>
                createQuestion(
                  selection.item,
                  selection.skill,
                ),
              )
              .filter(
                (
                  question,
                ): question is Question =>
                  question !== null,
              )
          : createQuestions(
            sourceItems,
            practiceType,
            selectedLevel,
            favoritesOnly,
          );

    savedResultRef.current =
      false;

    setActivePracticeMode(
      practiceMode,
    );

    setQuestions(
      generatedQuestions,
    );

    setCurrentIndex(0);

    clearCurrentAnswer();

    setResults([]);
  }

  function resetPractice() {
    savedResultRef.current =
      false;

    setQuestions([]);

    setCurrentIndex(0);

    clearCurrentAnswer();

    setResults([]);
  }

  function submitAnswer() {
    if (
      !currentQuestion ||
      submitted
    ) {
      return;
    }

    const userAnswer =
      currentQuestion.options
        ? selectedOption
        : answer;

    if (!userAnswer.trim()) {
      return;
    }

    const isCorrect =
      normalizeAnswer(
        userAnswer,
      ) ===
      normalizeAnswer(
        currentQuestion.correctAnswer,
      );

    setCurrentAnswerCorrect(
      isCorrect,
    );

    setSubmitted(true);

    recordPracticeResult(
      currentQuestion.item.id,
      currentQuestion.type,
      isCorrect,
    );

    if (isCorrect) {
      recordCorrectRetry(
        currentQuestion.item.id,
        currentQuestion.type,
      );
    } else {
      recordMistake({
        vocabularyId:
          currentQuestion.item.id,

        vocabularyGerman:
          currentQuestion.item.german,

        questionType:
          currentQuestion.type,

        userAnswer,

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

          userAnswer,

          correct: isCorrect,
        },
      ],
    );
  }

  function goToNextQuestion() {
    setCurrentIndex(
      (index) => index + 1,
    );

    clearCurrentAnswer();
  }

  function practiceMistakesAgain() {
    const mistakeQuestions =
      results
        .filter(
          (result) =>
            !result.correct,
        )
        .map((result) => ({
          ...result.question,

          id: `${result.question.item.id}-${result.question.type}-${crypto.randomUUID()}`,
        }));

    savedResultRef.current =
      false;

    setQuestions(
      shuffleArray(
        mistakeQuestions,
      ),
    );

    setCurrentIndex(0);

    clearCurrentAnswer();

    setResults([]);
  }

  if (!practiceStarted) {
    return (
      <>
        <PageHeader
          title="Practice"
          subtitle="Test and strengthen your German vocabulary."
        />

        <Card className="mx-auto max-w-3xl">
          <div className="space-y-7 p-2">
            <section>
              <h2 className="text-lg font-semibold text-[#1F1D1B]">
                Practice mode
              </h2>

              <p className="mt-1 text-sm text-[#77716B]">
                Let DeutschPal choose your weakest skills, practise freely or review due vocabulary.
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <button
                  type="button"
                  onClick={() => {
                    setPracticeMode(
                      "adaptive",
                    );
                    setSearchParams({});
                  }}
                  className={
                    practiceMode ===
                    "adaptive"
                      ? "rounded-2xl border border-[#E3B48D] bg-[#FFF0E2] p-5 text-left text-[#7A4B29]"
                      : "rounded-2xl border border-[#E4DED8] bg-white p-5 text-left text-[#4D4843] transition hover:bg-[#F8F4F0]"
                  }
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/70">
                      <BrainCircuit
                        size={21}
                      />
                    </div>

                    <div>
                      <p className="font-semibold">
                        Adaptive practice
                      </p>

                      <p className="mt-1 text-sm leading-6 opacity-80">
                        DeutschPal selects the skills that currently need the most attention.
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPracticeMode(
                      "mistakes",
                    );
                    setSearchParams({
                      mode: "mistakes",
                    });
                  }}
                  className={
                    practiceMode ===
                    "mistakes"
                      ? "rounded-2xl border border-[#E3B48D] bg-[#FFF0E2] p-5 text-left text-[#7A4B29]"
                      : "rounded-2xl border border-[#E4DED8] bg-white p-5 text-left text-[#4D4843] transition hover:bg-[#F8F4F0]"
                  }
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/70">
                      <CircleAlert
                        size={21}
                      />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">
                          Mistake practice
                        </p>

                        <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-bold">
                          {
                            openMistakeSelections.length
                          }
                        </span>
                      </div>

                      <p className="mt-1 text-sm leading-6 opacity-80">
                        Practise unresolved mistakes, starting with the most repeated ones.
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPracticeMode(
                      "random",
                    );
                    setSearchParams({});
                  }}
                  className={
                    practiceMode ===
                    "random"
                      ? "rounded-2xl border border-[#E3B48D] bg-[#FFF0E2] p-5 text-left text-[#7A4B29]"
                      : "rounded-2xl border border-[#E4DED8] bg-white p-5 text-left text-[#4D4843] transition hover:bg-[#F8F4F0]"
                  }
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/70">
                      <Shuffle
                        size={21}
                      />
                    </div>

                    <div>
                      <p className="font-semibold">
                        Random practice
                      </p>

                      <p className="mt-1 text-sm leading-6 opacity-80">
                        Practise any
                        eligible vocabulary
                        from your collection.
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPracticeMode(
                      "review",
                    );
                    setSearchParams({});
                  }}
                  className={
                    practiceMode ===
                    "review"
                      ? "rounded-2xl border border-[#E3B48D] bg-[#FFF0E2] p-5 text-left text-[#7A4B29]"
                      : "rounded-2xl border border-[#E4DED8] bg-white p-5 text-left text-[#4D4843] transition hover:bg-[#F8F4F0]"
                  }
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/70">
                      <CalendarClock
                        size={21}
                      />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">
                          Today&apos;s review
                        </p>

                        <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-bold">
                          {dueItems.length}
                        </span>
                      </div>

                      <p className="mt-1 text-sm leading-6 opacity-80">
                        Review vocabulary
                        that is new, due
                        today or overdue.
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </section>

            {practiceMode !==
              "adaptive" &&
              practiceMode !==
                "mistakes" && (
              <section>
                <h2 className="text-lg font-semibold text-[#1F1D1B]">
                  Practice type
                </h2>

              <p className="mt-1 text-sm text-[#77716B]">
                Choose the information
                you want to practise.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {practiceOptions.map(
                  (option) => {
                    const selected =
                      practiceType ===
                      option.value;

                    return (
                      <button
                        key={
                          option.value
                        }
                        type="button"
                        onClick={() =>
                          setPracticeType(
                            option.value,
                          )
                        }
                        className={
                          selected
                            ? "rounded-xl border border-[#E3B48D] bg-[#FFF0E2] px-4 py-3 text-left text-sm font-semibold text-[#7A4B29]"
                            : "rounded-xl border border-[#E4DED8] bg-white px-4 py-3 text-left text-sm font-medium text-[#4D4843] transition hover:bg-[#F8F4F0]"
                        }
                      >
                        {
                          option.label
                        }
                      </button>
                    );
                  },
                )}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-lg font-semibold text-[#1F1D1B]">
                Filters
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="mb-2 block text-sm font-medium text-[#4D4843]">
                    Level
                  </span>

                  <select
                    value={
                      selectedLevel
                    }
                    onChange={(
                      event,
                    ) =>
                      setSelectedLevel(
                        event.target
                          .value as PracticeLevelFilter,
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
                    onChange={(
                      event,
                    ) =>
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
              </div>
            </section>

            {practiceMode ===
              "mistakes" &&
              openMistakeSelections.length >
                0 && (
                <div className="rounded-2xl border border-red-100 bg-red-50/40 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-white text-red-600">
                      <CircleAlert
                        size={19}
                      />
                    </div>

                    <div>
                      <h2 className="font-semibold text-[#1F1D1B]">
                        Unresolved mistake session
                      </h2>

                      <p className="mt-0.5 text-sm text-[#77716B]">
                        The most persistent mistakes are selected first.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {practiceMode ===
              "adaptive" &&
              adaptiveSummary.length >
                0 && (
                <div className="rounded-2xl border border-[#E8E2DC] bg-[#FCFAF8] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#FFF0E2] text-[#B85F28]">
                      <BrainCircuit
                        size={19}
                      />
                    </div>

                    <div>
                      <h2 className="font-semibold text-[#1F1D1B]">
                        Your adaptive session
                      </h2>

                      <p className="mt-0.5 text-sm text-[#77716B]">
                        Selected from your current knowledge profile.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {adaptiveSummary.map(
                      (summary) => (
                        <span
                          key={
                            summary.skill
                          }
                          className="rounded-full border border-[#E8E2DC] bg-white px-3 py-1.5 text-sm font-medium capitalize text-[#625C56]"
                        >
                          {summary.skill}:{" "}
                          {summary.count}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}

            <div
              className={
                eligibleItemsCount > 0
                  ? "rounded-xl bg-[#F8F4F0] px-4 py-3 text-sm text-[#625C56]"
                  : practiceMode ===
                      "review" &&
                    dueItems.length === 0
                    ? "rounded-xl border border-green-100 bg-green-50 px-4 py-4 text-sm text-green-700"
                    : "rounded-xl border border-amber-100 bg-amber-50 px-4 py-4 text-sm text-amber-700"
              }
            >
              {eligibleItemsCount >
              0
                ? practiceMode ===
                    "adaptive"
                  ? `${eligibleItemsCount} adaptive questions were selected from your weakest eligible skills.`
                  : practiceMode ===
                      "mistakes"
                    ? `${eligibleItemsCount} unresolved mistakes were selected for focused practice.`
                    : `${Math.min(
                      eligibleItemsCount,
                      MAX_QUESTIONS,
                    )} questions will be generated.`
                : practiceMode ===
                    "mistakes"
                  ? "You have no unresolved mistakes to practise."
                  : practiceMode ===
                      "review" &&
                    dueItems.length ===
                      0
                  ? "You have completed all reviews for today."
                  : practiceMode ===
                      "review"
                    ? "No due vocabulary items match the selected type and filters."
                    : "No vocabulary items match these options."}
            </div>

            <button
              type="button"
              onClick={
                startPractice
              }
              disabled={
                eligibleItemsCount ===
                0
              }
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1F1D1B] px-5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              {practiceMode ===
              "adaptive"
                ? "Start adaptive practice"
                : practiceMode ===
                    "mistakes"
                  ? "Start mistake practice"
                  : practiceMode ===
                      "review"
                    ? "Start today’s review"
                    : "Start practice"}

              <ArrowRight
                size={18}
              />
            </button>
          </div>
        </Card>
      </>
    );
  }

  if (practiceFinished) {
    const mistakes =
      results.filter(
        (result) =>
          !result.correct,
      );

    return (
      <>
        <PageHeader
          title={
            activePracticeMode ===
            "adaptive"
              ? "Adaptive practice complete"
              : activePracticeMode ===
                  "mistakes"
                ? "Mistake practice complete"
                : activePracticeMode ===
                    "review"
                ? "Review complete"
                : "Practice complete"
          }
          subtitle="Review your score and incorrect answers."
        />

        <Card className="mx-auto max-w-3xl">
          <div className="p-2">
            <div className="rounded-2xl bg-[#F8F4F0] px-6 py-8 text-center">
              <p className="text-sm font-medium uppercase tracking-wide text-[#77716B]">
                Score
              </p>

              <p className="mt-3 text-5xl font-bold text-[#1F1D1B]">
                {
                  scorePercentage
                }
                %
              </p>

              <p className="mt-3 text-sm text-[#625C56]">
                {
                  correctAnswersCount
                }{" "}
                of {results.length}{" "}
                correct
              </p>
            </div>

            {activePracticeMode ===
              "review" && (
              <div className="mt-6 rounded-xl border border-[#E8E2DC] bg-white px-4 py-4 text-center text-sm text-[#625C56]">
                Your spaced-repetition
                schedule has been updated
                for every answered word.
              </div>
            )}

            {mistakes.length >
            0 ? (
              <section className="mt-8">
                <h2 className="text-lg font-semibold text-[#1F1D1B]">
                  Mistakes
                </h2>

                <div className="mt-4 space-y-3">
                  {mistakes.map(
                    (result) => (
                      <div
                        key={
                          result
                            .question
                            .id
                        }
                        className="rounded-xl border border-red-100 bg-red-50/50 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <XCircle
                            size={20}
                            className="mt-0.5 shrink-0 text-red-600"
                          />

                          <div>
                            <p className="font-semibold text-[#1F1D1B]">
                              {
                                result
                                  .question
                                  .item
                                  .german
                              }
                            </p>

                            <p className="mt-1 text-sm text-red-700">
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
                        </div>
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

                Perfect score. No
                mistakes.
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {mistakes.length >
                0 && (
                <button
                  type="button"
                  onClick={
                    practiceMistakesAgain
                  }
                  className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#1F1D1B] px-5 text-sm font-semibold text-white transition hover:bg-black"
                >
                  <RefreshCcw
                    size={18}
                  />

                  Practice mistakes
                  again
                </button>
              )}

              <button
                type="button"
                onClick={
                  resetPractice
                }
                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#E4DED8] bg-white px-5 text-sm font-semibold text-[#4D4843] transition hover:bg-[#F8F4F0]"
              >
                <RotateCcw
                  size={18}
                />

                New practice
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
          title={
            activePracticeMode ===
            "adaptive"
              ? "Adaptive practice"
              : activePracticeMode ===
                  "mistakes"
                ? "Mistake practice"
                : activePracticeMode ===
                    "review"
                ? "Today’s review"
                : "Practice"
          }
          subtitle={`Question ${
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
          <RotateCcw
            size={16}
          />

          End practice
        </button>
      </div>

      <Card className="mx-auto max-w-3xl">
        <div className="p-2">
          <div className="h-2 overflow-hidden rounded-full bg-[#F0ECE8]">
            <div
              className="h-full rounded-full bg-[#E3B48D] transition-all"
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

          <div className="mt-8">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {activePracticeMode ===
                "review" && (
                <span className="rounded-full bg-[#F1EEF9] px-3 py-1 text-xs font-semibold text-[#67558A]">
                  Scheduled review
                </span>
              )}

              {activePracticeMode ===
                "adaptive" && (
                <span className="rounded-full bg-[#F1EEF9] px-3 py-1 text-xs font-semibold text-[#67558A]">
                  Adaptive selection
                </span>
              )}

              {activePracticeMode ===
                "mistakes" && (
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                  Mistake memory
                </span>
              )}

              <span className="rounded-full bg-[#FFF0E2] px-3 py-1 text-xs font-semibold text-[#8A5417]">
                {getQuestionTypeLabel(
                  currentQuestion.type,
                )}
              </span>
            </div>

            <h2 className="mt-5 text-center text-3xl font-semibold leading-relaxed text-[#1F1D1B]">
              {
                currentQuestion.prompt
              }
            </h2>

            {currentQuestion.type !==
              "meaning" &&
              getRomanianTranslation(
                currentQuestion.item,
              ) && (
                <p className="mt-3 text-center text-base font-medium text-[#625C56]">
                  {
                    getRomanianTranslation(
                      currentQuestion.item,
                    )
                  }
                </p>
              )}

            <p className="mt-3 text-center text-sm text-[#77716B]">
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
                  (option) => {
                    const selected =
                      selectedOption ===
                      option;

                    return (
                      <button
                        key={
                          option
                        }
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
                          selected
                            ? "min-h-14 rounded-xl border border-[#E3B48D] bg-[#FFF0E2] px-4 text-lg font-semibold text-[#7A4B29]"
                            : "min-h-14 rounded-xl border border-[#E4DED8] bg-white px-4 text-lg font-semibold text-[#4D4843] transition hover:bg-[#F8F4F0] disabled:cursor-default"
                        }
                      >
                        {option}
                      </button>
                    );
                  },
                )}
              </div>
            ) : (
              <input
                value={answer}
                onChange={(
                  event,
                ) => {
                  if (!submitted) {
                    setAnswer(
                      event.target
                        .value,
                    );
                  }
                }}
                onKeyDown={(
                  event,
                ) => {
                  if (
                    event.key ===
                      "Enter" &&
                    !submitted
                  ) {
                    submitAnswer();
                  }
                }}
                disabled={submitted}
                autoFocus
                placeholder={getAnswerPlaceholder(
                  currentQuestion.type,
                )}
                className="min-h-14 w-full rounded-xl border border-[#E4DED8] bg-white px-4 text-base outline-none transition focus:border-[#E3B48D] focus:ring-4 focus:ring-[#FFF0E2]"
              />
            )}
          </div>

          {submitted && (
            <div
              className={
                currentAnswerCorrect
                  ? "mt-6 rounded-xl border border-green-100 bg-green-50 p-4"
                  : "mt-6 rounded-xl border border-red-100 bg-red-50 p-4"
              }
            >
              <div className="flex gap-3">
                {currentAnswerCorrect ? (
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
                      currentAnswerCorrect
                        ? "font-semibold text-green-800"
                        : "font-semibold text-red-800"
                    }
                  >
                    {currentAnswerCorrect
                      ? "Correct!"
                      : "Not quite."}
                  </p>

                  {!currentAnswerCorrect && (
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
                  submitAnswer
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
                  goToNextQuestion
                }
                className="flex min-h-12 items-center gap-2 rounded-xl bg-[#1F1D1B] px-6 text-sm font-semibold text-white transition hover:bg-black"
              >
                {currentIndex ===
                questions.length - 1
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

export default PracticePage;