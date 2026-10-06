import { FileDown, Printer, Share2, Trash2, Undo2, X } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/bill/i18n";
import {
  amountInWords,
  computeBill,
  formatIndianNumber,
  formatPkr,
  formatRate,
  formatTermsLine,
} from "@/lib/bill/money";
import { customerPdfBytes, downloadPdf, fullBillPdfBytes } from "@/lib/bill/pdf";
import { customerBillHtml, fullBillHtml, printInPopup } from "@/lib/bill/print";
import { useBillStore } from "@/lib/bill/store";
import { shareCustomer, shareFullBill } from "@/lib/bill/whatsapp";
import { cn } from "@/lib/utils";

export function BillView() {
  const lang = useBillStore((s) => s.lang);
  const rate = useBillStore((s) => s.rate);
  const setRate = useBillStore((s) => s.setRate);
  const name = useBillStore((s) => s.name);
  const setName = useBillStore((s) => s.setName);
  const nameLang = useBillStore((s) => s.nameLang);
  const setNameLang = useBillStore((s) => s.setNameLang);
  const terms = useBillStore((s) => s.terms);
  const termInput = useBillStore((s) => s.termInput);
  const setTermInput = useBillStore((s) => s.setTermInput);
  const addTerm = useBillStore((s) => s.addTerm);
  const removeTerm = useBillStore((s) => s.removeTerm);
  const addCustomer = useBillStore((s) => s.addCustomer);
  const customers = useBillStore((s) => s.customers);
  const savedNames = useBillStore((s) => s.savedNames);
  const pickSavedName = useBillStore((s) => s.pickSavedName);
  const undoLast = useBillStore((s) => s.undoLast);
  const askConfirm = useBillStore((s) => s.askConfirm);
  const setToast = useBillStore((s) => s.setToast);
  const beep = useBillStore((s) => s.beep);

  const preview = useMemo(() => computeBill(terms, rate), [terms, rate]);
  const grandUnits = customers.reduce((a, c) => a + c.units, 0);
  const grandAmount = customers.reduce((a, c) => a + c.amount, 0);

  function onAddAll() {
    const res = addCustomer();
    if (res === "ok") setToast(t(lang, "added"));
    else setToast(t(lang, res));
  }

  function tryPrint(html: string) {
    if (!printInPopup(html)) setToast(t(lang, "popupBlocked"));
  }

  function onPdfCustomer(id: string) {
    const c = customers.find((x) => x.id === id);
    if (!c) return;
    beep("pdf");
    downloadPdf(customerPdfBytes(c, rate), `bill-${c.name.replace(/\s+/g, "-")}.pdf`);
    setToast(t(lang, "pdfReady"));
  }

  function onPdfFull() {
    if (customers.length === 0) return;
    beep("pdf");
    downloadPdf(fullBillPdfBytes(customers, rate), "full-bill.pdf");
    setToast(t(lang, "pdfReady"));
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-5 pb-16">
      <section className="card-surface p-4">
        <label className="text-xs font-medium uppercase tracking-wide text-[var(--fg-muted)]" htmlFor="rate">
          {t(lang, "unitRate")}
        </label>
        <Input
          id="rate"
          inputMode="decimal"
          value={rate ? String(rate) : ""}
          placeholder="32.16"
          onChange={(e) => setRate(Number(e.target.value) || 0)}
          className="mt-2"
        />
      </section>

      <section className="card-surface p-4">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-medium uppercase tracking-wide text-[var(--fg-muted)]" htmlFor="cname">
            {t(lang, "customerName")}
          </label>
          <div className="seg" role="group" aria-label="Name language">
            <button
              type="button"
              className={cn("seg-btn", nameLang === "en" && "seg-btn-on")}
              onClick={() => setNameLang("en")}
            >
              {t(lang, "nameLangEn")}
            </button>
            <button
              type="button"
              className={cn("seg-btn", nameLang === "ur" && "seg-btn-on")}
              onClick={() => setNameLang("ur")}
            >
              {t(lang, "nameLangUr")}
            </button>
          </div>
        </div>
        {savedNames.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {savedNames.map((s) => (
              <button
                key={`${s.lang}:${s.name}`}
                type="button"
                className={cn("chip", s.lang === "ur" && "font-urdu")}
                dir={s.lang === "ur" ? "rtl" : "ltr"}
                onClick={() => pickSavedName(s.name, s.lang)}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
        <Input
          id="cname"
          value={name}
          placeholder={t(lang, "namePlaceholder")}
          onChange={(e) => setName(e.target.value)}
          dir={nameLang === "ur" ? "rtl" : "ltr"}
          className={cn("mt-3", nameLang === "ur" && "font-urdu text-lg")}
        />
      </section>

      <section className="card-surface p-4">
        <label className="text-xs font-medium uppercase tracking-wide text-[var(--fg-muted)]" htmlFor="term">
          {t(lang, "unitTerms")}
        </label>
        <form
          className="mt-2 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            addTerm();
          }}
        >
          <Input
            id="term"
            inputMode="decimal"
            value={termInput}
            placeholder={t(lang, "unitPlaceholder")}
            onChange={(e) => setTermInput(e.target.value)}
          />
          <Button type="submit" variant="secondary" className="shrink-0">
            {t(lang, "addTerm")}
          </Button>
        </form>
        {terms.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {terms.map((term, i) => (
              <button
                key={`${term}-${i}`}
                type="button"
                className="chip chip-term"
                onClick={() => removeTerm(i)}
                aria-label={`Remove ${term}`}
              >
                {formatIndianNumber(term, 0)}
                <X className="size-3.5 opacity-70" />
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="card-surface p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--fg-muted)]">
          {t(lang, "livePreview")}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Stat label={t(lang, "totalUnits")} value={formatIndianNumber(preview.units, 0)} />
          <Stat label={t(lang, "billAmount")} value={formatPkr(preview.amount, true)} />
        </div>
        <p className="mt-3 text-xs italic text-[var(--fg-subtle)]">{t(lang, "roundHint")}</p>
        {preview.amount > 0 && (
          <p className="mt-1 text-xs text-[var(--fg-muted)]">{amountInWords(preview.amount)}</p>
        )}
        <Button className="mt-4 w-full" size="lg" sound="none" onClick={onAddAll}>
          {t(lang, "addAll")}
        </Button>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-display text-lg font-semibold">{t(lang, "customers")}</h2>
          <p className="text-xs text-[var(--fg-muted)] tabular-nums">{customers.length}</p>
        </div>
        {customers.length === 0 ? (
          <p className="card-surface px-4 py-8 text-center text-sm text-[var(--fg-muted)]">
            {t(lang, "noCustomers")}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {customers.map((c) => (
              <li key={c.id} className="card-surface p-4">
                <p
                  className={cn("font-display text-lg font-semibold", c.lang === "ur" && "font-urdu text-xl")}
                  dir={c.lang === "ur" ? "rtl" : "ltr"}
                >
                  {c.name}
                </p>
                <p className="mt-1 text-sm text-[var(--fg-muted)]">
                  {formatTermsLine(c.terms, c.units)}
                </p>
                <p className="mt-2 font-medium tabular-nums text-[var(--ac)]">{formatPkr(c.amount, true)}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10"
                    onClick={() => tryPrint(customerBillHtml(c, rate))}
                  >
                    <Printer className="size-4" />
                    {t(lang, "print")}
                  </Button>
                  <Button variant="outline" size="sm" className="h-10" onClick={() => shareCustomer(c, rate)}>
                    <Share2 className="size-4" />
                    {t(lang, "whatsapp")}
                  </Button>
                  <Button variant="outline" size="sm" className="h-10" sound="none" onClick={() => onPdfCustomer(c.id)}>
                    <FileDown className="size-4" />
                    {t(lang, "pdf")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 text-[var(--danger)]"
                    sound="none"
                    onClick={() => askConfirm("deleteCustomer", c.id)}
                  >
                    <Trash2 className="size-4" />
                    {t(lang, "delete")}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card-surface p-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat label={t(lang, "totalUnits")} value={formatIndianNumber(grandUnits, 0)} />
          <Stat label={t(lang, "grandTotal")} value={formatPkr(grandAmount, true)} />
          <Stat label={t(lang, "count")} value={String(customers.length)} />
        </div>
        <p className="mt-2 text-center text-xs italic text-[var(--fg-subtle)]">{t(lang, "roundHint")}</p>
        <div className="mt-4 flex flex-col gap-2">
          <Button
            variant="secondary"
            className="w-full"
            disabled={customers.length === 0}
            onClick={() => tryPrint(fullBillHtml(customers, rate))}
          >
            <Printer className="size-4" />
            {t(lang, "printFull")}
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            disabled={customers.length === 0}
            onClick={() => shareFullBill(customers, rate)}
          >
            <Share2 className="size-4" />
            {t(lang, "shareFull")}
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            disabled={customers.length === 0}
            sound="none"
            onClick={onPdfFull}
          >
            <FileDown className="size-4" />
            {t(lang, "downloadPdf")}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            disabled={customers.length === 0}
            sound="none"
            onClick={undoLast}
          >
            <Undo2 className="size-4" />
            {t(lang, "undoLast")}
          </Button>
        </div>
        <Button
          variant="danger"
          className="mt-2 w-full"
          sound="none"
          onClick={() => askConfirm("newBill")}
        >
          {t(lang, "newBill")}
        </Button>
        {rate > 0 && (
          <p className="mt-3 text-center text-xs text-[var(--fg-subtle)]">{formatRate(rate)}</p>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-[var(--fg-subtle)]">{label}</p>
      <p className="mt-0.5 font-display text-base font-semibold tabular-nums text-[var(--fg)]">{value}</p>
    </div>
  );
}
