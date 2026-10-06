import { create } from "zustand";
import { computeBill } from "./money";
import { play, setSoundEnabled, type SoundKind } from "./sound";
import { DEFAULTS, loadPersisted, savePersisted } from "./storage";
import type { AccentId, Customer, NameLang, Persisted, ThemeMode, UiLang, ViewId } from "./types";

type ConfirmKind = "newBill" | "clearAll" | "deleteCustomer" | null;

type BillState = Persisted & {
  view: ViewId;
  prevView: ViewId;
  name: string;
  nameLang: NameLang;
  terms: number[];
  termInput: string;
  toast: string | null;
  confirm: ConfirmKind;
  confirmId: string | null;
  hydrated: boolean;
  updateAvailable: string | null;
  hydrate: () => void;
  persist: () => void;
  setView: (view: ViewId) => void;
  goBack: () => void;
  setTheme: (theme: ThemeMode) => void;
  setAccent: (accent: AccentId) => void;
  setLang: (lang: UiLang) => void;
  setRate: (rate: number) => void;
  saveDefaultRate: () => void;
  setSound: (sound: boolean) => void;
  setName: (name: string) => void;
  setNameLang: (lang: NameLang) => void;
  pickSavedName: (name: string, lang: NameLang) => void;
  setTermInput: (v: string) => void;
  addTerm: () => boolean;
  removeTerm: (index: number) => void;
  addCustomer: () => "ok" | "needName" | "needTerms" | "needRate";
  removeCustomer: (id: string) => void;
  undoLast: () => void;
  newBill: () => void;
  replaceAll: (data: Persisted) => void;
  clearAll: () => void;
  setToast: (msg: string | null) => void;
  askConfirm: (kind: ConfirmKind, id?: string) => void;
  setUpdateAvailable: (v: string | null) => void;
  beep: (kind: SoundKind) => void;
};

function persistable(s: BillState): Persisted {
  return {
    v: 4,
    theme: s.theme,
    accent: s.accent,
    lang: s.lang,
    defaultRate: s.defaultRate,
    rate: s.rate,
    sound: s.sound,
    customers: s.customers,
    savedNames: s.savedNames,
  };
}

function newId() {
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export const useBillStore = create<BillState>((set, get) => ({
  ...DEFAULTS,
  view: "home",
  prevView: "home",
  name: "",
  nameLang: "en",
  terms: [],
  termInput: "",
  toast: null,
  confirm: null,
  confirmId: null,
  hydrated: false,
  updateAvailable: null,

  hydrate: () => {
    const data = loadPersisted();
    setSoundEnabled(data.sound);
    const rate = data.rate || data.defaultRate || 0;
    set({ ...data, rate, hydrated: true });
    applyDom(data);
  },

  persist: () => savePersisted(persistable(get())),

  setView: (view) => {
    const cur = get().view;
    set({ prevView: cur === "settings" ? get().prevView : cur, view });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  },

  goBack: () => {
    const { view, prevView } = get();
    const next = view === "settings" ? prevView : "home";
    set({ view: next });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  },

  setTheme: (theme) => {
    set({ theme });
    applyDom({ ...get(), theme });
    get().persist();
  },
  setAccent: (accent) => {
    set({ accent });
    applyDom({ ...get(), accent });
    get().persist();
  },
  setLang: (lang) => {
    set({ lang });
    applyDom({ ...get(), lang });
    get().persist();
  },
  setRate: (rate) => {
    set({ rate: Number.isFinite(rate) ? rate : 0 });
    get().persist();
  },
  saveDefaultRate: () => {
    const rate = get().rate;
    set({ defaultRate: rate });
    get().persist();
  },
  setSound: (sound) => {
    setSoundEnabled(sound);
    set({ sound });
    get().persist();
  },
  setName: (name) => set({ name }),
  setNameLang: (nameLang) => set({ nameLang }),
  pickSavedName: (name, lang) => set({ name, nameLang: lang }),
  setTermInput: (termInput) => set({ termInput }),

  addTerm: () => {
    const v = Number(get().termInput.replace(/,/g, ""));
    if (!Number.isFinite(v) || v <= 0) return false;
    set({ terms: [...get().terms, v], termInput: "" });
    get().beep("click");
    return true;
  },

  removeTerm: (index) => {
    set({ terms: get().terms.filter((_, i) => i !== index) });
    get().beep("thud");
  },

  addCustomer: () => {
    const { name, nameLang, terms, rate, savedNames } = get();
    if (!rate || rate <= 0) return "needRate";
    if (!name.trim()) return "needName";
    if (terms.length === 0) return "needTerms";
    const { units, amount } = computeBill(terms, rate);
    const customer: Customer = {
      id: newId(),
      name: name.trim(),
      lang: nameLang,
      terms: [...terms],
      units,
      amount,
      createdAt: Date.now(),
    };
    const exists = savedNames.some(
      (s) => s.name === customer.name && s.lang === customer.lang,
    );
    set({
      customers: [...get().customers, customer],
      savedNames: exists
        ? savedNames
        : [...savedNames, { name: customer.name, lang: customer.lang }],
      name: "",
      terms: [],
      termInput: "",
    });
    get().beep("success");
    get().persist();
    return "ok";
  },

  removeCustomer: (id) => {
    set({ customers: get().customers.filter((c) => c.id !== id), confirm: null, confirmId: null });
    get().beep("thud");
    get().persist();
  },

  undoLast: () => {
    const list = get().customers;
    if (list.length === 0) return;
    set({ customers: list.slice(0, -1) });
    get().beep("thud");
    get().persist();
  },

  newBill: () => {
    set({
      customers: [],
      name: "",
      terms: [],
      termInput: "",
      confirm: null,
    });
    get().beep("thud");
    get().persist();
  },

  replaceAll: (data) => {
    setSoundEnabled(data.sound);
    set({ ...DEFAULTS, ...data, hydrated: true, confirm: null });
    applyDom(data);
    get().persist();
  },

  clearAll: () => {
    setSoundEnabled(DEFAULTS.sound);
    set({
      ...DEFAULTS,
      hydrated: true,
      view: "settings",
      prevView: "home",
      name: "",
      terms: [],
      termInput: "",
      confirm: null,
    });
    applyDom(DEFAULTS);
    get().persist();
  },

  setToast: (toast) => {
    set({ toast });
    if (toast) {
      window.setTimeout(() => {
        if (get().toast === toast) set({ toast: null });
      }, 2200);
    }
  },

  askConfirm: (confirm, id) => set({ confirm, confirmId: id ?? null }),
  setUpdateAvailable: (updateAvailable) => set({ updateAvailable }),
  beep: (kind) => {
    if (get().sound) play(kind);
  },
}));

function applyDom(data: { theme: ThemeMode; accent: AccentId; lang: UiLang }) {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  el.dataset.theme = data.theme;
  el.dataset.accent = data.accent;
  el.lang = data.lang === "ur" ? "ur" : "en";
  el.style.colorScheme = data.theme;
}
