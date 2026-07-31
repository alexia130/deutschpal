import type {
  VocabularyItem,
} from "../../../shared/types/vocabulary";

import type {
  VerbPracticeMode,
  VerbPracticeQuestion,
  VerbPracticeResult,
  VerbPracticeSummary,
} from "../types/verbPractice";

const AVAILABLE_MODES: Exclude<
  VerbPracticeMode,
  "mixed"
>[] = [
  "praeteritum",
  "perfekt",
  "partizip",
  "auxiliary",
  "translation",
  "infinitive",
];

function normalizeWhitespace(
  value: string,
) {
  return value
    .trim()
    .replace(/\s+/g, " ");
}

export function normalizeVerbAnswer(
  value: string,
) {
  return normalizeWhitespace(
    value,
  ).toLocaleLowerCase("de-DE");
}

export function isVerbItem(
  item: VocabularyItem,
) {
  return item.type === "verb";
}

function getTranslation(
  item: VocabularyItem,
) {
  return (
    item.meanings.find(
      (meaning) =>
        meaning.translation.trim()
          .length > 0,
    )?.translation ?? ""
  );
}

export function getPartizipII(
  perfekt: string,
) {
  const normalized =
    normalizeWhitespace(perfekt);

  if (!normalized) {
    return "";
  }

  return normalized
    .replace(
      /^(hat|haben|ist|sind|ist\/hat|hat\/ist)\s+/i,
      "",
    )
    .trim();
}

export function getAuxiliaryAnswer(
  auxiliary: string,
) {
  switch (
    auxiliary
      .trim()
      .toLocaleLowerCase("de-DE")
  ) {
    case "sein":
      return "sein";

    case "both":
      return "haben/sein";

    case "haben":
    default:
      return "haben";
  }
}

function supportsMode(
  item: VocabularyItem,
  mode: Exclude<
    VerbPracticeMode,
    "mixed"
  >,
) {
  if (item.type !== "verb") {
    return false;
  }

  switch (mode) {
    case "praeteritum":
      return (
        item.praeteritum.trim()
          .length > 0
      );

    case "perfekt":
      return (
        item.perfekt.trim()
          .length > 0
      );

    case "partizip":
      return (
        getPartizipII(
          item.perfekt,
        ).length > 0
      );

    case "auxiliary":
      return (
        item.auxiliary.trim()
          .length > 0
      );

    case "translation":
      return (
        getTranslation(item)
          .length > 0
      );

    case "infinitive":
      return (
        getTranslation(item)
          .length > 0
      );

    default:
      return false;
  }
}

function chooseMode(
  item: VocabularyItem,
  requestedMode: VerbPracticeMode,
) {
  if (
    requestedMode !== "mixed"
  ) {
    return supportsMode(
      item,
      requestedMode,
    )
      ? requestedMode
      : null;
  }

  const supportedModes =
    AVAILABLE_MODES.filter(
      (mode) =>
        supportsMode(
          item,
          mode,
        ),
    );

  if (
    supportedModes.length === 0
  ) {
    return null;
  }

  return supportedModes[
    Math.floor(
      Math.random() *
        supportedModes.length,
    )
  ];
}

export function createVerbQuestion(
  item: VocabularyItem,
  requestedMode: VerbPracticeMode,
): VerbPracticeQuestion | null {
  if (item.type !== "verb") {
    return null;
  }

  const mode =
    chooseMode(
      item,
      requestedMode,
    );

  if (!mode) {
    return null;
  }

  const id =
    `${item.id}-${mode}-${crypto.randomUUID()}`;

  switch (mode) {
    case "praeteritum":
      return {
        id,
        item,
        mode,
        prompt: item.german,
        correctAnswer:
          item.praeteritum,
      };

    case "perfekt":
      return {
        id,
        item,
        mode,
        prompt: item.german,
        correctAnswer:
          item.perfekt,
      };

    case "partizip":
      return {
        id,
        item,
        mode,
        prompt: item.german,
        correctAnswer:
          getPartizipII(
            item.perfekt,
          ),
      };

    case "auxiliary":
      return {
        id,
        item,
        mode,
        prompt: item.german,
        correctAnswer:
          getAuxiliaryAnswer(
            item.auxiliary,
          ),
        options: [
          "haben",
          "sein",
          "haben/sein",
        ],
      };

    case "translation":
      return {
        id,
        item,
        mode,
        prompt: item.german,
        correctAnswer:
          getTranslation(item),
      };

    case "infinitive":
      return {
        id,
        item,
        mode,
        prompt:
          getTranslation(item),
        correctAnswer:
          item.german,
      };

    default:
      return null;
  }
}

function shuffleArray<T>(
  values: T[],
) {
  const copy = [...values];

  for (
    let index =
      copy.length - 1;
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

interface CreateVerbQuestionsOptions {
  mode: VerbPracticeMode;
  maxQuestions?: number;
  favoritesOnly?: boolean;
  level?: string | "all";
  initials?: string[];
}

export function createVerbQuestions(
  vocabulary: VocabularyItem[],
  {
    mode,
    maxQuestions = 10,
    favoritesOnly = false,
    level = "all",
    initials = [],
  }: CreateVerbQuestionsOptions,
) {
  const normalizedInitials =
    new Set(
      initials.map((initial) =>
        initial
          .trim()
          .toLocaleUpperCase(
            "de-DE",
          ),
      ),
    );

  const eligibleVerbs =
    vocabulary.filter(
      (item) => {
        if (
          item.type !== "verb"
        ) {
          return false;
        }

        const matchesFavorite =
          !favoritesOnly ||
          item.favorite;

        const matchesLevel =
          level === "all" ||
          item.level === level;

        const firstLetter =
          item.german
            .trim()
            .charAt(0)
            .toLocaleUpperCase(
              "de-DE",
            );

        const matchesInitial =
          normalizedInitials.size ===
            0 ||
          normalizedInitials.has(
            firstLetter,
          );

        return (
          matchesFavorite &&
          matchesLevel &&
          matchesInitial
        );
      },
    );

  return shuffleArray(
    eligibleVerbs,
  )
    .map((item) =>
      createVerbQuestion(
        item,
        mode,
      ),
    )
    .filter(
      (
        question,
      ): question is VerbPracticeQuestion =>
        question !== null,
    )
    .slice(
      0,
      Math.max(
        1,
        maxQuestions,
      ),
    );
}

export function isVerbAnswerCorrect(
  userAnswer: string,
  correctAnswer: string,
) {
  return (
    normalizeVerbAnswer(
      userAnswer,
    ) ===
    normalizeVerbAnswer(
      correctAnswer,
    )
  );
}

export function calculateVerbSummary(
  results: VerbPracticeResult[],
): VerbPracticeSummary {
  const correctAnswers =
    results.filter(
      (result) =>
        result.correct,
    ).length;

  const totalQuestions =
    results.length;

  return {
    totalQuestions,

    correctAnswers,

    incorrectAnswers:
      totalQuestions -
      correctAnswers,

    scorePercentage:
      totalQuestions > 0
        ? Math.round(
            (correctAnswers /
              totalQuestions) *
              100,
          )
        : 0,
  };
}

export function getVerbModeLabel(
  mode: Exclude<
    VerbPracticeMode,
    "mixed"
  >,
) {
  switch (mode) {
    case "praeteritum":
      return "Präteritum";

    case "perfekt":
      return "Perfekt";

    case "partizip":
      return "Partizip II";

    case "auxiliary":
      return "Auxiliary";

    case "translation":
      return "Romanian meaning";

    case "infinitive":
      return "German infinitive";

    default:
      return "Verb form";
  }
}