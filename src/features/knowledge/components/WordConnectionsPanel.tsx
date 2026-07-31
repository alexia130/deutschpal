import {
  Link2,
  Plus,
  Trash2,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";

import { useWordConnections } from "../hooks/useWordConnections";

import type {
  VocabularyItem,
} from "../../../shared/types/vocabulary";
import type {
  WordConnectionType,
} from "../../../shared/types/connections";

interface WordConnectionsPanelProps {
  item: VocabularyItem;
  vocabulary: VocabularyItem[];
}

const connectionTypeLabels: Record<
  WordConnectionType,
  string
> = {
  "word-family": "Word family",
  synonym: "Synonym",
  antonym: "Antonym",
  grammar: "Grammar",
  collocation: "Collocation",
  confusable: "Confusable",
  context: "Context",
};

export function WordConnectionsPanel({
  item,
  vocabulary,
}: WordConnectionsPanelProps) {
  const {
    addConnection,
    deleteConnection,
    getConnectionsForVocabulary,
  } = useWordConnections();

  const [
    connectionType,
    setConnectionType,
  ] =
    useState<WordConnectionType>(
      "word-family",
    );

  const [
    selectedVocabularyId,
    setSelectedVocabularyId,
  ] = useState("");

  const [
    customLabel,
    setCustomLabel,
  ] = useState("");

  const [
    note,
    setNote,
  ] = useState("");

  const connections =
    getConnectionsForVocabulary(
      item.id,
    );

  const availableVocabulary =
    useMemo(
      () =>
        vocabulary
          .filter(
            (candidate) =>
              candidate.id !==
              item.id,
          )
          .sort(
            (
              firstItem,
              secondItem,
            ) =>
              firstItem.german.localeCompare(
                secondItem.german,
                "de-DE",
              ),
          ),
      [item.id, vocabulary],
    );

  function resetForm() {
    setSelectedVocabularyId("");
    setCustomLabel("");
    setNote("");
    setConnectionType(
      "word-family",
    );
  }

  function handleAddConnection() {
    const selectedItem =
      availableVocabulary.find(
        (candidate) =>
          candidate.id ===
          selectedVocabularyId,
      );

    const targetLabel =
      selectedItem?.german ??
      customLabel.trim();

    if (!targetLabel) {
      return;
    }

    addConnection({
      sourceVocabularyId:
        item.id,

      targetVocabularyId:
        selectedItem?.id ?? null,

      targetLabel,

      type: connectionType,

      note,
    });

    resetForm();
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#F1EEF9] text-[#67558A]">
            <Link2 size={19} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#1F1D1B]">
              Word connections
            </h2>

            <p className="mt-1 text-sm text-[#77716B]">
              Connect this word to related vocabulary, grammar and contexts.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          <select
            value={connectionType}
            onChange={(event) =>
              setConnectionType(
                event.target
                  .value as WordConnectionType,
              )
            }
            className="min-h-11 rounded-xl border border-[#E4DED8] bg-white px-4 text-sm outline-none transition focus:border-[#E3B48D] focus:ring-4 focus:ring-[#FFF0E2]"
          >
            {Object.entries(
              connectionTypeLabels,
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

          <select
            value={selectedVocabularyId}
            onChange={(event) => {
              setSelectedVocabularyId(
                event.target.value,
              );

              if (
                event.target.value
              ) {
                setCustomLabel("");
              }
            }}
            className="min-h-11 rounded-xl border border-[#E4DED8] bg-white px-4 text-sm outline-none transition focus:border-[#E3B48D] focus:ring-4 focus:ring-[#FFF0E2]"
          >
            <option value="">
              Link saved vocabulary
            </option>

            {availableVocabulary.map(
              (candidate) => (
                <option
                  key={
                    candidate.id
                  }
                  value={
                    candidate.id
                  }
                >
                  {candidate.german}
                </option>
              ),
            )}
          </select>

          <input
            type="text"
            value={customLabel}
            onChange={(event) => {
              setCustomLabel(
                event.target.value,
              );

              if (
                event.target.value
              ) {
                setSelectedVocabularyId(
                  "",
                );
              }
            }}
            placeholder="Or enter a custom connection..."
            className="min-h-11 rounded-xl border border-[#E4DED8] bg-white px-4 text-sm outline-none transition focus:border-[#E3B48D] focus:ring-4 focus:ring-[#FFF0E2]"
          />

          <textarea
            value={note}
            onChange={(event) =>
              setNote(
                event.target.value,
              )
            }
            placeholder="Optional note, rule or example..."
            rows={3}
            className="resize-none rounded-xl border border-[#E4DED8] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#E3B48D] focus:ring-4 focus:ring-[#FFF0E2]"
          />

          <button
            type="button"
            onClick={
              handleAddConnection
            }
            disabled={
              !selectedVocabularyId &&
              !customLabel.trim()
            }
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1F1D1B] px-4 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={17} />
            Add connection
          </button>
        </div>
      </div>

      <div className="border-t border-[#ECE8E3] pt-5">
        {connections.length > 0 ? (
          <div className="space-y-3">
            {connections.map(
              (connection) => {
                const relatedId =
                  connection.sourceVocabularyId ===
                  item.id
                    ? connection.targetVocabularyId
                    : connection.sourceVocabularyId;

                return (
                  <div
                    key={
                      connection.id
                    }
                    className="rounded-xl border border-[#E8E2DC] bg-[#FCFAF8] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="rounded-full bg-[#FFF0E2] px-2.5 py-1 text-xs font-semibold text-[#8A5417]">
                          {
                            connectionTypeLabels[
                              connection.type
                            ]
                          }
                        </span>

                        <div className="mt-3">
                          {relatedId ? (
                            <Link
                              to={`/vocabulary/${relatedId}`}
                              className="font-semibold text-[#1F1D1B] transition hover:text-[#B85F28]"
                            >
                              {
                                connection.targetLabel
                              }
                            </Link>
                          ) : (
                            <p className="font-semibold text-[#1F1D1B]">
                              {
                                connection.targetLabel
                              }
                            </p>
                          )}
                        </div>

                        {connection.note && (
                          <p className="mt-2 text-sm leading-6 text-[#77716B]">
                            {
                              connection.note
                            }
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          deleteConnection(
                            connection.id,
                          )
                        }
                        className="flex size-9 shrink-0 items-center justify-center rounded-xl text-[#A09A94] transition hover:bg-red-50 hover:text-red-600"
                        aria-label={`Delete connection to ${connection.targetLabel}`}
                        title="Delete connection"
                      >
                        <Trash2
                          size={17}
                        />
                      </button>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#DCD5CE] px-4 py-8 text-center">
            <p className="text-sm font-medium text-[#4D4843]">
              No connections yet
            </p>

            <p className="mt-1 text-sm text-[#77716B]">
              Add a word-family link, grammar rule, collocation or related context.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}