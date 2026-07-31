import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Network,
  RotateCcw,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import type { VocabularyItem } from "../../../shared/types/vocabulary";

interface VocabularyRowProps {
  item: VocabularyItem;
  onEdit: (item: VocabularyItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

type LearningStatus =
  | "new"
  | "learning"
  | "needs-practice"
  | "mastered";

function getSafeNumber(
  value: number | undefined,
) {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : 0;
}

function getTranslations(
  item: VocabularyItem,
) {
  if (!Array.isArray(item.meanings)) {
    return "";
  }

  return item.meanings
    .map((meaning) =>
      typeof meaning.translation ===
      "string"
        ? meaning.translation.trim()
        : "",
    )
    .filter(Boolean)
    .join(", ");
}

function getLearningStatus(
  item: VocabularyItem,
): LearningStatus {
  const reviewCount =
    getSafeNumber(
      item.review?.reviewCount,
    );

  const correctCount =
    getSafeNumber(
      item.review?.correctCount,
    );

  const wrongCount =
    getSafeNumber(
      item.review?.wrongCount,
    );

  const interval =
    getSafeNumber(
      item.review?.interval,
    );

  if (reviewCount === 0) {
    return "new";
  }

  const totalAnswers =
    correctCount + wrongCount;

  const successRate =
    totalAnswers > 0
      ? correctCount / totalAnswers
      : 0;

  if (
    wrongCount >= correctCount ||
    successRate < 0.5
  ) {
    return "needs-practice";
  }

  if (
    successRate >= 0.85 &&
    interval >= 30 &&
    reviewCount >= 5
  ) {
    return "mastered";
  }

  return "learning";
}

function getStatusDetails(
  status: LearningStatus,
) {
  switch (status) {
    case "mastered":
      return {
        label: "Mastered",
        className:
          "border-green-200 bg-green-50 text-green-700",
        icon: CheckCircle2,
      };

    case "needs-practice":
      return {
        label: "Needs practice",
        className:
          "border-red-200 bg-red-50 text-red-700",
        icon: AlertCircle,
      };

    case "learning":
      return {
        label: "Learning",
        className:
          "border-amber-200 bg-amber-50 text-amber-700",
        icon: RotateCcw,
      };

    case "new":
    default:
      return {
        label: "New",
        className:
          "border-blue-200 bg-blue-50 text-blue-700",
        icon: Clock3,
      };
  }
}

function isSameCalendarDay(
  firstDate: Date,
  secondDate: Date,
) {
  return (
    firstDate.getFullYear() ===
      secondDate.getFullYear() &&
    firstDate.getMonth() ===
      secondDate.getMonth() &&
    firstDate.getDate() ===
      secondDate.getDate()
  );
}

function getNextReviewLabel(
  nextReview: string | null | undefined,
) {
  if (!nextReview) {
    return "Ready to review";
  }

  const nextReviewDate =
    new Date(nextReview);

  if (
    Number.isNaN(
      nextReviewDate.getTime(),
    )
  ) {
    return "Review date unavailable";
  }

  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const reviewDay = new Date(
    nextReviewDate.getFullYear(),
    nextReviewDate.getMonth(),
    nextReviewDate.getDate(),
  );

  if (
    reviewDay.getTime() <
    today.getTime()
  ) {
    return "Overdue";
  }

  if (
    isSameCalendarDay(
      reviewDay,
      today,
    )
  ) {
    return "Review today";
  }

  const tomorrow = new Date(
    today,
  );

  tomorrow.setDate(
    tomorrow.getDate() + 1,
  );

  if (
    isSameCalendarDay(
      reviewDay,
      tomorrow,
    )
  ) {
    return "Review tomorrow";
  }

  const differenceInDays =
    Math.ceil(
      (reviewDay.getTime() -
        today.getTime()) /
        (1000 * 60 * 60 * 24),
    );

  if (differenceInDays <= 7) {
    return `Review in ${differenceInDays} days`;
  }

  return `Review ${nextReviewDate.toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      year:
        nextReviewDate.getFullYear() !==
        now.getFullYear()
          ? "numeric"
          : undefined,
    },
  )}`;
}

function getReviewLabelClassName(
  nextReview: string | null | undefined,
) {
  if (!nextReview) {
    return "text-blue-700";
  }

  const reviewDate =
    new Date(nextReview);

  if (
    Number.isNaN(
      reviewDate.getTime(),
    )
  ) {
    return "text-[#77716B]";
  }

  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const reviewDay = new Date(
    reviewDate.getFullYear(),
    reviewDate.getMonth(),
    reviewDate.getDate(),
  );

  if (
    reviewDay.getTime() <
    today.getTime()
  ) {
    return "text-red-700";
  }

  if (
    isSameCalendarDay(
      reviewDay,
      today,
    )
  ) {
    return "text-amber-700";
  }

  return "text-[#625C56]";
}

export function VocabularyRow({
  item,
  onEdit,
  onDelete,
  onToggleFavorite,
}: VocabularyRowProps) {
  const translations =
    getTranslations(item);

  const displayGerman =
    item.type === "noun"
      ? `${item.article ?? ""} ${
          item.german
        }`.trim()
      : item.german;

  const detail =
    item.type === "noun"
      ? item.plural
        ? `Plural: ${item.plural}`
        : ""
      : item.type === "verb"
        ? [
            item.praeteritum,
            item.perfekt,
          ]
            .filter(Boolean)
            .join(" · ")
        : item.type ===
            "adjective"
          ? [
              item.comparative,
              item.superlative,
            ]
              .filter(Boolean)
              .join(" · ")
          : "";

  const reviewCount =
    getSafeNumber(
      item.review?.reviewCount,
    );

  const correctCount =
    getSafeNumber(
      item.review?.correctCount,
    );

  const wrongCount =
    getSafeNumber(
      item.review?.wrongCount,
    );

  const interval =
    getSafeNumber(
      item.review?.interval,
    );

  const totalAnswers =
    correctCount + wrongCount;

  const successRate =
    totalAnswers > 0
      ? Math.round(
          (correctCount /
            totalAnswers) *
            100,
        )
      : 0;

  const status =
    getLearningStatus(item);

  const statusDetails =
    getStatusDetails(status);

  const StatusIcon =
    statusDetails.icon;

  const nextReviewLabel =
    getNextReviewLabel(
      item.review?.nextReview,
    );

  const nextReviewClassName =
    getReviewLabelClassName(
      item.review?.nextReview,
    );

  function handleDelete() {
    const confirmed =
      window.confirm(
        `Delete "${item.german}" from your vocabulary?`,
      );

    if (confirmed) {
      onDelete(item.id);
    }
  }

  return (
    <div className="group px-5 py-5 transition hover:bg-[#FCFAF8]">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={() =>
            onEdit(item)
          }
        >
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-[#1F1D1B]">
              {displayGerman}
            </h3>

            <span className="rounded-full bg-[#F3F0ED] px-2.5 py-1 text-xs font-medium capitalize text-[#625C56]">
              {item.type}
            </span>

            <span className="rounded-full bg-[#FFF0E2] px-2.5 py-1 text-xs font-semibold text-[#8A5417]">
              {item.level}
            </span>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusDetails.className}`}
            >
              <StatusIcon
                size={13}
              />

              {statusDetails.label}
            </span>
          </div>

          <p className="mt-2 text-sm leading-6 text-[#625C56]">
            {translations ||
              "No translation added"}
          </p>

          {detail && (
            <p className="mt-1 text-xs text-[#938C85]">
              {detail}
            </p>
          )}
        </button>

        <div className="flex flex-col gap-4 xl:min-w-[470px] xl:flex-row xl:items-center xl:justify-end">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-xl bg-[#F8F4F0] px-3 py-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#938C85]">
                Reviews
              </p>

              <p className="mt-1 text-sm font-semibold text-[#1F1D1B]">
                {reviewCount}
              </p>
            </div>

            <div className="rounded-xl bg-green-50 px-3 py-2.5">
              <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-green-700">
                <CheckCircle2
                  size={12}
                />
                Correct
              </p>

              <p className="mt-1 text-sm font-semibold text-green-800">
                {correctCount}
              </p>
            </div>

            <div className="rounded-xl bg-red-50 px-3 py-2.5">
              <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-red-700">
                <XCircle
                  size={12}
                />
                Wrong
              </p>

              <p className="mt-1 text-sm font-semibold text-red-800">
                {wrongCount}
              </p>
            </div>

            <div className="rounded-xl bg-[#F8F4F0] px-3 py-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#938C85]">
                Success
              </p>

              <p className="mt-1 text-sm font-semibold text-[#1F1D1B]">
                {totalAnswers > 0
                  ? `${successRate}%`
                  : "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 xl:min-w-[145px] xl:flex-col xl:items-start xl:justify-center">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#938C85]">
                Next review
              </p>

              <p
                className={`mt-1 text-sm font-semibold ${nextReviewClassName}`}
              >
                {nextReviewLabel}
              </p>
            </div>

            {reviewCount > 0 && (
              <p className="text-xs text-[#938C85]">
                Interval:{" "}
                {interval === 1
                  ? "1 day"
                  : `${interval} days`}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 self-end xl:self-center">
            <Link
              to={`/vocabulary/${item.id}`}
              className="flex size-10 items-center justify-center rounded-xl text-[#938C85] transition hover:bg-[#F1EEF9] hover:text-[#67558A]"
              aria-label={`Open profile for ${item.german}`}
              title="Open word profile"
            >
              <Network size={18} />
            </Link>

            <button
              type="button"
              onClick={() =>
                onToggleFavorite(
                  item.id,
                )
              }
              className={
                item.favorite
                  ? "flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition hover:bg-amber-100"
                  : "flex size-10 items-center justify-center rounded-xl text-[#938C85] transition hover:bg-[#F3F0ED] hover:text-amber-600"
              }
              aria-label={
                item.favorite
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
              title={
                item.favorite
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
            >
              <Star
                size={19}
                fill={
                  item.favorite
                    ? "currentColor"
                    : "none"
                }
              />
            </button>

            <button
              type="button"
              onClick={
                handleDelete
              }
              className="flex size-10 items-center justify-center rounded-xl text-[#938C85] transition hover:bg-red-50 hover:text-red-600"
              aria-label={`Delete ${item.german}`}
              title="Delete vocabulary"
            >
              <Trash2
                size={18}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}