/** Half-up rounding to the nearest PKR 10. 2154 → 2150, 2158 → 2160. */
export function roundToNearest10(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount / 10) * 10;
}

/** Exact rupee amount to 2 decimals before nearest-10 rounding. */
export function money2(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100) / 100;
}

export function computeBill(terms: number[], rate: number): {
  units: number;
  raw: number;
  amount: number;
} {
  const units = terms.reduce((sum, t) => sum + (Number.isFinite(t) ? t : 0), 0);
  const raw = money2(units * rate);
  return { units, raw, amount: roundToNearest10(raw) };
}

/**
 * Indian / Pakistani grouping: last 3 digits, then groups of 2.
 * 1234567.00 → "12,34,567.00"
 */
export function formatIndianNumber(value: number, fractionDigits = 2): string {
  if (!Number.isFinite(value)) return fractionDigits > 0 ? "0." + "0".repeat(fractionDigits) : "0";
  const neg = value < 0;
  const abs = Math.abs(value);
  const fixed = abs.toFixed(fractionDigits);
  const [intPart, decPart] = fixed.split(".");
  let grouped: string;
  if (intPart.length <= 3) {
    grouped = intPart;
  } else {
    const last3 = intPart.slice(-3);
    const rest = intPart.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    grouped = `${rest},${last3}`;
  }
  const dec = fractionDigits > 0 ? `.${decPart}` : "";
  return `${neg ? "-" : ""}${grouped}${dec}`;
}

export function formatPkr(amount: number, alreadyRounded = false): string {
  const n = alreadyRounded ? money2(amount) : roundToNearest10(amount);
  return `PKR ${formatIndianNumber(n, 2)}`;
}

export function formatRate(rate: number): string {
  return `PKR ${formatIndianNumber(rate, 2)}`;
}

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function belowThousand(n: number): string {
  if (n <= 0) return "";
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const r = n % 100;
  if (h) parts.push(`${ONES[h]} Hundred`);
  if (r === 0) return parts.join(" ");
  if (r < 20) {
    parts.push(ONES[r]);
  } else {
    const o = r % 10;
    parts.push(TENS[Math.floor(r / 10)] + (o ? ` ${ONES[o]}` : ""));
  }
  return parts.join(" ");
}

/** Lakh/crore amount-in-words. Always uses the nearest-PKR-10 bill amount. */
export function amountInWords(amount: number): string {
  let n = Math.round(roundToNearest10(amount));
  if (n < 0) n = 0;
  if (n === 0) return "Rupees Zero Only";

  const crore = Math.floor(n / 10_000_000);
  const lakh = Math.floor((n % 10_000_000) / 100_000);
  const thousand = Math.floor((n % 100_000) / 1_000);
  const rest = n % 1_000;

  const parts: string[] = [];
  if (crore) parts.push(`${belowThousand(crore)} Crore`);
  if (lakh) parts.push(`${belowThousand(lakh)} Lakh`);
  if (thousand) parts.push(`${belowThousand(thousand)} Thousand`);
  if (rest) parts.push(belowThousand(rest));

  return `Rupees ${parts.join(" ")} Only`;
}

export function formatTermsLine(terms: number[], units: number): string {
  if (terms.length === 0) return `0 = ${formatIndianNumber(units, 0)} units`;
  return `${terms.map((t) => formatIndianNumber(t, 0)).join(" + ")} = ${formatIndianNumber(units, 0)} units`;
}

export function billNumber(date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `BILL-${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}-${p(date.getHours())}${p(date.getMinutes())}`;
}

export function formatDate(date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(date.getDate())}/${p(date.getMonth() + 1)}/${date.getFullYear()}`;
}
