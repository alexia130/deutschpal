import type {
  MistakeType,
  SavedPracticeType,
} from "../../../shared/types/practice";
import type {
  PersonalExample,
} from "../../../shared/types/personalExamples";
import type {
  WordConnection,
} from "../../../shared/types/connections";
import type {
  VocabularyItem,
} from "../../../shared/types/vocabulary";

import type {
  AddTimelineEvent,
} from "../hooks/useLearningTimeline";

function createEvent(
  event: AddTimelineEvent,
): AddTimelineEvent {
  return event;
}

function formatSkill(
  skill: string,
) {
  return skill
    .split("-")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}

function getSafeAnswer(
  value: string,
) {
  const normalized =
    value.trim();

  return normalized.length > 0
    ? normalized
    : "No answer";
}

export function createWordAddedEvent(
  item: VocabularyItem,
): AddTimelineEvent {
  return createEvent({
    vocabularyId: item.id,

    type: "word-added",

    title: "Word added",

    description: `${item.german} was added to your vocabulary.`,

    metadata: {
      level: item.level,
      vocabularyType: item.type,
    },

    icon: "plus",
  });
}

export function createWordUpdatedEvent(
  item: VocabularyItem,
): AddTimelineEvent {
  return createEvent({
    vocabularyId: item.id,

    type: "word-updated",

    title: "Word updated",

    description: `${item.german} was updated.`,

    metadata: {
      level: item.level,
      vocabularyType: item.type,
    },

    icon: "pencil",
  });
}

export function createWordDeletedEvent(
  item: VocabularyItem,
): AddTimelineEvent {
  return createEvent({
    vocabularyId: item.id,

    type: "word-deleted",

    title: "Word deleted",

    description: `${item.german} was removed from your vocabulary.`,

    metadata: {
      level: item.level,
      vocabularyType: item.type,
    },

    icon: "trash",
  });
}

export function createFavoriteAddedEvent(
  item: VocabularyItem,
): AddTimelineEvent {
  return createEvent({
    vocabularyId: item.id,

    type: "favorite-added",

    title: "Added to favorites",

    description: `${item.german} was added to your favorites.`,

    icon: "star",
  });
}

export function createFavoriteRemovedEvent(
  item: VocabularyItem,
): AddTimelineEvent {
  return createEvent({
    vocabularyId: item.id,

    type: "favorite-removed",

    title: "Removed from favorites",

    description: `${item.german} was removed from your favorites.`,

    icon: "star",
  });
}

export function createReviewEvent(
  item: VocabularyItem,
  correct: boolean,
): AddTimelineEvent {
  return createEvent({
    vocabularyId: item.id,

    type: "review",

    title: correct
      ? "Review answered correctly"
      : "Review answered incorrectly",

    description: correct
      ? `${item.german} was reviewed successfully.`
      : `${item.german} needs another review.`,

    metadata: {
      correct,
      interval:
        item.review.interval,
      reviewCount:
        item.review.reviewCount,
    },

    icon: correct
      ? "check"
      : "x",
  });
}

export function createMistakeEvent(
  vocabularyId: string,
  vocabularyGerman: string,
  skill: MistakeType,
  userAnswer: string,
  correctAnswer: string,
): AddTimelineEvent {
  const formattedSkill =
    formatSkill(skill);

  return createEvent({
    vocabularyId,

    type: "mistake",

    title: `${formattedSkill} answered incorrectly`,

    description: `Your answer: "${getSafeAnswer(
      userAnswer,
    )}". Correct answer: "${correctAnswer}".`,

    metadata: {
      vocabularyGerman,
      skill,
      userAnswer:
        getSafeAnswer(
          userAnswer,
        ),
      correctAnswer,
    },

    icon: "x",
  });
}

export function createCorrectEvent(
  vocabularyId: string,
  vocabularyGerman: string,
  skill: MistakeType,
): AddTimelineEvent {
  const formattedSkill =
    formatSkill(skill);

  return createEvent({
    vocabularyId,

    type: "correct",

    title: `${formattedSkill} answered correctly`,

    description: `${vocabularyGerman} was answered correctly.`,

    metadata: {
      vocabularyGerman,
      skill,
    },

    icon: "check",
  });
}

export function createPracticeCompletedEvent(
  vocabularyId: string,
  practiceType: SavedPracticeType,
  totalQuestions: number,
  correctAnswers: number,
  scorePercentage: number,
): AddTimelineEvent {
  const formattedType =
    formatSkill(practiceType);

  return createEvent({
    vocabularyId,

    type: "practice",

    title: `${formattedType} practice completed`,

    description: `${correctAnswers} of ${totalQuestions} answers were correct.`,

    metadata: {
      practiceType,
      totalQuestions,
      correctAnswers,
      scorePercentage,
    },

    icon: "brain",
  });
}

export function createPersonalExampleAddedEvent(
  example: PersonalExample,
): AddTimelineEvent {
  return createEvent({
    vocabularyId:
      example.vocabularyId,

    type:
      "personal-example-added",

    title:
      "Personal example added",

    description:
      "A new personal German sentence was added.",

    metadata: {
      context:
        example.context,
    },

    icon: "book",
  });
}

export function createPersonalExampleUpdatedEvent(
  example: PersonalExample,
): AddTimelineEvent {
  return createEvent({
    vocabularyId:
      example.vocabularyId,

    type:
      "personal-example-updated",

    title:
      "Personal example updated",

    description:
      "A personal German sentence was updated.",

    metadata: {
      context:
        example.context,
    },

    icon: "book",
  });
}

export function createPersonalExampleDeletedEvent(
  example: PersonalExample,
): AddTimelineEvent {
  return createEvent({
    vocabularyId:
      example.vocabularyId,

    type:
      "personal-example-deleted",

    title:
      "Personal example deleted",

    description:
      "A personal German sentence was removed.",

    metadata: {
      context:
        example.context,
    },

    icon: "trash",
  });
}

export function createConnectionAddedEvent(
  connection: WordConnection,
): AddTimelineEvent {
  return createEvent({
    vocabularyId:
      connection.sourceVocabularyId,

    type:
      "connection-added",

    title:
      "Word connection added",

    description: `A ${formatSkill(
      connection.type,
    ).toLocaleLowerCase()} connection to "${connection.targetLabel}" was added.`,

    metadata: {
      connectionType:
        connection.type,
      targetLabel:
        connection.targetLabel,
    },

    icon: "link",
  });
}

export function createConnectionDeletedEvent(
  connection: WordConnection,
): AddTimelineEvent {
  return createEvent({
    vocabularyId:
      connection.sourceVocabularyId,

    type:
      "connection-deleted",

    title:
      "Word connection deleted",

    description: `The connection to "${connection.targetLabel}" was removed.`,

    metadata: {
      connectionType:
        connection.type,
      targetLabel:
        connection.targetLabel,
    },

    icon: "trash",
  });
}

export function createMasteredEvent(
  item: VocabularyItem,
): AddTimelineEvent {
  return createEvent({
    vocabularyId: item.id,

    type: "mastered",

    title: "Vocabulary mastered",

    description: `${item.german} reached a stable mastery level.`,

    metadata: {
      reviewCount:
        item.review.reviewCount,
      correctCount:
        item.review.correctCount,
      interval:
        item.review.interval,
    },

    icon: "check",
  });
}

export function createForgottenEvent(
  item: VocabularyItem,
): AddTimelineEvent {
  return createEvent({
    vocabularyId: item.id,

    type: "forgotten",

    title: "Knowledge weakened",

    description: `${item.german} was answered incorrectly after previous successful reviews.`,

    metadata: {
      reviewCount:
        item.review.reviewCount,
      wrongCount:
        item.review.wrongCount,
    },

    icon: "alert",
  });
}