export type ViewId = "home" | "bill" | "calc" | "settings";
export type ThemeMode = "dark" | "light";
export type UiLang = "en" | "ur";
export type NameLang = "en" | "ur";

export type AccentId =
  | "gold"
  | "emerald"
  | "sapphire"
  | "crimson"
  | "violet"
  | "sunset"
  | "ocean"
  | "rose"
  | "copper"
  | "teal";

export type Customer = {
  id: string;
  name: string;
  lang: NameLang;
  terms: number[];
  units: number;
  amount: number;
  createdAt: number;
};

export type SavedName = {
  name: string;
  lang: NameLang;
};

export type Persisted = {
  v: 4;
  theme: ThemeMode;
  accent: AccentId;
  lang: UiLang;
  defaultRate: number;
  rate: number;
  sound: boolean;
  customers: Customer[];
  savedNames: SavedName[];
};
