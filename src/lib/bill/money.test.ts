import assert from "node:assert/strict";
import { test } from "node:test";
import {
  amountInWords,
  computeBill,
  formatIndianNumber,
  formatPkr,
  roundToNearest10,
} from "./money.ts";

test("66 × 32.65 = 2154.90 → PKR 2,150.00", () => {
  const raw = 66 * 32.65;
  assert.equal(Math.round(raw * 100) / 100, 2154.9);
  assert.equal(roundToNearest10(raw), 2150);
  assert.equal(formatPkr(raw), "PKR 2,150.00");
  const bill = computeBill([66], 32.65);
  assert.equal(bill.units, 66);
  assert.equal(bill.amount, 2150);
});

test("half-up nearest 10: 2154 → 2150, 2155 → 2160, 2158 → 2160", () => {
  assert.equal(roundToNearest10(2154), 2150);
  assert.equal(roundToNearest10(2155), 2160);
  assert.equal(roundToNearest10(2158), 2160);
  assert.equal(roundToNearest10(2150), 2150);
});

test("Indian grouping", () => {
  assert.equal(formatIndianNumber(1234567, 2), "12,34,567.00");
  assert.equal(formatIndianNumber(2150, 2), "2,150.00");
  assert.equal(formatIndianNumber(39.65, 2), "39.65");
  assert.equal(formatIndianNumber(12, 0), "12");
});

test("amount in words uses lakh/crore", () => {
  assert.equal(
    amountInWords(1234560),
    "Rupees Twelve Lakh Thirty Four Thousand Five Hundred Sixty Only",
  );
  assert.equal(amountInWords(2150), "Rupees Two Thousand One Hundred Fifty Only");
  assert.equal(amountInWords(0), "Rupees Zero Only");
  assert.equal(amountInWords(100000), "Rupees One Lakh Only");
});
