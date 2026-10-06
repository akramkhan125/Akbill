import { useCallback, useEffect, useState } from "react";
import { BillView } from "@/components/BillView";
import { CalcView } from "@/components/CalcView";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Header } from "@/components/Header";
import { HomeView } from "@/components/HomeView";
import { SettingsView } from "@/components/SettingsView";
import { Splash } from "@/components/Splash";
import { UpdateBanner } from "@/components/UpdateBanner";
import { t } from "@/lib/bill/i18n";
import { useBillStore } from "@/lib/bill/store";
import { fetchRemoteVersion, isNewer } from "@/lib/bill/version";

export function App() {
  const [splash, setSplash] = useState(true);
  const view = useBillStore((s) => s.view);
  const lang = useBillStore((s) => s.lang);
  const toast = useBillStore((s) => s.toast);
  const confirm = useBillStore((s) => s.confirm);
  const confirmId = useBillStore((s) => s.confirmId);
  const hydrate = useBillStore((s) => s.hydrate);
  const askConfirm = useBillStore((s) => s.askConfirm);
  const newBill = useBillStore((s) => s.newBill);
  const clearAll = useBillStore((s) => s.clearAll);
  const removeCustomer = useBillStore((s) => s.removeCustomer);
  const setUpdateAvailable = useBillStore((s) => s.setUpdateAvailable);

  useEffect(() => {
    hydrate();
    void fetchRemoteVersion().then((v) => {
      if (v && isNewer(v)) setUpdateAvailable(v);
    });
  }, [hydrate, setUpdateAvailable]);

  const dismissSplash = useCallback(() => setSplash(false), []);

  const confirmCopy =
    confirm === "newBill"
      ? { title: t(lang, "newBill"), message: t(lang, "newBillConfirm"), danger: true, go: () => newBill() }
      : confirm === "clearAll"
        ? { title: t(lang, "clearAll"), message: t(lang, "clearConfirm"), danger: true, go: () => clearAll() }
        : confirm === "deleteCustomer"
          ? {
              title: t(lang, "delete"),
              message: t(lang, "deleteConfirm"),
              danger: true,
              go: () => confirmId && removeCustomer(confirmId),
            }
          : null;

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg)] text-[var(--fg)]">
      {splash && <Splash onDone={dismissSplash} />}
      <Header />
      <UpdateBanner />
      <main className="flex flex-1 flex-col">
        {view === "home" && <HomeView />}
        {view === "bill" && <BillView />}
        {view === "calc" && <CalcView />}
        {view === "settings" && <SettingsView />}
      </main>
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
          <p className="rounded-full bg-[var(--bg-elevated)] px-4 py-2 text-sm text-[var(--fg)] shadow-[var(--shadow-modal)]">
            {toast}
          </p>
        </div>
      )}
      <ConfirmDialog
        open={!!confirmCopy}
        title={confirmCopy?.title ?? ""}
        message={confirmCopy?.message ?? ""}
        danger={confirmCopy?.danger}
        onCancel={() => askConfirm(null)}
        onConfirm={() => confirmCopy?.go()}
      />
    </div>
  );
}
