import { Trash2 } from "lucide-react";

import type { VocabularyMeaning } from "../../../shared/types/meaning";

interface VocabularyMeaningCardProps {
  meaning: VocabularyMeaning;
  index: number;
  canDelete: boolean;
  onChange: (
    id: string,
    field: keyof Omit<VocabularyMeaning, "id">,
    value: string,
  ) => void;
  onDelete: (id: string) => void;
}

export function VocabularyMeaningCard({
  meaning,
  index,
  canDelete,
  onChange,
  onDelete,
}: VocabularyMeaningCardProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-[#E8E2DC] bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-semibold text-[#1F1D1B]">
          Meaning {index + 1}
        </h3>

        {canDelete && (
          <button
            type="button"
            onClick={() => onDelete(meaning.id)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <Trash2 size={16} />
            Remove
          </button>
        )}
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-[#4D4843]">
          Romanian translation
        </span>

        <input
          value={meaning.translation}
          onChange={(event) =>
            onChange(
              meaning.id,
              "translation",
              event.target.value,
            )
          }
          placeholder="a aplica"
          className="w-full rounded-xl border border-[#E4DED8] px-3 py-2 outline-none transition focus:border-[#E3B48D] focus:ring-4 focus:ring-[#FFF0E2]"
          required
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-[#4D4843]">
          German example
        </span>

        <textarea
          value={meaning.exampleGerman}
          onChange={(event) =>
            onChange(
              meaning.id,
              "exampleGerman",
              event.target.value,
            )
          }
          placeholder="Ich bewerbe mich um eine neue Stelle."
          rows={3}
          className="w-full resize-none rounded-xl border border-[#E4DED8] px-3 py-2 outline-none transition focus:border-[#E3B48D] focus:ring-4 focus:ring-[#FFF0E2]"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-[#4D4843]">
          Romanian example
        </span>

        <textarea
          value={meaning.exampleRomanian}
          onChange={(event) =>
            onChange(
              meaning.id,
              "exampleRomanian",
              event.target.value,
            )
          }
          placeholder="Aplic pentru un post nou."
          rows={3}
          className="w-full resize-none rounded-xl border border-[#E4DED8] px-3 py-2 outline-none transition focus:border-[#E3B48D] focus:ring-4 focus:ring-[#FFF0E2]"
        />
      </label>
    </section>
  );
}