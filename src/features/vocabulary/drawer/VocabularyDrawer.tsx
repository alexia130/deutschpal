
import { Plus, X } from "lucide-react";
import { useState } from "react";

import type {
  VocabularyFormData,
  VocabularyItem,
  VocabularyLevel,
  VocabularyType,
} from "../../../shared/types/vocabulary";
import type { VocabularyMeaning } from "../../../shared/types/meaning";
import { VocabularyMeaningCard } from "./VocabularyMeaningCard";

interface VocabularyDrawerProps {
  open: boolean;
  item?: VocabularyItem | null;
  onClose: () => void;
  onSave: (data: VocabularyFormData) => void;
  onDelete?: () => void;
}

type DraftForm = {
  type: VocabularyType;
  german: string;
  level: VocabularyLevel;
  favorite: boolean;
  article: "der" | "die" | "das";
  plural: string;
  auxiliary: "haben" | "sein";
  praeteritum: string;
  perfekt: string;
  reflexive: boolean;
  separable: boolean;
  comparative: string;
  superlative: string;
  meanings: VocabularyMeaning[];
};

function createEmptyMeaning(): VocabularyMeaning {
  return {
    id: crypto.randomUUID(),
    translation: "",
    exampleGerman: "",
    exampleRomanian: "",
  };
}

function createEmptyForm(): DraftForm {
  return {
    type: "noun",
    german: "",
    level: "B1",
    favorite: false,
    article: "die",
    plural: "",
    auxiliary: "haben",
    praeteritum: "",
    perfekt: "",
    reflexive: false,
    separable: false,
    comparative: "",
    superlative: "",
    meanings: [createEmptyMeaning()],
  };
}

function createFormFromItem(
  item?: VocabularyItem | null,
): DraftForm {
  if (!item) {
    return createEmptyForm();
  }

  return {
    type: item.type,
    german: item.german,
    level: item.level,
    favorite: item.favorite,
    article:
      item.type === "noun" ? item.article : "die",
    plural:
      item.type === "noun" ? item.plural : "",
    auxiliary:
      item.type === "verb" ? item.auxiliary : "haben",
    praeteritum:
      item.type === "verb" ? item.praeteritum : "",
    perfekt:
      item.type === "verb" ? item.perfekt : "",
    reflexive:
      item.type === "verb" ? item.reflexive : false,
    separable:
      item.type === "verb" ? item.separable : false,
    comparative:
      item.type === "adjective" ? item.comparative : "",
    superlative:
      item.type === "adjective" ? item.superlative : "",
    meanings:
      item.meanings.length > 0
        ? item.meanings.map((meaning) => ({ ...meaning }))
        : [createEmptyMeaning()],
  };
}

const inputClass =
  "w-full rounded-xl border border-[#E4DED8] bg-white px-3 py-2 outline-none transition focus:border-[#E3B48D] focus:ring-4 focus:ring-[#FFF0E2]";

const sectionClass =
  "space-y-4 rounded-2xl border border-[#E8E2DC] bg-white p-5";

const labelClass =
  "mb-1 block text-sm font-medium text-[#4D4843]";

export function VocabularyDrawer({
  open,
  item,
  onClose,
  onSave,
  onDelete,
}: VocabularyDrawerProps) {
  const [form, setForm] = useState<DraftForm>(
    () => createFormFromItem(item),
  );

  const [error, setError] = useState("");

  if (!open) {
    return null;
  }

  function updateForm(patch: Partial<DraftForm>) {
    setForm((currentForm) => ({
      ...currentForm,
      ...patch,
    }));
  }

  function updateMeaning(
    id: string,
    field: keyof Omit<VocabularyMeaning, "id">,
    value: string,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      meanings: currentForm.meanings.map((meaning) =>
        meaning.id === id
          ? { ...meaning, [field]: value }
          : meaning,
      ),
    }));
  }

  function addMeaning() {
    setForm((currentForm) => ({
      ...currentForm,
      meanings: [
        ...currentForm.meanings,
        createEmptyMeaning(),
      ],
    }));
  }

  function deleteMeaning(id: string) {
    setForm((currentForm) => ({
      ...currentForm,
      meanings: currentForm.meanings.filter(
        (meaning) => meaning.id !== id,
      ),
    }));
  }

  function validateForm(): boolean {
    if (!form.german.trim()) {
      setError("Please enter the German word.");
      return false;
    }

    if (form.meanings.length === 0) {
      setError("Please add at least one meaning.");
      return false;
    }

    if (
      form.meanings.some(
        (meaning) => !meaning.translation.trim(),
      )
    ) {
      setError(
        "Please complete the translation for every meaning.",
      );
      return false;
    }

    if (form.type === "noun" && !form.plural.trim()) {
      setError("Please enter the plural form.");
      return false;
    }

    if (
      form.type === "verb" &&
      (!form.praeteritum.trim() || !form.perfekt.trim())
    ) {
      setError(
        "Please complete both Präteritum and Perfekt.",
      );
      return false;
    }

    setError("");
    return true;
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const baseData = {
      german: form.german.trim(),
      level: form.level,
      favorite: form.favorite,
      meanings: form.meanings.map((meaning) => ({
        id: meaning.id,
        translation: meaning.translation.trim(),
        exampleGerman: meaning.exampleGerman.trim(),
        exampleRomanian: meaning.exampleRomanian.trim(),
      })),
    };

    let data: VocabularyFormData;

    if (form.type === "noun") {
      data = {
        ...baseData,
        type: "noun",
        article: form.article,
        plural: form.plural.trim(),
      };
    } else if (form.type === "verb") {
      data = {
        ...baseData,
        type: "verb",
        auxiliary: form.auxiliary,
        praeteritum: form.praeteritum.trim(),
        perfekt: form.perfekt.trim(),
        reflexive: form.reflexive,
        separable: form.separable,
      };
    } else if (form.type === "adjective") {
      data = {
        ...baseData,
        type: "adjective",
        comparative: form.comparative.trim(),
        superlative: form.superlative.trim(),
      };
    } else {
      data = {
        ...baseData,
        type: "expression",
      };
    }

    onSave(data);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Close drawer"
      />

      <aside className="relative z-10 h-full w-full max-w-2xl overflow-y-auto bg-[#FCFBF9] shadow-2xl">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#ECE8E3] bg-[#FCFBF9]/95 px-6 py-5 backdrop-blur">
          <div>
            <h2 className="text-xl font-semibold text-[#1F1D1B]">
              {item ? "Edit vocabulary" : "Add vocabulary"}
            </h2>
            <p className="mt-1 text-sm text-[#77716B]">
              Add grammar forms, meanings and examples.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-[#77716B] transition hover:bg-[#F1ECE7]"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <section className={sectionClass}>
            <h3 className="font-semibold text-[#1F1D1B]">
              General information
            </h3>

            <label className="block">
              <span className={labelClass}>Type</span>
              <select
                value={form.type}
                onChange={(event) =>
                  updateForm({
                    type: event.target.value as VocabularyType,
                  })
                }
                className={inputClass}
              >
                <option value="noun">Noun</option>
                <option value="verb">Verb</option>
                <option value="adjective">Adjective</option>
                <option value="expression">Expression</option>
              </select>
            </label>

            <label className="block">
              <span className={labelClass}>German</span>
              <input
                value={form.german}
                onChange={(event) =>
                  updateForm({ german: event.target.value })
                }
                placeholder={
                  form.type === "noun"
                    ? "Erfahrung"
                    : form.type === "verb"
                      ? "sich bewerben"
                      : "German word"
                }
                className={inputClass}
                required
              />
            </label>

            <label className="block">
              <span className={labelClass}>Level</span>
              <select
                value={form.level}
                onChange={(event) =>
                  updateForm({
                    level: event.target.value as VocabularyLevel,
                  })
                }
                className={inputClass}
              >
                {["A1", "A2", "B1", "B2", "C1", "C2"].map(
                  (level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ),
                )}
              </select>
            </label>
          </section>

          {form.type === "noun" && (
            <section className={sectionClass}>
              <h3 className="font-semibold text-[#1F1D1B]">
                Noun forms
              </h3>

              <label className="block">
                <span className={labelClass}>Article</span>
                <select
                  value={form.article}
                  onChange={(event) =>
                    updateForm({
                      article: event.target.value as
                        | "der"
                        | "die"
                        | "das",
                    })
                  }
                  className={inputClass}
                >
                  <option value="der">der</option>
                  <option value="die">die</option>
                  <option value="das">das</option>
                </select>
              </label>

              <label className="block">
                <span className={labelClass}>Plural</span>
                <input
                  value={form.plural}
                  onChange={(event) =>
                    updateForm({ plural: event.target.value })
                  }
                  placeholder="Erfahrungen"
                  className={inputClass}
                />
              </label>
            </section>
          )}

          {form.type === "verb" && (
            <section className={sectionClass}>
              <h3 className="font-semibold text-[#1F1D1B]">
                Verb forms
              </h3>

              <label className="block">
                <span className={labelClass}>Auxiliary</span>
                <select
                  value={form.auxiliary}
                  onChange={(event) =>
                    updateForm({
                      auxiliary: event.target.value as
                        | "haben"
                        | "sein",
                    })
                  }
                  className={inputClass}
                >
                  <option value="haben">haben</option>
                  <option value="sein">sein</option>
                </select>
              </label>

              <label className="block">
                <span className={labelClass}>Präteritum</span>
                <input
                  value={form.praeteritum}
                  onChange={(event) =>
                    updateForm({
                      praeteritum: event.target.value,
                    })
                  }
                  placeholder="bewarb sich"
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className={labelClass}>Perfekt</span>
                <input
                  value={form.perfekt}
                  onChange={(event) =>
                    updateForm({ perfekt: event.target.value })
                  }
                  placeholder="hat sich beworben"
                  className={inputClass}
                />
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.reflexive}
                  onChange={(event) =>
                    updateForm({
                      reflexive: event.target.checked,
                    })
                  }
                />
                <span className="text-sm text-[#4D4843]">
                  Reflexive verb
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.separable}
                  onChange={(event) =>
                    updateForm({
                      separable: event.target.checked,
                    })
                  }
                />
                <span className="text-sm text-[#4D4843]">
                  Separable verb
                </span>
              </label>
            </section>
          )}

          {form.type === "adjective" && (
            <section className={sectionClass}>
              <h3 className="font-semibold text-[#1F1D1B]">
                Adjective forms
              </h3>

              <label className="block">
                <span className={labelClass}>Comparative</span>
                <input
                  value={form.comparative}
                  onChange={(event) =>
                    updateForm({
                      comparative: event.target.value,
                    })
                  }
                  placeholder="zuverlässiger"
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className={labelClass}>Superlative</span>
                <input
                  value={form.superlative}
                  onChange={(event) =>
                    updateForm({
                      superlative: event.target.value,
                    })
                  }
                  placeholder="am zuverlässigsten"
                  className={inputClass}
                />
              </label>
            </section>
          )}

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-[#1F1D1B]">
                  Meanings
                </h3>
                <p className="mt-1 text-sm text-[#77716B]">
                  Add one or more Romanian meanings.
                </p>
              </div>

              <button
                type="button"
                onClick={addMeaning}
                className="flex items-center gap-2 rounded-xl border border-[#E4DED8] bg-white px-4 py-2 text-sm font-medium text-[#4D4843] transition hover:bg-[#F8F4F0]"
              >
                <Plus size={17} />
                Add meaning
              </button>
            </div>

            <div className="space-y-4">
              {form.meanings.map((meaning, index) => (
                <VocabularyMeaningCard
                  key={meaning.id}
                  meaning={meaning}
                  index={index}
                  canDelete={form.meanings.length > 1}
                  onChange={updateMeaning}
                  onDelete={deleteMeaning}
                />
              ))}
            </div>
          </section>

          <label className="flex items-center gap-3 rounded-xl border border-[#E8E2DC] bg-white px-4 py-3">
            <input
              type="checkbox"
              checked={form.favorite}
              onChange={(event) =>
                updateForm({
                  favorite: event.target.checked,
                })
              }
            />
            <span className="text-sm font-medium text-[#4D4843]">
              Add to favorites
            </span>
          </label>

          <div className="flex items-center justify-between gap-4 border-t border-[#ECE8E3] pt-5">
            <div>
              {item && onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Delete vocabulary
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#E4DED8] bg-white px-4 py-2 text-sm font-medium text-[#4D4843]"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-xl bg-[#1F1D1B] px-5 py-2 text-sm font-medium text-white transition hover:bg-black"
              >
                Save vocabulary
              </button>
            </div>
          </div>
        </form>
      </aside>
    </div>
  );
}
