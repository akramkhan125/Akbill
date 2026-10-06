import {
  amountInWords,
  billNumber,
  formatDate,
  formatIndianNumber,
  formatPkr,
  formatRate,
  formatTermsLine,
} from "./money";
import { APP_AUTHOR, APP_NAME } from "./constants";
import type { Customer } from "./types";

const LOGO = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 64 64" aria-hidden="true">
  <rect x="2" y="2" width="60" height="60" rx="14" fill="#1a1408"/>
  <rect x="6" y="6" width="52" height="52" rx="11" fill="#f0c94e"/>
  <rect x="18" y="14" width="28" height="36" rx="3" fill="#fffdf6" stroke="#1a1408" stroke-width="1.6"/>
  <path d="M24 24h16M24 30h16M24 36h10" stroke="#1a1408" stroke-width="2" stroke-linecap="round"/>
</svg>`;

function sheetCss(): string {
  return `
    @page { size: A4; margin: 14mm; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #fff; color: #1a1408; }
    body { font-family: Georgia, "Palatino Linotype", Palatino, serif; }
    .sheet { max-width: 720px; margin: 0 auto; padding: 8px 4px 24px; }
    .head { display: flex; align-items: center; gap: 12px; border-bottom: 2px solid #b8860b; padding-bottom: 10px; }
    .head h1 { font-size: 18px; margin: 0; letter-spacing: 0.02em; }
    .head p { margin: 2px 0 0; font-size: 11px; color: #5a4a32; }
    .meta { margin-left: auto; text-align: right; font-size: 11px; color: #3d3220; }
    .kicker { margin: 16px 0 8px; font-size: 12px; letter-spacing: 0.16em; font-weight: 700; color: #b8860b; }
    .cust { font-size: 22px; margin: 0 0 8px; }
    .cust.ur { font-family: "Jameel Noori Nastaleeq","Noto Nastaliq Urdu","Urdu Typesetting",serif; direction: rtl; text-align: right; font-size: 26px; }
    .terms { font-size: 13px; color: #3d3220; margin: 0 0 14px; }
    .total { background: #fdf8ea; border: 2px solid #b8860b; border-radius: 8px; padding: 12px 16px; }
    .total .lbl { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #7a5b12; }
    .total .amt { font-size: 26px; font-weight: 700; margin-top: 2px; }
    .words { font-style: italic; margin: 14px 0 28px; font-size: 13px; color: #3d3220; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { text-align: left; background: #fdf8ea; border: 1px solid #b8860b; padding: 7px 8px; }
    td { border: 1px solid #e0d2a8; padding: 6px 8px; }
    tr.grand td { background: #fdf8ea; border: 1.5px solid #b8860b; font-weight: 700; }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    .signs { display: flex; justify-content: space-between; gap: 40px; margin-top: 36px; }
    .sign { flex: 1; }
    .sign .line { border-top: 1px solid #b8860b; margin-top: 36px; padding-top: 6px; font-size: 11px; color: #5a4a32; }
    .foot { margin-top: 28px; text-align: center; font-size: 11px; color: #5a4a32; border-top: 1px solid #e0d2a8; padding-top: 10px; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  `;
}

function frame(title: string, inner: string): string {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${title}</title>
  <style>${sheetCss()}</style>
</head>
<body>
  <div class="sheet">${inner}</div>
  <script>
    window.onload = function () {
      setTimeout(function () { window.focus(); window.print(); }, 180);
    };
  </script>
</body>
</html>`;
}

function header(rate: number): string {
  const no = billNumber();
  const date = formatDate();
  return `
    <div class="head">
      ${LOGO}
      <div>
        <h1>${APP_NAME}</h1>
        <p>Made by ${APP_AUTHOR}</p>
      </div>
      <div class="meta">
        <div>Bill No. ${no}</div>
        <div>Date: ${date}</div>
        <div>Rate: ${formatRate(rate)}</div>
      </div>
    </div>`;
}

function signs(): string {
  return `
    <div class="signs">
      <div class="sign"><div class="line">Received by</div></div>
      <div class="sign"><div class="line">Signature</div></div>
    </div>
    <div class="foot">Thank you for your business · ${APP_NAME} / Made by ${APP_AUTHOR}</div>`;
}

export function customerBillHtml(c: Customer, rate: number): string {
  const ur = c.lang === "ur";
  const inner = `
    ${header(rate)}
    <div class="kicker">CUSTOMER BILL</div>
    <h2 class="cust${ur ? " ur" : ""}">${escapeHtml(c.name)}</h2>
    <p class="terms">${escapeHtml(formatTermsLine(c.terms, c.units))} × ${escapeHtml(formatRate(rate))}</p>
    <div class="total">
      <div class="lbl">Total bill</div>
      <div class="amt">${escapeHtml(formatPkr(c.amount, true))}</div>
    </div>
    <p class="words">${escapeHtml(amountInWords(c.amount))}</p>
    ${signs()}`;
  return frame(`${APP_NAME} — ${c.name}`, inner);
}

export function fullBillHtml(customers: Customer[], rate: number): string {
  const units = customers.reduce((a, c) => a + c.units, 0);
  const amount = customers.reduce((a, c) => a + c.amount, 0);
  const rows = customers
    .map(
      (c, i) => `<tr>
        <td>${i + 1}</td>
        <td class="${c.lang === "ur" ? "ur" : ""}">${escapeHtml(c.name)}</td>
        <td class="num">${escapeHtml(formatIndianNumber(c.units, 0))}</td>
        <td class="num">${escapeHtml(formatPkr(c.amount, true))}</td>
      </tr>`,
    )
    .join("");
  const inner = `
    ${header(rate)}
    <div class="kicker">FULL BILL</div>
    <table>
      <thead>
        <tr><th>#</th><th>Customer</th><th class="num">Units</th><th class="num">Amount</th></tr>
      </thead>
      <tbody>
        ${rows}
        <tr class="grand">
          <td></td>
          <td>Grand Total</td>
          <td class="num">${escapeHtml(formatIndianNumber(units, 0))}</td>
          <td class="num">${escapeHtml(formatPkr(amount, true))}</td>
        </tr>
      </tbody>
    </table>
    <p class="words">${escapeHtml(amountInWords(amount))}</p>
    ${signs()}`;
  return frame(`${APP_NAME} — Full Bill`, inner);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "\u0026amp;")
    .replace(/</g, "\u0026lt;")
    .replace(/>/g, "\u0026gt;")
    .replace(/"/g, "\u0026quot;");
}


export function printInPopup(html: string): boolean {
  const w = window.open("", "_blank", "noopener,noreferrer,width=820,height=980");
  if (!w) return false;
  w.document.open();
  w.document.write(html);
  w.document.close();
  return true;
}
