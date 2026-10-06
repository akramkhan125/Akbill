import type { AccentId } from "./types";

export const ACCENTS: {
  id: AccentId;
  label: string;
  swatch: string;
}[] = [
  { id: "gold", label: "Gold", swatch: "#f0c94e" },
  { id: "emerald", label: "Emerald", swatch: "#34d399" },
  { id: "sapphire", label: "Sapphire", swatch: "#60a5fa" },
  { id: "crimson", label: "Crimson", swatch: "#e25555" },
  { id: "violet", label: "Violet", swatch: "#a78bfa" },
  { id: "sunset", label: "Sunset", swatch: "#fb923c" },
  { id: "ocean", label: "Ocean", swatch: "#22d3ee" },
  { id: "rose", label: "Rose", swatch: "#fb7185" },
  { id: "copper", label: "Copper", swatch: "#d4a574" },
  { id: "teal", label: "Teal", swatch: "#2dd4bf" },
];
