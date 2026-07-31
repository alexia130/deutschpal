import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { VocabularyBackupActions } from "../features/vocabulary/components/VocabularyBackupActions";
import {
  VocabularyFilters,
  type VocabularyLevelFilter,
  type VocabularySort,
  type VocabularyTypeFilter,
} from "../features/vocabulary/components/VocabularyFilters";
import { VocabularyRow } from "../features/vocabulary/components/VocabularyRow";
import { VocabularyDrawer } from "../features/vocabulary/drawer/VocabularyDrawer";
import { useVocabulary } from "../features/vocabulary/hooks/useVocabulary";
import PageHeader from "../shared/components/PageHeader";
import Button from "../shared/ui/Button";
import Card from "../shared/ui/Card";

import type {
  VocabularyFormData,
  VocabularyItem,
} from "../shared/types/vocabulary";

const levelOrder = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
} as const;

function getSafeText(
  value: string | undefined | null,
) {
  return typeof value === "string"
    ? value
    : "";
}

function getMeaningsText(
  item: VocabularyItem,
) {
  const meanings = Array.isArray(
    item.meanings,
  )
    ? item.meanings
    : [];

  return meanings
    .flatMap((meaning) => [
      getSafeText(
        meaning.translation,
      ),
      getSafeText(
        meaning.exampleGerman,
      ),
      getSafeText(
        meaning.exampleRomanian,
      ),
    ])
    .join(" ")
    .toLocaleLowerCase("de-DE");
}

function getCreatedAtTime(
  value: string | undefined,
) {
  if (!value) {
    return 0;
  }

  const time = new Date(
    value,
  ).getTime();

  return Number.isNaN(time)
    ? 0
    : time;
}

function VocabularyPage() {
  const {
    items,
    addItem,
    updateItem,
    deleteItem,
    toggleFavorite,
    importItems,
  } = useVocabulary();

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    selectedType,
    setSelectedType,
  ] =
    useState<VocabularyTypeFilter>(
      "all",
    );

  const [
    selectedLevel,
    setSelectedLevel,
  ] =
    useState<VocabularyLevelFilter>(
      "all",
    );

  const [
    selectedSort,
    setSelectedSort,
  ] =
    useState<VocabularySort>(
      "alphabetical-asc",
    );

  const [
    favoritesOnly,
    setFavoritesOnly,
  ] = useState(false);

  const [
    drawerOpen,
    setDrawerOpen,
  ] = useState(false);

  const [
    selectedItem,
    setSelectedItem,
  ] =
    useState<VocabularyItem | null>(
      null,
    );

  const filteredVocabulary =
    useMemo(() => {
      const search = searchTerm
        .trim()
        .toLocaleLowerCase(
          "de-DE",
        );

      const filteredItems =
        items.filter((item) => {
          const meaningsText =
            getMeaningsText(item);

          const nounText =
            item.type === "noun"
              ? [
                  getSafeText(
                    item.article,
                  ),
                  getSafeText(
                    item.plural,
                  ),
                ].join(" ")
              : "";

          const verbText =
            item.type === "verb"
              ? [
                  getSafeText(
                    item.auxiliary,
                  ),
                  getSafeText(
                    item.praeteritum,
                  ),
                  getSafeText(
                    item.perfekt,
                  ),
                  item.reflexive
                    ? "reflexive"
                    : "",
                  item.separable
                    ? "separable"
                    : "",
                ].join(" ")
              : "";

          const adjectiveText =
            item.type ===
            "adjective"
              ? [
                  getSafeText(
                    item.comparative,
                  ),
                  getSafeText(
                    item.superlative,
                  ),
                ].join(" ")
              : "";

          const searchableText = [
            getSafeText(
              item.german,
            ),
            meaningsText,
            nounText,
            verbText,
            adjectiveText,
          ]
            .join(" ")
            .toLocaleLowerCase(
              "de-DE",
            );

          const matchesSearch =
            search.length === 0 ||
            searchableText.includes(
              search,
            );

          const matchesType =
            selectedType ===
              "all" ||
            item.type ===
              selectedType;

          const matchesLevel =
            selectedLevel ===
              "all" ||
            item.level ===
              selectedLevel;

          const matchesFavorite =
            !favoritesOnly ||
            item.favorite === true;

          return (
            matchesSearch &&
            matchesType &&
            matchesLevel &&
            matchesFavorite
          );
        });

      return [
        ...filteredItems,
      ].sort(
        (
          firstItem,
          secondItem,
        ) => {
          switch (
            selectedSort
          ) {
            case "alphabetical-desc":
              return getSafeText(
                secondItem.german,
              ).localeCompare(
                getSafeText(
                  firstItem.german,
                ),
                "de-DE",
              );

            case "newest":
              return (
                getCreatedAtTime(
                  secondItem.createdAt,
                ) -
                getCreatedAtTime(
                  firstItem.createdAt,
                )
              );

            case "oldest":
              return (
                getCreatedAtTime(
                  firstItem.createdAt,
                ) -
                getCreatedAtTime(
                  secondItem.createdAt,
                )
              );

            case "level-asc":
              return (
                levelOrder[
                  firstItem.level
                ] -
                levelOrder[
                  secondItem.level
                ]
              );

            case "level-desc":
              return (
                levelOrder[
                  secondItem.level
                ] -
                levelOrder[
                  firstItem.level
                ]
              );

            case "alphabetical-asc":
            default:
              return getSafeText(
                firstItem.german,
              ).localeCompare(
                getSafeText(
                  secondItem.german,
                ),
                "de-DE",
              );
          }
        },
      );
    }, [
      items,
      searchTerm,
      selectedType,
      selectedLevel,
      selectedSort,
      favoritesOnly,
    ]);

  function openCreateDrawer() {
    setSelectedItem(null);
    setDrawerOpen(true);
  }

  function openEditDrawer(
    item: VocabularyItem,
  ) {
    setSelectedItem(item);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setSelectedItem(null);
  }

  function handleSave(
    data: VocabularyFormData,
  ) {
    if (selectedItem) {
      updateItem(
        selectedItem.id,
        data,
      );
    } else {
      addItem(data);
    }

    closeDrawer();
  }

  function handleDeleteSelectedItem() {
    if (!selectedItem) {
      return;
    }

    deleteItem(
      selectedItem.id,
    );

    closeDrawer();
  }

  function resetFilters() {
    setSearchTerm("");
    setSelectedType("all");
    setSelectedLevel("all");
    setSelectedSort(
      "alphabetical-asc",
    );
    setFavoritesOnly(false);
  }

  return (
    <>
      <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
        <PageHeader
          title="Vocabulary"
          subtitle="Search and manage your German vocabulary."
        />

        <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-start">
          <VocabularyBackupActions
            items={items}
            onImport={
              importItems
            }
          />

          <Button
            type="button"
            onClick={
              openCreateDrawer
            }
            className="min-h-11"
          >
            <Plus size={18} />
            Add vocabulary
          </Button>
        </div>
      </div>

      <Card className="p-0">
        <div className="border-b border-[#ECE8E3] p-5">
          <VocabularyFilters
            searchTerm={
              searchTerm
            }
            selectedType={
              selectedType
            }
            selectedLevel={
              selectedLevel
            }
            selectedSort={
              selectedSort
            }
            favoritesOnly={
              favoritesOnly
            }
            onSearchChange={
              setSearchTerm
            }
            onTypeChange={
              setSelectedType
            }
            onLevelChange={
              setSelectedLevel
            }
            onSortChange={
              setSelectedSort
            }
            onFavoritesOnlyChange={
              setFavoritesOnly
            }
            onReset={
              resetFilters
            }
          />
        </div>

        <div className="border-b border-[#ECE8E3] px-6 py-3">
          <p className="text-sm text-[#77716B]">
            {
              filteredVocabulary.length
            }{" "}
            {filteredVocabulary.length ===
            1
              ? "result"
              : "results"}
          </p>
        </div>

        {filteredVocabulary.length >
        0 ? (
          <div className="divide-y divide-[#F0ECE8]">
            {filteredVocabulary.map(
              (item) => (
                <VocabularyRow
                  key={item.id}
                  item={item}
                  onEdit={
                    openEditDrawer
                  }
                  onDelete={
                    deleteItem
                  }
                  onToggleFavorite={
                    toggleFavorite
                  }
                />
              ),
            )}
          </div>
        ) : (
          <div className="px-6 py-20 text-center">
            <h2 className="text-lg font-semibold text-[#1F1D1B]">
              No vocabulary found
            </h2>

            <p className="mt-2 text-sm text-[#77716B]">
              Adjust the search
              term or selected
              filters.
            </p>

            <button
              type="button"
              onClick={
                resetFilters
              }
              className="mt-5 rounded-xl border border-[#E4DED8] bg-white px-4 py-2 text-sm font-medium text-[#4D4843] transition hover:bg-[#F8F4F0]"
            >
              Reset filters
            </button>
          </div>
        )}
      </Card>

      <VocabularyDrawer
        open={drawerOpen}
        item={selectedItem}
        onClose={closeDrawer}
        onSave={handleSave}
        onDelete={
          selectedItem
            ? handleDeleteSelectedItem
            : undefined
        }
      />
    </>
  );
}

export default VocabularyPage;