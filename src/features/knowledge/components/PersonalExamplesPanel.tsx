import {
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

import { usePersonalExamples } from "../hooks/usePersonalExamples";

import type {
  PersonalExample,
  PersonalExampleContext,
} from "../../../shared/types/personalExamples";
import type {
  VocabularyItem,
} from "../../../shared/types/vocabulary";

interface PersonalExamplesPanelProps {
  item: VocabularyItem;
}

const contextLabels: Record<
  PersonalExampleContext,
  string
> = {
  "daily-life": "Daily life",
  university: "University",
  work: "Work",
  telc: "TELC",
  administration: "Administration",
  travel: "Travel",
  conversation: "Conversation",
  other: "Other",
};

export function PersonalExamplesPanel({
  item,
}: PersonalExamplesPanelProps) {
  const {
    addExample,
    updateExample,
    deleteExample,
    getExamplesForVocabulary,
  } = usePersonalExamples();

  const [
    germanSentence,
    setGermanSentence,
  ] = useState("");

  const [
    romanianTranslation,
    setRomanianTranslation,
  ] = useState("");

  const [
    context,
    setContext,
  ] =
    useState<PersonalExampleContext>(
      "daily-life",
    );

  const [
    note,
    setNote,
  ] = useState("");

  const [
    editingExample,
    setEditingExample,
  ] =
    useState<PersonalExample | null>(
      null,
    );

  const examples = useMemo(
    () =>
      getExamplesForVocabulary(
        item.id,
      ),
    [
      getExamplesForVocabulary,
      item.id,
    ],
  );

  function resetForm() {
    setGermanSentence("");
    setRomanianTranslation("");
    setContext("daily-life");
    setNote("");
    setEditingExample(null);
  }

  function handleSubmit() {
    if (!germanSentence.trim()) {
      return;
    }

    const input = {
      vocabularyId:
        item.id,

      germanSentence,

      romanianTranslation,

      context,

      note,
    };

    if (editingExample) {
      updateExample(
        editingExample.id,
        input,
      );
    } else {
      addExample(input);
    }

    resetForm();
  }

  function startEditing(
    example: PersonalExample,
  ) {
    setEditingExample(example);
    setGermanSentence(
      example.germanSentence,
    );
    setRomanianTranslation(
      example.romanianTranslation,
    );
    setContext(
      example.context,
    );
    setNote(example.note);
  }

  function handleDelete(
    example: PersonalExample,
  ) {
    const confirmed =
      window.confirm(
        "Delete this personal example?",
      );

    if (!confirmed) {
      return;
    }

    deleteExample(
      example.id,
    );

    if (
      editingExample?.id ===
      example.id
    ) {
      resetForm();
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-[#1F1D1B]">
          Personal examples
        </h2>

        <p className="mt-1 text-sm leading-6 text-[#77716B]">
          Save sentences that connect this word to your own life, studies and goals.
        </p>
      </div>

      <div className="grid gap-3">
        <textarea
          value={germanSentence}
          onChange={(event) =>
            setGermanSentence(
              event.target.value,
            )
          }
          rows={3}
          placeholder={`Write a German sentence with "${item.german}"...`}
          className="resize-none rounded-xl border border-[#E4DED8] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#E3B48D] focus:ring-4 focus:ring-[#FFF0E2]"
        />

        <textarea
          value={
            romanianTranslation
          }
          onChange={(event) =>
            setRomanianTranslation(
              event.target.value,
            )
          }
          rows={2}
          placeholder="Romanian translation (optional)..."
          className="resize-none rounded-xl border border-[#E4DED8] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#E3B48D] focus:ring-4 focus:ring-[#FFF0E2]"
        />

        <select
          value={context}
          onChange={(event) =>
            setContext(
              event.target
                .value as PersonalExampleContext,
            )
          }
          className="min-h-11 rounded-xl border border-[#E4DED8] bg-white px-4 text-sm outline-none transition focus:border-[#E3B48D] focus:ring-4 focus:ring-[#FFF0E2]"
        >
          {Object.entries(
            contextLabels,
          ).map(
            ([value, label]) => (
              <option
                key={value}
                value={value}
              >
                {label}
              </option>
            ),
          )}
        </select>

        <input
          type="text"
          value={note}
          onChange={(event) =>
            setNote(
              event.target.value,
            )
          }
          placeholder="Optional note..."
          className="min-h-11 rounded-xl border border-[#E4DED8] bg-white px-4 text-sm outline-none transition focus:border-[#E3B48D] focus:ring-4 focus:ring-[#FFF0E2]"
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              !germanSentence.trim()
            }
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#1F1D1B] px-4 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            {editingExample ? (
              <Pencil size={17} />
            ) : (
              <Plus size={17} />
            )}

            {editingExample
              ? "Save changes"
              : "Add example"}
          </button>

          {editingExample && (
            <button
              type="button"
              onClick={resetForm}
              className="min-h-11 rounded-xl border border-[#E4DED8] bg-white px-4 text-sm font-medium text-[#4D4843] transition hover:bg-[#F8F4F0]"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-[#ECE8E3] pt-5">
        {examples.length > 0 ? (
          <div className="space-y-3">
            {examples.map(
              (example) => (
                <article
                  key={example.id}
                  className="rounded-xl border border-[#E8E2DC] bg-[#FCFAF8] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="rounded-full bg-[#FFF0E2] px-2.5 py-1 text-xs font-semibold text-[#8A5417]">
                        {
                          contextLabels[
                            example.context
                          ]
                        }
                      </span>

                      <p className="mt-3 text-sm font-semibold leading-6 text-[#1F1D1B]">
                        {
                          example.germanSentence
                        }
                      </p>

                      {example.romanianTranslation && (
                        <p className="mt-1 text-sm leading-6 text-[#77716B]">
                          {
                            example.romanianTranslation
                          }
                        </p>
                      )}

                      {example.note && (
                        <p className="mt-2 text-xs leading-5 text-[#938C85]">
                          {
                            example.note
                          }
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          startEditing(
                            example,
                          )
                        }
                        className="flex size-9 items-center justify-center rounded-xl text-[#A09A94] transition hover:bg-[#F1EEF9] hover:text-[#67558A]"
                        aria-label="Edit personal example"
                        title="Edit example"
                      >
                        <Pencil
                          size={16}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            example,
                          )
                        }
                        className="flex size-9 items-center justify-center rounded-xl text-[#A09A94] transition hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete personal example"
                        title="Delete example"
                      >
                        <Trash2
                          size={16}
                        />
                      </button>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#DCD5CE] px-4 py-8 text-center">
            <p className="text-sm font-medium text-[#4D4843]">
              No personal examples yet
            </p>

            <p className="mt-1 text-sm leading-6 text-[#77716B]">
              Add a sentence from your own life to make this word easier to recall.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}