import {
  Download,
  Upload,
} from "lucide-react";
import {
  useRef,
  useState,
} from "react";

import {
  createDefaultVocabularyKnowledge,
  createDefaultVocabularyReview,
} from "../../../shared/types/vocabulary";

import type {
  ChangeEvent,
} from "react";
import type {
  VocabularyItem,
  VocabularyLevel,
  VocabularyType,
} from "../../../shared/types/vocabulary";

interface VocabularyBackupActionsProps {
  items: VocabularyItem[];
  onImport: (
    items: VocabularyItem[],
  ) => void;
}

type ImportMessage = {
  type: "success" | "error";
  text: string;
} | null;

type UnknownRecord = Record<
  string,
  unknown
>;

type ParsedImportResult = {
  items: VocabularyItem[];
  invalidRows: number;
};

const vocabularyTypes: VocabularyType[] = [
  "noun",
  "verb",
  "adjective",
  "expression",
];

const vocabularyLevels: VocabularyLevel[] = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
];

function isRecord(
  value: unknown,
): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isVocabularyLevel(
  value: string,
): value is VocabularyLevel {
  return vocabularyLevels.includes(
    value as VocabularyLevel,
  );
}

function isVocabularyItem(
  value: unknown,
): value is VocabularyItem {
  if (!isRecord(value)) {
    return false;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.german !== "string" ||
    typeof value.favorite !== "boolean" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string"
  ) {
    return false;
  }

  if (
    typeof value.type !== "string" ||
    !vocabularyTypes.includes(
      value.type as VocabularyType,
    )
  ) {
    return false;
  }

  if (
    typeof value.level !== "string" ||
    !vocabularyLevels.includes(
      value.level as VocabularyLevel,
    )
  ) {
    return false;
  }

  if (!Array.isArray(value.meanings)) {
    return false;
  }

  const meaningsAreValid =
    value.meanings.every((meaning) => {
      if (!isRecord(meaning)) {
        return false;
      }

      return (
        typeof meaning.id === "string" &&
        typeof meaning.translation ===
          "string" &&
        typeof meaning.exampleGerman ===
          "string" &&
        typeof meaning.exampleRomanian ===
          "string"
      );
    });

  if (!meaningsAreValid) {
    return false;
  }

  if (value.type === "noun") {
    return (
      (value.article === "der" ||
        value.article === "die" ||
        value.article === "das") &&
      typeof value.plural === "string"
    );
  }

  if (value.type === "verb") {
    return (
      (value.auxiliary === "haben" ||
        value.auxiliary === "sein" ||
        value.auxiliary === "both") &&
      typeof value.praeteritum ===
        "string" &&
      typeof value.perfekt ===
        "string" &&
      typeof value.reflexive ===
        "boolean" &&
      typeof value.separable ===
        "boolean"
    );
  }

  if (value.type === "adjective") {
    return (
      typeof value.comparative ===
        "string" &&
      typeof value.superlative ===
        "string"
    );
  }

  return value.type === "expression";
}

function createBackupFileName() {
  const date = new Date()
    .toISOString()
    .slice(0, 10);

  return `deutschpal-vocabulary-${date}.json`;
}

function createVocabularyKey(
  item: Pick<
    VocabularyItem,
    "type" | "german"
  >,
) {
  return `${item.type}:${item.german}`
    .trim()
    .toLocaleLowerCase("de-DE");
}

function normalizeHeader(
  value: string,
) {
  return value
    .trim()
    .toLocaleLowerCase("ro-RO")
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function parseDelimitedLine(
  line: string,
  delimiter: string,
) {
  const cells: string[] = [];
  let currentCell = "";
  let quoted = false;

  for (
    let index = 0;
    index < line.length;
    index += 1
  ) {
    const character =
      line[index];

    if (character === '"') {
      const nextCharacter =
        line[index + 1];

      if (
        quoted &&
        nextCharacter === '"'
      ) {
        currentCell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }

      continue;
    }

    if (
      character === delimiter &&
      !quoted
    ) {
      cells.push(
        currentCell.trim(),
      );
      currentCell = "";
      continue;
    }

    currentCell += character;
  }

  cells.push(
    currentCell.trim(),
  );

  return cells;
}

function parseDelimitedText(
  text: string,
  delimiter: string,
) {
  const normalizedText =
    text.replace(/\r\n/g, "\n");

  const rows: string[][] = [];
  let currentRow = "";
  let quoted = false;

  for (
    let index = 0;
    index < normalizedText.length;
    index += 1
  ) {
    const character =
      normalizedText[index];

    if (character === '"') {
      const nextCharacter =
        normalizedText[
          index + 1
        ];

      if (
        quoted &&
        nextCharacter === '"'
      ) {
        currentRow += '""';
        index += 1;
        continue;
      }

      quoted = !quoted;
      currentRow += character;
      continue;
    }

    if (
      character === "\n" &&
      !quoted
    ) {
      if (
        currentRow.trim().length >
        0
      ) {
        rows.push(
          parseDelimitedLine(
            currentRow,
            delimiter,
          ),
        );
      }

      currentRow = "";
      continue;
    }

    currentRow += character;
  }

  if (
    currentRow.trim().length > 0
  ) {
    rows.push(
      parseDelimitedLine(
        currentRow,
        delimiter,
      ),
    );
  }

  return rows;
}

function getCell(
  row: string[],
  headerIndexes: Map<
    string,
    number
  >,
  aliases: string[],
) {
  for (const alias of aliases) {
    const index =
      headerIndexes.get(
        normalizeHeader(alias),
      );

    if (
      index !== undefined
    ) {
      return (
        row[index]?.trim() ?? ""
      );
    }
  }

  return "";
}

function inferVocabularyType(
  headerIndexes: Map<
    string,
    number
  >,
  explicitType: string,
): VocabularyType | null {
  const normalizedType =
    normalizeHeader(
      explicitType,
    );

  if (
    normalizedType === "noun" ||
    normalizedType ===
      "substantiv"
  ) {
    return "noun";
  }

  if (
    normalizedType === "verb"
  ) {
    return "verb";
  }

  if (
    normalizedType ===
      "adjective" ||
    normalizedType ===
      "adjectiv"
  ) {
    return "adjective";
  }

  if (
    normalizedType ===
      "expression" ||
    normalizedType ===
      "expresie"
  ) {
    return "expression";
  }

  const headers = new Set(
    headerIndexes.keys(),
  );

  if (
    headers.has("article") ||
    headers.has("articol") ||
    headers.has("plural")
  ) {
    return "noun";
  }

  if (
    headers.has("praeteritum") ||
    headers.has("prateritum") ||
    headers.has("imperfekt") ||
    headers.has("partizip ii") ||
    headers.has("perfekt") ||
    headers.has("infinitiv") ||
    headers.has("infinitive")
  ) {
    return "verb";
  }

  if (
    headers.has("comparative") ||
    headers.has("comparativ") ||
    headers.has("superlative") ||
    headers.has("superlativ")
  ) {
    return "adjective";
  }

  if (
    headers.has("expression") ||
    headers.has("expresie")
  ) {
    return "expression";
  }

  return null;
}

function parsePerfektData(
  rawValue: string,
  explicitAuxiliary: string,
) {
  const normalizedRaw =
    rawValue.trim();

  const auxiliaryValue =
    normalizeHeader(
      explicitAuxiliary,
    );

  let auxiliary:
    | "haben"
    | "sein"
    | "both" =
      auxiliaryValue === "sein"
        ? "sein"
        : auxiliaryValue ===
              "both" ||
            auxiliaryValue ===
              "ambele"
          ? "both"
          : "haben";

  let partizipII =
    normalizedRaw;

  const markerMatch =
    normalizedRaw.match(
      /^\(([^)]+)\)\s*(.+)$/i,
    );

  if (markerMatch) {
    const marker =
      normalizeHeader(
        markerMatch[1] ?? "",
      );

    partizipII =
      markerMatch[2]?.trim() ??
      "";

    if (
      marker.includes("ist") &&
      marker.includes("hat")
    ) {
      auxiliary = "both";
    } else if (
      marker.includes("ist")
    ) {
      auxiliary = "sein";
    } else if (
      marker.includes("hat")
    ) {
      auxiliary = "haben";
    }
  }

  if (
    /^(ist\/hat|hat\/ist)\s+/i.test(
      normalizedRaw,
    )
  ) {
    auxiliary = "both";
    partizipII =
      normalizedRaw.replace(
        /^(ist\/hat|hat\/ist)\s+/i,
        "",
      );
  } else if (
    /^ist\s+/i.test(
      normalizedRaw,
    )
  ) {
    auxiliary = "sein";
    partizipII =
      normalizedRaw.replace(
        /^ist\s+/i,
        "",
      );
  } else if (
    /^hat\s+/i.test(
      normalizedRaw,
    )
  ) {
    auxiliary = "haben";
    partizipII =
      normalizedRaw.replace(
        /^hat\s+/i,
        "",
      );
  }

  const perfekt =
    auxiliary === "sein"
      ? `ist ${partizipII}`
      : auxiliary === "both"
        ? `ist/hat ${partizipII}`
        : `hat ${partizipII}`;

  return {
    auxiliary,
    perfekt,
  };
}

function createImportedItem(
  row: string[],
  headerIndexes: Map<
    string,
    number
  >,
): VocabularyItem | null {
  const explicitType =
    getCell(
      row,
      headerIndexes,
      [
        "type",
        "tip",
      ],
    );

  const type =
    inferVocabularyType(
      headerIndexes,
      explicitType,
    );

  if (!type) {
    return null;
  }

  const german =
    getCell(
      row,
      headerIndexes,
      [
        "german",
        "deutsch",
        "substantiv",
        "verb",
        "adjective",
        "adjectiv",
        "expression",
        "expresie",
        "infinitiv",
        "infinitive",
        "word",
        "cuvant",
      ],
    ).trim();

  if (!german) {
    return null;
  }

  const levelValue =
    getCell(
      row,
      headerIndexes,
      [
        "level",
        "nivel",
      ],
    ).toLocaleUpperCase();

  const level:
    VocabularyLevel =
      isVocabularyLevel(
        levelValue,
      )
        ? levelValue
        : "B1";

  const translation =
    getCell(
      row,
      headerIndexes,
      [
        "romanian",
        "traducere romana",
        "traducere",
        "translation",
        "meaning",
        "sens",
      ],
    );

  const exampleGerman =
    getCell(
      row,
      headerIndexes,
      [
        "example german",
        "exemplu german",
        "german example",
      ],
    );

  const exampleRomanian =
    getCell(
      row,
      headerIndexes,
      [
        "example romanian",
        "exemplu roman",
        "exemplu romana",
        "romanian example",
      ],
    );

  const now =
    new Date().toISOString();

  const baseItem = {
    id:
      `${type}-${german
        .trim()
        .toLocaleLowerCase(
          "de-DE",
        )
        .replace(
          /[^a-z0-9äöüß]+/gi,
          "-",
        )
        .replace(
          /^-+|-+$/g,
          "",
        )}-${crypto.randomUUID()}`,

    type,
    german,
    level,
    favorite: false,
    createdAt: now,
    updatedAt: now,

    review:
      createDefaultVocabularyReview(),

    knowledge:
      createDefaultVocabularyKnowledge(),

    meanings: [
      {
        id:
          crypto.randomUUID(),

        translation,

        exampleGerman,

        exampleRomanian,
      },
    ],
  };

  if (type === "noun") {
    const article =
      getCell(
        row,
        headerIndexes,
        [
          "article",
          "articol",
        ],
      ).toLocaleLowerCase();

    if (
      article !== "der" &&
      article !== "die" &&
      article !== "das"
    ) {
      return null;
    }

    return {
      ...baseItem,
      type: "noun",
      article,
      plural:
        getCell(
          row,
          headerIndexes,
          ["plural"],
        ),
    } as VocabularyItem;
  }

  if (type === "verb") {
    const praeteritum =
      getCell(
        row,
        headerIndexes,
        [
          "praeteritum",
          "prateritum",
          "imperfekt",
          "imperfekt prateritum",
        ],
      );

    const rawPerfekt =
      getCell(
        row,
        headerIndexes,
        [
          "perfekt",
          "partizip ii",
          "partizip 2",
        ],
      );

    const explicitAuxiliary =
      getCell(
        row,
        headerIndexes,
        [
          "auxiliary",
          "auxiliar",
        ],
      );

    const {
      auxiliary,
      perfekt,
    } =
      parsePerfektData(
        rawPerfekt,
        explicitAuxiliary,
      );

    return {
      ...baseItem,
      type: "verb",
      auxiliary,
      praeteritum,
      perfekt,
      reflexive: false,
      separable: false,
    } as VocabularyItem;
  }

  if (type === "adjective") {
    return {
      ...baseItem,
      type: "adjective",
      comparative:
        getCell(
          row,
          headerIndexes,
          [
            "comparative",
            "comparativ",
          ],
        ),

      superlative:
        getCell(
          row,
          headerIndexes,
          [
            "superlative",
            "superlativ",
          ],
        ),
    } as VocabularyItem;
  }

  return {
    ...baseItem,
    type: "expression",
  } as VocabularyItem;
}

function parseTabularImport(
  text: string,
  delimiter: string,
): ParsedImportResult {
  const rows =
    parseDelimitedText(
      text,
      delimiter,
    );

  if (rows.length < 2) {
    throw new Error(
      "The file must contain a header row and at least one vocabulary row.",
    );
  }

  const headers =
    rows[0].map(
      normalizeHeader,
    );

  const headerIndexes =
    new Map<string, number>();

  headers.forEach(
    (header, index) => {
      headerIndexes.set(
        header,
        index,
      );
    },
  );

  const importedItems:
    VocabularyItem[] = [];

  let invalidRows = 0;

  rows
    .slice(1)
    .forEach((row) => {
      const item =
        createImportedItem(
          row,
          headerIndexes,
        );

      if (item) {
        importedItems.push(
          item,
        );
      } else {
        invalidRows += 1;
      }
    });

  return {
    items: importedItems,
    invalidRows,
  };
}

function parseJsonImport(
  text: string,
): ParsedImportResult {
  const parsed: unknown =
    JSON.parse(text);

  let importedItems: unknown[];

  if (Array.isArray(parsed)) {
    importedItems = parsed;
  } else if (
    isRecord(parsed) &&
    Array.isArray(parsed.vocabulary)
  ) {
    importedItems =
      parsed.vocabulary;
  } else {
    throw new Error(
      "The JSON file does not contain a vocabulary list.",
    );
  }

  const validItems =
    importedItems.filter(
      isVocabularyItem,
    );

  return {
    items: validItems,
    invalidRows:
      importedItems.length -
      validItems.length,
  };
}

function getUniqueImportItems(
  currentItems: VocabularyItem[],
  importedItems: VocabularyItem[],
) {
  const knownWords =
    new Set(
      currentItems.map(
        createVocabularyKey,
      ),
    );

  const uniqueItems:
    VocabularyItem[] = [];

  let skippedDuplicates = 0;

  importedItems.forEach(
    (item) => {
      const key =
        createVocabularyKey(
          item,
        );

      if (
        knownWords.has(key)
      ) {
        skippedDuplicates += 1;
        return;
      }

      knownWords.add(key);
      uniqueItems.push(item);
    },
  );

  return {
    uniqueItems,
    skippedDuplicates,
  };
}

export function VocabularyBackupActions({
  items,
  onImport,
}: VocabularyBackupActionsProps) {
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [message, setMessage] =
    useState<ImportMessage>(null);

  function handleExport() {
    const backup = {
      app: "DeutschPal",
      version: 1,
      exportedAt:
        new Date().toISOString(),
      vocabulary: items,
    };

    const json = JSON.stringify(
      backup,
      null,
      2,
    );

    const blob = new Blob([json], {
      type: "application/json",
    });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      createBackupFileName();

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    setMessage({
      type: "success",
      text: `${items.length} vocabulary items exported.`,
    });
  }

  function openFilePicker() {
    setMessage(null);
    fileInputRef.current?.click();
  }

  async function handleImport(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const text =
        await file.text();

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLocaleLowerCase();

      let parsedResult:
        ParsedImportResult;

      if (extension === "json") {
        parsedResult =
          parseJsonImport(text);
      } else if (
        extension === "tsv"
      ) {
        parsedResult =
          parseTabularImport(
            text,
            "\t",
          );
      } else if (
        extension === "csv"
      ) {
        parsedResult =
          parseTabularImport(
            text,
            ",",
          );
      } else {
        throw new Error(
          "Unsupported file type. Use JSON, CSV or TSV.",
        );
      }

      if (
        parsedResult.items.length ===
        0
      ) {
        throw new Error(
          "No valid vocabulary items were found.",
        );
      }

      const {
        uniqueItems,
        skippedDuplicates,
      } = getUniqueImportItems(
        items,
        parsedResult.items,
      );

      if (
        uniqueItems.length > 0
      ) {
        onImport(uniqueItems);
      }

      setMessage({
        type: "success",
        text:
          `Import complete: ${uniqueItems.length} added, ` +
          `${skippedDuplicates} duplicates skipped, ` +
          `${parsedResult.invalidRows} invalid rows skipped.`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "The file could not be imported.";

      setMessage({
        type: "error",
        text: errorMessage,
      });
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.csv,.tsv,application/json,text/csv,text/tab-separated-values"
          onChange={handleImport}
          className="hidden"
        />

        <button
          type="button"
          onClick={openFilePicker}
          className="flex min-h-11 items-center gap-2 rounded-xl border border-[#E4DED8] bg-white px-4 text-sm font-medium text-[#4D4843] transition hover:bg-[#F8F4F0]"
        >
          <Upload size={17} />
          Import
        </button>

        <button
          type="button"
          onClick={handleExport}
          disabled={items.length === 0}
          className="flex min-h-11 items-center gap-2 rounded-xl border border-[#E4DED8] bg-white px-4 text-sm font-medium text-[#4D4843] transition hover:bg-[#F8F4F0] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={17} />
          Export
        </button>
      </div>

      <p className="max-w-sm text-right text-xs text-[#938C85]">
        JSON, CSV and TSV are supported. Duplicate words are ignored automatically.
      </p>

      {message && (
        <p
          className={
            message.type === "success"
              ? "max-w-sm text-right text-xs font-medium text-green-700"
              : "max-w-sm text-right text-xs font-medium text-red-600"
          }
        >
          {message.text}
        </p>
      )}
    </div>
  );
}