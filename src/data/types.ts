export interface ProgramNotes {
  notes: string;
  listenFor: string;
  story: string;
}

export interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  genre: string;
  chapter: string;
  side: Side;
  spotifyId: string | null;
  programNotes: ProgramNotes;
}

export interface Chapter {
  id: string;
  title: string;
  subtitle: string;
  side: Side;
}

export type Side = "A" | "B" | "C" | "D" | "E" | "F";

export interface Record {
  number: number;
  sides: [Side, Side];
  label: string;
}

export const RECORDS: Record[] = [
  { number: 1, sides: ["A", "B"], label: "Record One" },
  { number: 2, sides: ["C", "D"], label: "Record Two" },
  { number: 3, sides: ["E", "F"], label: "Record Three" },
];
