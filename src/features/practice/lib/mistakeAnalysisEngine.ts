import type {
  MistakeRecord,
  MistakeType,
} from "../../../shared/types/practice";

export type MistakeCause =
  | "empty-answer"
  | "capitalization"
  | "article-confusion"
  | "missing-umlaut"
  | "auxiliary-confusion"
  | "reflexive-pronoun"
  | "word-order"
  | "ending"
  | "spelling"
  | "unknown";

export interface MistakeAnalysis {
  cause: MistakeCause;
  title: string;
  explanation: string;
  suggestion: string;
  difference: {
    expected: string;
    received: string;
  };
}

function normalizeWhitespace(
  value: string,
) {
  return value
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeCase(
  value: string,
) {
  return normalizeWhitespace(
    value,
  ).toLocaleLowerCase("de-DE");
}

function removeGermanDiacritics(
  value: string,
) {
  return normalizeCase(value)
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ß/g, "ss");
}

function getWords(
  value: string,
) {
  return normalizeCase(value)
    .split(" ")
    .filter(Boolean);
}

function hasSameWordsDifferentOrder(
  firstValue: string,
  secondValue: string,
) {
  const firstWords =
    getWords(firstValue).sort();

  const secondWords =
    getWords(secondValue).sort();

  return (
    firstWords.length ===
      secondWords.length &&
    firstWords.every(
      (word, index) =>
        word ===
        secondWords[index],
    )
  );
}

function differsOnlyByCase(
  expected: string,
  received: string,
) {
  return (
    normalizeCase(expected) ===
      normalizeCase(received) &&
    normalizeWhitespace(expected) !==
      normalizeWhitespace(received)
  );
}

function differsOnlyByDiacritics(
  expected: string,
  received: string,
) {
  return (
    removeGermanDiacritics(
      expected,
    ) ===
      removeGermanDiacritics(
        received,
      ) &&
    normalizeCase(expected) !==
      normalizeCase(received)
  );
}

function containsAuxiliary(
  value: string,
) {
  const normalized =
    normalizeCase(value);

  if (
    normalized.startsWith(
      "hat ",
    ) ||
    normalized.startsWith(
      "haben ",
    )
  ) {
    return "haben";
  }

  if (
    normalized.startsWith(
      "ist ",
    ) ||
    normalized.startsWith(
      "sind ",
    )
  ) {
    return "sein";
  }

  return null;
}

function hasReflexivePronoun(
  value: string,
) {
  const pronouns = [
    "mich",
    "dich",
    "sich",
    "uns",
    "euch",
  ];

  const words =
    getWords(value);

  return pronouns.some(
    (pronoun) =>
      words.includes(pronoun),
  );
}

function getDefaultAnalysis(
  mistake: MistakeRecord,
): MistakeAnalysis {
  return {
    cause: "spelling",
    title: "Form mismatch",
    explanation:
      "Your answer does not match the expected form exactly.",
    suggestion:
      "Compare the two forms carefully and practise typing the correct answer from memory.",
    difference: {
      expected:
        mistake.correctAnswer,
      received:
        mistake.userAnswer ||
        "No answer",
    },
  };
}

function analyseArticle(
  mistake: MistakeRecord,
): MistakeAnalysis {
  return {
    cause: "article-confusion",
    title: "Article confusion",
    explanation: `The expected article is "${mistake.correctAnswer}", but you selected "${mistake.userAnswer || "no answer"}".`,
    suggestion:
      "Learn the noun together with its article as one unit and practise recalling the article before the translation.",
    difference: {
      expected:
        mistake.correctAnswer,
      received:
        mistake.userAnswer ||
        "No answer",
    },
  };
}

function analyseVerbForm(
  mistake: MistakeRecord,
): MistakeAnalysis | null {
  const expectedAuxiliary =
    containsAuxiliary(
      mistake.correctAnswer,
    );

  const receivedAuxiliary =
    containsAuxiliary(
      mistake.userAnswer,
    );

  if (
    expectedAuxiliary &&
    receivedAuxiliary &&
    expectedAuxiliary !==
      receivedAuxiliary
  ) {
    return {
      cause:
        "auxiliary-confusion",
      title:
        "Auxiliary confusion",
      explanation: `This form uses "${expectedAuxiliary}", not "${receivedAuxiliary}".`,
      suggestion:
        "Practise the verb together with its complete perfect form, including the auxiliary.",
      difference: {
        expected:
          mistake.correctAnswer,
        received:
          mistake.userAnswer,
      },
    };
  }

  const expectedReflexive =
    hasReflexivePronoun(
      mistake.correctAnswer,
    );

  const receivedReflexive =
    hasReflexivePronoun(
      mistake.userAnswer,
    );

  if (
    expectedReflexive &&
    !receivedReflexive
  ) {
    return {
      cause:
        "reflexive-pronoun",
      title:
        "Missing reflexive pronoun",
      explanation:
        "The expected verb form includes a reflexive pronoun.",
      suggestion:
        "Store and practise reflexive verbs together with the pronoun, for example: sich bewerben.",
      difference: {
        expected:
          mistake.correctAnswer,
        received:
          mistake.userAnswer ||
          "No answer",
      },
    };
  }

  if (
    hasSameWordsDifferentOrder(
      mistake.correctAnswer,
      mistake.userAnswer,
    )
  ) {
    return {
      cause: "word-order",
      title: "Word-order issue",
      explanation:
        "You used the correct elements, but placed them in the wrong order.",
      suggestion:
        "Practise the complete verb form as a fixed sequence before using it inside longer sentences.",
      difference: {
        expected:
          mistake.correctAnswer,
        received:
          mistake.userAnswer,
      },
    };
  }

  return null;
}

export function analyseMistake(
  mistake: MistakeRecord,
): MistakeAnalysis {
  const expected =
    normalizeWhitespace(
      mistake.correctAnswer,
    );

  const received =
    normalizeWhitespace(
      mistake.userAnswer,
    );

  if (!received) {
    return {
      cause: "empty-answer",
      title: "No answer provided",
      explanation:
        "The question was left unanswered.",
      suggestion:
        "Try producing at least a partial answer before revealing the solution.",
      difference: {
        expected,
        received: "No answer",
      },
    };
  }

  if (
    differsOnlyByCase(
      expected,
      received,
    )
  ) {
    return {
      cause: "capitalization",
      title: "Capitalization issue",
      explanation:
        "The letters are otherwise correct, but German capitalization differs.",
      suggestion:
        "Remember that German nouns always begin with a capital letter.",
      difference: {
        expected,
        received,
      },
    };
  }

  if (
    differsOnlyByDiacritics(
      expected,
      received,
    )
  ) {
    return {
      cause: "missing-umlaut",
      title: "Missing German character",
      explanation:
        "The answer differs because of an umlaut or ß.",
      suggestion:
        "Practise the exact written form and pay attention to ä, ö, ü and ß.",
      difference: {
        expected,
        received,
      },
    };
  }

  if (
    mistake.questionType ===
    "article"
  ) {
    return analyseArticle(
      mistake,
    );
  }

  if (
    mistake.questionType ===
      "perfekt" ||
    mistake.questionType ===
      "praeteritum"
  ) {
    const verbAnalysis =
      analyseVerbForm(
        mistake,
      );

    if (verbAnalysis) {
      return verbAnalysis;
    }
  }

  if (
    mistake.questionType ===
      "plural" ||
    mistake.questionType ===
      "comparative"
  ) {
    return {
      cause: "ending",
      title: "Form ending mismatch",
      explanation:
        "The expected inflected form has a different ending or stem change.",
      suggestion:
        "Practise the base form and the target form together, and mark any vowel change or ending.",
      difference: {
        expected,
        received,
      },
    };
  }

  return getDefaultAnalysis(
    mistake,
  );
}

export function getMistakeTypeLabel(
  type: MistakeType,
) {
  switch (type) {
    case "meaning":
      return "Meaning";

    case "article":
      return "Article";

    case "plural":
      return "Plural";

    case "perfekt":
      return "Perfekt";

    case "praeteritum":
      return "Präteritum";

    case "comparative":
      return "Comparative";

    default:
      return "Mistake";
  }
}