import {
  BookOpen,
  ChevronRight,
  Search,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

import PageHeader from "../shared/components/PageHeader";
import Card from "../shared/ui/Card";

type GrammarLevel =
  | "A1"
  | "A2"
  | "B1";

type GrammarCategory =
  | "Verbs"
  | "Cases"
  | "Sentences"
  | "Adjectives"
  | "Prepositions"
  | "Pronouns";

type GrammarTopic = {
  id: string;
  title: string;
  description: string;
  level: GrammarLevel;
  category: GrammarCategory;
  rules: string[];
  examples: {
    german: string;
    romanian: string;
  }[];
};

const grammarTopics: GrammarTopic[] = [
  {
    id: "word-order-main-clause",
    title: "Word order in main clauses",
    description:
      "The conjugated verb normally occupies the second position.",
    level: "A1",
    category: "Sentences",
    rules: [
      "The conjugated verb is in position 2.",
      "The subject does not always have to be in position 1.",
      "When another element is placed first, the subject follows the verb.",
    ],
    examples: [
      {
        german:
          "Ich lerne heute Deutsch.",
        romanian:
          "Eu învăț astăzi germană.",
      },
      {
        german:
          "Heute lerne ich Deutsch.",
        romanian:
          "Astăzi învăț germană.",
      },
    ],
  },
  {
    id: "weil",
    title: "Subordinate clauses with weil",
    description:
      "Weil introduces a reason and sends the conjugated verb to the end.",
    level: "A2",
    category: "Sentences",
    rules: [
      "A comma separates the main clause from the subordinate clause.",
      "The conjugated verb is placed at the end of the weil-clause.",
      "Weil answers the question Warum?",
    ],
    examples: [
      {
        german:
          "Ich lerne Deutsch, weil ich in Deutschland studiere.",
        romanian:
          "Învăț germană deoarece studiez în Germania.",
      },
      {
        german:
          "Sie bleibt zu Hause, weil sie krank ist.",
        romanian:
          "Ea rămâne acasă deoarece este bolnavă.",
      },
    ],
  },
  {
    id: "dass",
    title: "Subordinate clauses with dass",
    description:
      "Dass introduces reported information, thoughts and opinions.",
    level: "A2",
    category: "Sentences",
    rules: [
      "The conjugated verb is placed at the end.",
      "Dass is frequently used after verbs such as glauben, denken, hoffen and sagen.",
      "A comma is required before the dass-clause.",
    ],
    examples: [
      {
        german:
          "Ich glaube, dass die Prüfung schwierig ist.",
        romanian:
          "Cred că examenul este dificil.",
      },
      {
        german:
          "Sie sagt, dass sie morgen kommt.",
        romanian:
          "Ea spune că vine mâine.",
      },
    ],
  },
  {
    id: "wenn-als",
    title: "Wenn and als",
    description:
      "Use wenn for repeated events or present and future conditions, and als for a single past event.",
    level: "B1",
    category: "Sentences",
    rules: [
      "Wenn is used for present, future and repeated past events.",
      "Als is used for one specific event in the past.",
      "The conjugated verb is placed at the end of the subordinate clause.",
    ],
    examples: [
      {
        german:
          "Wenn ich Zeit habe, lese ich.",
        romanian:
          "Când am timp, citesc.",
      },
      {
        german:
          "Als ich klein war, wohnte ich in Bukarest.",
        romanian:
          "Când eram mică, locuiam în București.",
      },
    ],
  },
  {
    id: "perfekt",
    title: "Perfekt",
    description:
      "The Perfekt tense is commonly used for past events in spoken German.",
    level: "A2",
    category: "Verbs",
    rules: [
      "Perfekt consists of haben or sein and the Partizip II.",
      "Most verbs use haben.",
      "Movement and change-of-state verbs frequently use sein.",
      "The Partizip II is placed at the end of the sentence.",
    ],
    examples: [
      {
        german:
          "Ich habe Deutsch gelernt.",
        romanian:
          "Am învățat germană.",
      },
      {
        german:
          "Sie ist nach Berlin gefahren.",
        romanian:
          "Ea a mers la Berlin.",
      },
    ],
  },
  {
    id: "praeteritum",
    title: "Präteritum",
    description:
      "The Präteritum is common in written language and with modal verbs, sein and haben.",
    level: "B1",
    category: "Verbs",
    rules: [
      "Regular verbs usually receive the ending -te.",
      "Irregular verbs frequently change their stem.",
      "Sein, haben and modal verbs are often used in Präteritum even in spoken German.",
    ],
    examples: [
      {
        german:
          "Ich arbeitete gestern.",
        romanian:
          "Am lucrat ieri.",
      },
      {
        german:
          "Er war müde.",
        romanian:
          "El era obosit.",
      },
    ],
  },
  {
    id: "modal-verbs",
    title: "Modal verbs",
    description:
      "Modal verbs express ability, obligation, permission, intention or preference.",
    level: "A2",
    category: "Verbs",
    rules: [
      "The modal verb is conjugated.",
      "The second verb remains in the infinitive.",
      "The infinitive is placed at the end of the sentence.",
    ],
    examples: [
      {
        german:
          "Ich muss heute lernen.",
        romanian:
          "Trebuie să învăț astăzi.",
      },
      {
        german:
          "Wir können morgen kommen.",
        romanian:
          "Putem veni mâine.",
      },
    ],
  },
  {
    id: "accusative",
    title: "Accusative case",
    description:
      "The accusative usually marks the direct object.",
    level: "A1",
    category: "Cases",
    rules: [
      "Only the masculine definite article changes: der becomes den.",
      "The masculine indefinite article ein becomes einen.",
      "The feminine, neuter and plural forms remain unchanged.",
    ],
    examples: [
      {
        german:
          "Ich kaufe einen Computer.",
        romanian:
          "Cumpăr un calculator.",
      },
      {
        german:
          "Sie liest das Buch.",
        romanian:
          "Ea citește cartea.",
      },
    ],
  },
  {
    id: "dative",
    title: "Dative case",
    description:
      "The dative often marks the indirect object and follows certain verbs and prepositions.",
    level: "A2",
    category: "Cases",
    rules: [
      "Der and das become dem.",
      "Die becomes der.",
      "Plural articles become den, and the noun usually receives an additional -n.",
    ],
    examples: [
      {
        german:
          "Ich helfe dem Studenten.",
        romanian:
          "Îl ajut pe student.",
      },
      {
        german:
          "Sie spricht mit ihrer Freundin.",
        romanian:
          "Ea vorbește cu prietena ei.",
      },
    ],
  },
  {
    id: "two-way-prepositions",
    title: "Two-way prepositions",
    description:
      "Wechselpräpositionen use accusative for direction and dative for location.",
    level: "B1",
    category: "Prepositions",
    rules: [
      "Use accusative when answering Wohin?",
      "Use dative when answering Wo?",
      "Common examples include an, auf, hinter, in, neben, über, unter, vor and zwischen.",
    ],
    examples: [
      {
        german:
          "Ich gehe in die Schule.",
        romanian:
          "Merg la școală.",
      },
      {
        german:
          "Ich bin in der Schule.",
        romanian:
          "Sunt la școală.",
      },
    ],
  },
  {
    id: "adjective-endings",
    title: "Adjective endings",
    description:
      "German adjectives receive different endings depending on article, case, gender and number.",
    level: "B1",
    category: "Adjectives",
    rules: [
      "After a definite article, the adjective usually receives -e or -en.",
      "After an indefinite article, the adjective sometimes carries the gender information.",
      "Case and noun gender determine the final ending.",
    ],
    examples: [
      {
        german:
          "Das ist ein gutes Buch.",
        romanian:
          "Aceasta este o carte bună.",
      },
      {
        german:
          "Ich spreche mit einer netten Kollegin.",
        romanian:
          "Vorbesc cu o colegă drăguță.",
      },
    ],
  },
  {
    id: "relative-clauses",
    title: "Relative clauses",
    description:
      "Relative clauses provide additional information about a noun.",
    level: "B1",
    category: "Pronouns",
    rules: [
      "The relative pronoun agrees with the noun in gender and number.",
      "Its case depends on its function inside the relative clause.",
      "The conjugated verb is placed at the end.",
    ],
    examples: [
      {
        german:
          "Das ist die Frau, die in Berlin arbeitet.",
        romanian:
          "Aceasta este femeia care lucrează în Berlin.",
      },
      {
        german:
          "Der Mann, mit dem ich spreche, ist mein Lehrer.",
        romanian:
          "Bărbatul cu care vorbesc este profesorul meu.",
      },
    ],
  },
];

const categories: (
  | "all"
  | GrammarCategory
)[] = [
  "all",
  "Verbs",
  "Cases",
  "Sentences",
  "Adjectives",
  "Prepositions",
  "Pronouns",
];

const levels: (
  | "all"
  | GrammarLevel
)[] = [
  "all",
  "A1",
  "A2",
  "B1",
];

function GrammarPage() {
  const [searchTerm, setSearchTerm] =
    useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<
    "all" | GrammarCategory
  >("all");

  const [
    selectedLevel,
    setSelectedLevel,
  ] = useState<
    "all" | GrammarLevel
  >("all");

  const [
    selectedTopic,
    setSelectedTopic,
  ] =
    useState<GrammarTopic | null>(
      null,
    );

  const filteredTopics = useMemo(() => {
    const normalizedSearch =
      searchTerm
        .trim()
        .toLocaleLowerCase(
          "de-DE",
        );

    return grammarTopics.filter(
      (topic) => {
        const matchesCategory =
          selectedCategory === "all" ||
          topic.category ===
            selectedCategory;

        const matchesLevel =
          selectedLevel === "all" ||
          topic.level ===
            selectedLevel;

        const searchableText = [
          topic.title,
          topic.description,
          topic.category,
          topic.level,
          ...topic.rules,
          ...topic.examples.flatMap(
            (example) => [
              example.german,
              example.romanian,
            ],
          ),
        ]
          .join(" ")
          .toLocaleLowerCase(
            "de-DE",
          );

        const matchesSearch =
          normalizedSearch.length ===
            0 ||
          searchableText.includes(
            normalizedSearch,
          );

        return (
          matchesCategory &&
          matchesLevel &&
          matchesSearch
        );
      },
    );
  }, [
    searchTerm,
    selectedCategory,
    selectedLevel,
  ]);

  function resetFilters() {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedLevel("all");
  }

  return (
    <>
      <PageHeader
        title="Grammar"
        subtitle="Review essential German grammar from A1 to B1."
      />

      <Card className="p-0">
        <div className="border-b border-[#ECE8E3] p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_160px_auto]">
            <label className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A09A94]"
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value,
                  )
                }
                placeholder="Search grammar topics..."
                className="min-h-12 w-full rounded-xl border border-[#E4DED8] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#E3B48D] focus:ring-4 focus:ring-[#FFF0E2]"
              />
            </label>

            <select
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(
                  event.target
                    .value as
                    | "all"
                    | GrammarCategory,
                )
              }
              className="min-h-12 rounded-xl border border-[#E4DED8] bg-white px-4 text-sm outline-none transition focus:border-[#E3B48D] focus:ring-4 focus:ring-[#FFF0E2]"
            >
              {categories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category === "all"
                      ? "All categories"
                      : category}
                  </option>
                ),
              )}
            </select>

            <select
              value={selectedLevel}
              onChange={(event) =>
                setSelectedLevel(
                  event.target
                    .value as
                    | "all"
                    | GrammarLevel,
                )
              }
              className="min-h-12 rounded-xl border border-[#E4DED8] bg-white px-4 text-sm outline-none transition focus:border-[#E3B48D] focus:ring-4 focus:ring-[#FFF0E2]"
            >
              {levels.map((level) => (
                <option
                  key={level}
                  value={level}
                >
                  {level === "all"
                    ? "All levels"
                    : level}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={resetFilters}
              className="min-h-12 rounded-xl border border-[#E4DED8] bg-white px-4 text-sm font-medium text-[#4D4843] transition hover:bg-[#F8F4F0]"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="border-b border-[#ECE8E3] px-6 py-3">
          <p className="text-sm text-[#77716B]">
            {filteredTopics.length}{" "}
            {filteredTopics.length === 1
              ? "topic"
              : "topics"}
          </p>
        </div>

        {filteredTopics.length > 0 ? (
          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredTopics.map(
              (topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() =>
                    setSelectedTopic(
                      topic,
                    )
                  }
                  className="group rounded-2xl border border-[#E8E2DC] bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-[#E3C6AF] hover:shadow-[0_12px_32px_rgba(31,29,27,0.06)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-[#FFF0E2] text-[#B85F28]">
                      <BookOpen
                        size={21}
                      />
                    </div>

                    <ChevronRight
                      size={19}
                      className="text-[#B4AEA8] transition group-hover:translate-x-1 group-hover:text-[#B85F28]"
                    />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#F8F4F0] px-2.5 py-1 text-xs font-semibold text-[#625C56]">
                      {topic.level}
                    </span>

                    <span className="rounded-full bg-[#F1EEF9] px-2.5 py-1 text-xs font-medium text-[#67558A]">
                      {topic.category}
                    </span>
                  </div>

                  <h2 className="mt-4 text-lg font-semibold text-[#1F1D1B]">
                    {topic.title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#77716B]">
                    {
                      topic.description
                    }
                  </p>
                </button>
              ),
            )}
          </div>
        ) : (
          <div className="px-6 py-20 text-center">
            <h2 className="text-lg font-semibold text-[#1F1D1B]">
              No grammar topics found
            </h2>

            <p className="mt-2 text-sm text-[#77716B]">
              Adjust the search term or
              selected filters.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 rounded-xl border border-[#E4DED8] bg-white px-4 py-2 text-sm font-medium text-[#4D4843] transition hover:bg-[#F8F4F0]"
            >
              Reset filters
            </button>
          </div>
        )}
      </Card>

      {selectedTopic && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/30"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedTopic(null);
            }
          }}
        >
          <aside className="h-full w-full max-w-2xl overflow-y-auto bg-[#FCFAF8] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-5 border-b border-[#ECE8E3] bg-[#FCFAF8]/95 px-6 py-5 backdrop-blur">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#FFF0E2] px-2.5 py-1 text-xs font-semibold text-[#8A5417]">
                    {selectedTopic.level}
                  </span>

                  <span className="rounded-full bg-[#F1EEF9] px-2.5 py-1 text-xs font-medium text-[#67558A]">
                    {
                      selectedTopic.category
                    }
                  </span>
                </div>

                <h2 className="mt-3 text-2xl font-semibold text-[#1F1D1B]">
                  {
                    selectedTopic.title
                  }
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedTopic(null)
                }
                className="rounded-xl border border-[#E4DED8] bg-white px-4 py-2 text-sm font-medium text-[#4D4843] transition hover:bg-[#F8F4F0]"
              >
                Close
              </button>
            </div>

            <div className="space-y-8 px-6 py-7">
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#A09A94]">
                  Explanation
                </h3>

                <p className="mt-3 text-base leading-7 text-[#4D4843]">
                  {
                    selectedTopic.description
                  }
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#1F1D1B]">
                  Rules
                </h3>

                <div className="mt-4 space-y-3">
                  {selectedTopic.rules.map(
                    (rule, index) => (
                      <div
                        key={rule}
                        className="flex gap-3 rounded-xl border border-[#E8E2DC] bg-white p-4"
                      >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#FFF0E2] text-xs font-bold text-[#8A5417]">
                          {index + 1}
                        </span>

                        <p className="text-sm leading-6 text-[#4D4843]">
                          {rule}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#1F1D1B]">
                  Examples
                </h3>

                <div className="mt-4 space-y-4">
                  {selectedTopic.examples.map(
                    (example) => (
                      <div
                        key={
                          example.german
                        }
                        className="rounded-xl border border-[#E8E2DC] bg-white p-5"
                      >
                        <p className="font-semibold text-[#1F1D1B]">
                          {
                            example.german
                          }
                        </p>

                        <p className="mt-2 text-sm text-[#77716B]">
                          {
                            example.romanian
                          }
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </section>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

export default GrammarPage;