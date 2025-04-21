// src/types/Note.ts

export interface Note {
  id: string;
  title: string;
  content: string;
  lastUpdated: number; // timestamp
}

export type Notes = Record<string, Note>;
