import { STORAGE_KEY, LEGACY_KEYS } from "./constants";
import { roundToNearest10 } from "./money";
import type { AccentId, Customer, NameLang, Persisted, SavedName, ThemeMode, UiLang } from "./types";

const ACCENTS: AccentId[] = [
  "gold",
  "emerald",
  "sapphire",
  "crimson",
  "violet",
  "sunset",
  "ocean",
  "rose",
  "copper",
  "teal",
];

export const DEFAULTS: Persisted = {
  v: 4,
  theme: "dark",
  accent: "gold",
  lang: "en",
  defaultRate: 0,
  rate: 0,
  sound: true,
  customers: [],
  savedNames: [],
};

function asAccent(v: unknown): AccentId {
  return ACCENTS.includes(v as AccentId) ? (v as AccentId) : "gold";
}

function asTheme(v: unknown): ThemeMode {
  return v === "light" ? "light" : "dark";
}

function asLang(v: unknown): UiLang {
  return v === "ur" ? "ur" : "en";
}

function asNameLang(v: unknown): NameLang {
  return v === "ur" ? "ur" : "en";
}

function asNum(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function migrateCustomer(raw: unknown, index: number): Customer | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Record<string, unknown>;
  const name = String(c.name ?? c.customerName ?? "").trim();
  if (!name) return null;
  const terms = Array.isArray(c.terms)
    ? c.terms.map((t) => asNum(t)).filter((t) => t > 0)
    : typeof c.units === "number"
      ? [asNum(c.units)]
      : [];
  const units = terms.reduce((a, b) => a + b, 0) || asNum(c.units);
  const amount = roundToNearest10(asNum(c.amount ?? c.bill ?? units * asNum(c.rate)));
  return {
    id: String(c.id ?? `mig_${Date.now()}_${index}`),
    name,
    lang: asNameLang(c.lang ?? c.nameLang),
    terms: terms.length ? terms : units ? [units] : [],
    units,
    amount,
    createdAt: asNum(c.createdAt, Date.now()),
  };
}

function coerce(raw: unknown): Persisted {
  if (!raw || typeof raw !== "object") return { ...DEFAULTS };
  const r = raw as Record<string, unknown>;
  const settings = (r.settings && typeof r.settings === "object" ? r.settings : r) as Record<
    string,
    unknown
  >;
  const customersRaw = Array.isArray(r.customers) ? r.customers : [];
  const namesRaw = Array.isArray(r.savedNames)
    ? r.savedNames
    : Array.isArray(r.savedCustomerNames)
      ? r.savedCustomerNames
      : [];
  const savedNames: SavedName[] = namesRaw
    .map((n) => {
      if (typeof n === "string") return { name: n, lang: "en" as const };
      if (n && typeof n === "object" && "name" in n) {
        const o = n as { name: unknown; lang?: unknown };
        return { name: String(o.name), lang: asNameLang(o.lang) };
      }
      return null;
    })
    .filter((n): n is SavedName => !!n && n.name.trim().length > 0);

  const defaultRate = asNum(settings.defaultRate ?? r.defaultRate ?? r.unitRate);
  const rate = asNum(r.rate, defaultRate);

  return {
    v: 4,
    theme: asTheme(settings.theme ?? r.theme),
    accent: asAccent(settings.accent ?? settings.color ?? r.accent ?? r.color),
    lang: asLang(settings.lang ?? r.lang),
    defaultRate,
    rate,
    sound: settings.sound !== false && r.sound !== false,
    customers: customersRaw
      .map(migrateCustomer)
      .filter((c): c is Customer => c !== null)
      .map((c) => ({ ...c, amount: roundToNearest10(c.amount) })),
    savedNames,
  };
}

export function loadPersisted(): Persisted {
  if (typeof localStorage === "undefined") return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return coerce(JSON.parse(raw));
    for (const key of LEGACY_KEYS) {
      const legacy = localStorage.getItem(key);
      if (legacy) return coerce(JSON.parse(legacy));
    }
  } catch {
    /* ignore corrupt storage */
  }
  return { ...DEFAULTS };
}

export function savePersisted(data: Persisted) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, v: 4 as const }));
  } catch {
    /* quota */
  }
}

export function downloadBackup(data: Persisted) {
  const blob = new Blob([JSON.stringify({ ...data, v: 4 }, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `bill-calculator-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 500);
}

export async function readBackupFile(file: File): Promise<Persisted> {
  const text = await file.text();
  return coerce(JSON.parse(text));
}
