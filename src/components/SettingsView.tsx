import { Download, RefreshCw, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_AUTHOR, APP_VERSION } from "@/lib/bill/constants";
import { t } from "@/lib/bill/i18n";
import { downloadBackup, readBackupFile } from "@/lib/bill/storage";
import { useBillStore } from "@/lib/bill/store";
import { ACCENTS } from "@/lib/bill/themes";
import { fetchRemoteVersion, isNewer } from "@/lib/bill/version";
import { cn } from "@/lib/utils";

export function SettingsView() {
  const lang = useBillStore((s) => s.lang);
  const accent = useBillStore((s) => s.accent);
  const sound = useBillStore((s) => s.sound);
  const rate = useBillStore((s) => s.rate);
  const setAccent = useBillStore((s) => s.setAccent);
  const setLang = useBillStore((s) => s.setLang);
  const setSound = useBillStore((s) => s.setSound);
  const saveDefaultRate = useBillStore((s) => s.saveDefaultRate);
  const replaceAll = useBillStore((s) => s.replaceAll);
  const askConfirm = useBillStore((s) => s.askConfirm);
  const setToast = useBillStore((s) => s.setToast);
  const setUpdateAvailable = useBillStore((s) => s.setUpdateAvailable);
  const persist = useBillStore((s) => s.persist);
  const fileRef = useRef<HTMLInputElement>(null);
  const [checking, setChecking] = useState(false);

  async function onCheck() {
    setChecking(true);
    const remote = await fetchRemoteVersion();
    setChecking(false);
    if (remote && isNewer(remote)) {
      setUpdateAvailable(remote);
      setToast(t(lang, "newVersion"));
    } else {
      setToast(t(lang, "upToDate"));
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-5 pb-16">
      <h1 className="font-display text-2xl font-semibold">{t(lang, "settings")}</h1>

      <section className="card-surface p-4">
        <h2 className="text-xs font-medium uppercase tracking-wide text-[var(--fg-muted)]">
          {t(lang, "appearance")}
        </h2>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {ACCENTS.map((a) => (
            <button
              key={a.id}
              type="button"
              title={a.label}
              aria-label={a.label}
              aria-pressed={accent === a.id}
              onClick={() => setAccent(a.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-[var(--radius-md)] p-2",
                accent === a.id && "bg-[var(--bg)] shadow-[var(--shadow-border)]",
              )}
            >
              <span
                className="size-8 rounded-full"
                style={{ background: a.swatch, boxShadow: "0 0 0 1px color-mix(in oklab, black 20%, transparent)" }}
              />
              <span className="text-[10px] text-[var(--fg-muted)]">{a.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card-surface p-4">
        <h2 className="text-xs font-medium uppercase tracking-wide text-[var(--fg-muted)]">
          {t(lang, "language")}
        </h2>
        <div className="seg mt-3 w-full">
          <button
            type="button"
            className={cn("seg-btn flex-1", lang === "en" && "seg-btn-on")}
            onClick={() => setLang("en")}
          >
            {t(lang, "english")}
          </button>
          <button
            type="button"
            className={cn("seg-btn flex-1 font-urdu", lang === "ur" && "seg-btn-on")}
            onClick={() => setLang("ur")}
          >
            {t(lang, "urdu")}
          </button>
        </div>
      </section>

      <section className="card-surface p-4">
        <h2 className="text-xs font-medium uppercase tracking-wide text-[var(--fg-muted)]">
          {t(lang, "billSetup")}
        </h2>
        <label className="mt-3 block text-sm text-[var(--fg-muted)]" htmlFor="def-rate">
          {t(lang, "defaultRate")}
        </label>
        <Input
          id="def-rate"
          inputMode="decimal"
          defaultValue={rate ? String(rate) : ""}
          placeholder="32.16"
          onBlur={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n) && n >= 0) {
              useBillStore.getState().setRate(n);
            }
          }}
          className="mt-2"
        />
        <Button
          className="mt-3 w-full"
          variant="secondary"
          onClick={() => {
            saveDefaultRate();
            setToast(t(lang, "rateSaved"));
          }}
        >
          {t(lang, "saveRate")}
        </Button>
      </section>

      <section className="card-surface p-4">
        <h2 className="text-xs font-medium uppercase tracking-wide text-[var(--fg-muted)]">
          {t(lang, "soundEffects")}
        </h2>
        <div className="seg mt-3 w-full">
          <button
            type="button"
            className={cn("seg-btn flex-1", sound && "seg-btn-on")}
            onClick={() => setSound(true)}
          >
            {t(lang, "soundOn")}
          </button>
          <button
            type="button"
            className={cn("seg-btn flex-1", !sound && "seg-btn-on")}
            onClick={() => setSound(false)}
          >
            {t(lang, "soundOff")}
          </button>
        </div>
      </section>

      <section className="card-surface p-4">
        <h2 className="text-xs font-medium uppercase tracking-wide text-[var(--fg-muted)]">{t(lang, "data")}</h2>
        <div className="mt-3 flex flex-col gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              persist();
              downloadBackup({
                v: 4,
                theme: useBillStore.getState().theme,
                accent: useBillStore.getState().accent,
                lang: useBillStore.getState().lang,
                defaultRate: useBillStore.getState().defaultRate,
                rate: useBillStore.getState().rate,
                sound: useBillStore.getState().sound,
                customers: useBillStore.getState().customers,
                savedNames: useBillStore.getState().savedNames,
              });
              setToast(t(lang, "backupSaved"));
            }}
          >
            <Download className="size-4" />
            {t(lang, "backup")}
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <Upload className="size-4" />
            {t(lang, "restore")}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              try {
                const data = await readBackupFile(file);
                replaceAll(data);
                setToast(t(lang, "restored"));
              } catch {
                setToast("Could not restore that file");
              }
            }}
          />
          <Button variant="danger" sound="none" onClick={() => askConfirm("clearAll")}>
            {t(lang, "clearAll")}
          </Button>
        </div>
      </section>

      <section className="card-surface p-4">
        <h2 className="text-xs font-medium uppercase tracking-wide text-[var(--fg-muted)]">{t(lang, "about")}</h2>
        <p className="mt-3 font-display text-lg font-semibold">Bill Calculator</p>
        <p className="text-sm text-[var(--fg-muted)]">Made by {APP_AUTHOR}</p>
        <p className="mt-1 text-sm tabular-nums text-[var(--fg-subtle)]">
          {t(lang, "version")} {APP_VERSION}
        </p>
        <Button variant="secondary" className="mt-3 w-full" disabled={checking} onClick={() => void onCheck()}>
          <RefreshCw className={cn("size-4", checking && "animate-spin")} />
          {t(lang, "checkUpdates")}
        </Button>
      </section>
    </div>
  );
}
