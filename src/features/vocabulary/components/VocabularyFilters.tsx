import {
  RotateCcw,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react";

import Input from "../../../shared/ui/Input";
import type {
  VocabularyLevel,
  VocabularyType,
} from "../../../shared/types/vocabulary";

export type VocabularyTypeFilter =
  | "all"
  | VocabularyType;

export type VocabularyLevelFilter =
  | "all"
  | VocabularyLevel;

export type VocabularySort =
  | "alphabetical-asc"
  | "alphabetical-desc"
  | "newest"
  | "oldest"
  | "level-asc"
  | "level-desc";

interface VocabularyFiltersProps {
  searchTerm: string;
  selectedType: VocabularyTypeFilter;
  selectedLevel: VocabularyLevelFilter;
  selectedSort: VocabularySort;
  favoritesOnly: boolean;
  onSearchChange: (value: string) => void;
  onTypeChange: (
    value: VocabularyTypeFilter,
  ) => void;
  onLevelChange: (
    value: VocabularyLevelFilter,
  ) => void;
  onSortChange: (
    value: VocabularySort,
  ) => void;
  onFavoritesOnlyChange: (
    value: boolean,
  ) => void;
  onReset: () => void;
}

export function VocabularyFilters({
  searchTerm,
  selectedType,
  selectedLevel,
  selectedSort,
  favoritesOnly,
  onSearchChange,
  onTypeChange,
  onLevelChange,
  onSortChange,
  onFavoritesOnlyChange,
  onReset,
}: VocabularyFiltersProps) {
  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    selectedType !== "all" ||
    selectedLevel !== "all" ||
    selectedSort !== "alphabetical-asc" ||
    favoritesOnly;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_180px_160px_190px]">
        <Input
          icon={<Search size={18} />}
          type="search"
          value={searchTerm}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Search German or Romanian..."
        />

        <label className="relative">
          <span className="sr-only">
            Filter by vocabulary type
          </span>

          <select
            value={selectedType}
            onChange={(event) =>
              onTypeChange(
                event.target
                  .value as VocabularyTypeFilter,
              )
            }
            className="min-h-12 w-full appearance-none rounded-xl border border-[#E4DED8] bg-white px-4 pr-10 text-sm outline-none transition focus:border-[#E3B48D] focus:ring-4 focus:ring-[#FFF0E2]"
          >
            <option value="all">
              All types
            </option>

            <option value="noun">
              Nouns
            </option>

            <option value="verb">
              Verbs
            </option>

            <option value="adjective">
              Adjectives
            </option>

            <option value="expression">
              Expressions
            </option>
          </select>

          <SlidersHorizontal
            size={16}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#A09A94]"
          />
        </label>

        <label>
          <span className="sr-only">
            Filter by vocabulary level
          </span>

          <select
            value={selectedLevel}
            onChange={(event) =>
              onLevelChange(
                event.target
                  .value as VocabularyLevelFilter,
              )
            }
            className="min-h-12 w-full rounded-xl border border-[#E4DED8] bg-white px-4 text-sm outline-none transition focus:border-[#E3B48D] focus:ring-4 focus:ring-[#FFF0E2]"
          >
            <option value="all">
              All levels
            </option>

            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
            <option value="C2">C2</option>
          </select>
        </label>

        <label>
          <span className="sr-only">
            Sort vocabulary
          </span>

          <select
            value={selectedSort}
            onChange={(event) =>
              onSortChange(
                event.target
                  .value as VocabularySort,
              )
            }
            className="min-h-12 w-full rounded-xl border border-[#E4DED8] bg-white px-4 text-sm outline-none transition focus:border-[#E3B48D] focus:ring-4 focus:ring-[#FFF0E2]"
          >
            <option value="alphabetical-asc">
              German A–Z
            </option>

            <option value="alphabetical-desc">
              German Z–A
            </option>

            <option value="newest">
              Newest first
            </option>

            <option value="oldest">
              Oldest first
            </option>

            <option value="level-asc">
              Level A1–C2
            </option>

            <option value="level-desc">
              Level C2–A1
            </option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() =>
            onFavoritesOnlyChange(
              !favoritesOnly,
            )
          }
          className={
            favoritesOnly
              ? "flex min-h-10 items-center gap-2 rounded-xl border border-[#E8B675] bg-[#FFF4E6] px-4 text-sm font-medium text-[#8A5417]"
              : "flex min-h-10 items-center gap-2 rounded-xl border border-[#E4DED8] bg-white px-4 text-sm font-medium text-[#4D4843] transition hover:bg-[#F8F4F0]"
          }
          aria-pressed={favoritesOnly}
        >
          <Star
            size={17}
            fill={
              favoritesOnly
                ? "currentColor"
                : "none"
            }
          />

          Favorites only
        </button>

        <button
          type="button"
          onClick={onReset}
          disabled={!hasActiveFilters}
          className="flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-[#77716B] transition hover:bg-[#F8F4F0] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw size={16} />
          Reset filters
        </button>
      </div>
    </div>
  );
}