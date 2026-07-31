export type VerbAuxiliary =
  | "haben"
  | "sein"
  | "both";

export interface IrregularVerb {
  id: string;
  infinitive: string;
  praeteritum: string;
  partizipII: string;
  auxiliary: VerbAuxiliary;
  rawPerfekt: string;
  translation: string;
  irregular: true;
}