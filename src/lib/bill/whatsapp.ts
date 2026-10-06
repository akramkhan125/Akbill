import { amountInWords, formatPkr, formatRate, formatTermsLine } from "./money";
import type { Customer } from "./types";

function openWa(text: string) {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function shareCustomer(c: Customer, rate: number) {
  const text = [
    "*Bill Calculator*",
    `*${c.name}*`,
    `${formatTermsLine(c.terms, c.units)} × ${formatRate(rate)}`,
    `*${formatPkr(c.amount, true)}*`,
    `_${amountInWords(c.amount)}_`,
  ].join("\n");
  openWa(text);
}

export function shareFullBill(customers: Customer[], rate: number) {
  const units = customers.reduce((a, c) => a + c.units, 0);
  const amount = customers.reduce((a, c) => a + c.amount, 0);
  const lines = customers.map(
    (c, i) => `${i + 1}. ${c.name} — ${c.units} units — ${formatPkr(c.amount, true)}`,
  );
  const text = [
    "*Bill Calculator*",
    `Rate: ${formatRate(rate)}`,
    "",
    ...lines,
    "",
    `*Grand Total: ${formatPkr(amount, true)}*  (${units} units)`,
    `_${amountInWords(amount)}_`,
  ].join("\n");
  openWa(text);
}
