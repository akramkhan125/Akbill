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

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 48;

function esc(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, "?");
}

function toWinAnsi(s: string): string {
  const clean = [...s]
    .map((ch) => (ch.charCodeAt(0) >= 32 && ch.charCodeAt(0) <= 126 ? ch : " "))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  return clean || "Customer";
}

type Cmd = string;

function Tf(font: "F1" | "F2", size: number): Cmd {
  return `/${font} ${size} Tf`;
}
function rg(r: number, g: number, b: number): Cmd {
  return `${r} ${g} ${b} rg`;
}
function RG(r: number, g: number, b: number): Cmd {
  return `${r} ${g} ${b} RG`;
}
function Td(x: number, y: number): Cmd {
  return `${x.toFixed(2)} ${y.toFixed(2)} Td`;
}
function Tj(text: string): Cmd {
  return `(${esc(text)}) Tj`;
}
function Tm(x: number, y: number): Cmd {
  return `1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm`;
}

function rect(x: number, y: number, w: number, h: number, fill: boolean, stroke: boolean): Cmd {
  const op = fill && stroke ? "B" : fill ? "f" : "S";
  return `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re ${op}`;
}

function wrap(text: string, fontSize: number, maxWidth: number): string[] {
  const widthOf = (s: string) => s.length * fontSize * 0.5;
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (widthOf(next) > maxWidth && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

function encodePdf(objects: string[]): Uint8Array {
  const encoder = new TextEncoder();
  const header = "%PDF-1.4\n%\x80\x80\x80\x80\n";
  const parts: Uint8Array[] = [encoder.encode(header)];
  let offset = parts[0].byteLength;
  const offsets = [0];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(offset);
    const body = encoder.encode(`${i + 1} 0 obj\n${objects[i]}\nendobj\n`);
    parts.push(body);
    offset += body.byteLength;
  }
  const xrefStart = offset;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  parts.push(encoder.encode(xref + trailer));
  const total = parts.reduce((n, p) => n + p.byteLength, 0);
  const out = new Uint8Array(total);
  let p = 0;
  for (const part of parts) {
    out.set(part, p);
    p += part.byteLength;
  }
  return out;
}

function goldStroke(): Cmd {
  return RG(0.72, 0.525, 0.043);
}
function goldFill(): Cmd {
  return rg(0.72, 0.525, 0.043);
}
function cream(): Cmd {
  return rg(0.992, 0.973, 0.918);
}
function ink(): Cmd {
  return rg(0.12, 0.1, 0.07);
}

function headerOps(yTop: number, meta: { billNo: string; date: string; rate: number }): { ops: Cmd[]; y: number } {
  const ops: Cmd[] = [];
  ops.push(goldStroke(), "2 w", rect(MARGIN, yTop - 52, PAGE_W - MARGIN * 2, 52, false, true));
  ops.push("BT", Tf("F2", 16), ink(), Tm(MARGIN + 12, yTop - 22), Tj(APP_NAME), "ET");
  ops.push("BT", Tf("F1", 9), Tm(MARGIN + 12, yTop - 38), Tj(`Made by ${APP_AUTHOR}`), "ET");
  ops.push(
    "BT",
    Tf("F1", 8),
    Tm(PAGE_W - MARGIN - 200, yTop - 20),
    Tj(`Bill No. ${meta.billNo}`),
    "ET",
  );
  ops.push(
    "BT",
    Tf("F1", 8),
    Tm(PAGE_W - MARGIN - 200, yTop - 34),
    Tj(`Date: ${meta.date}   Rate: ${formatRate(meta.rate)}`),
    "ET",
  );
  return { ops, y: yTop - 68 };
}

function footerOps(): Cmd[] {
  const ops: Cmd[] = [];
  const y = 72;
  ops.push(goldStroke(), "0.8 w");
  ops.push(`${MARGIN} ${y + 28} m ${MARGIN + 200} ${y + 28} l S`);
  ops.push(`${PAGE_W - MARGIN - 200} ${y + 28} m ${PAGE_W - MARGIN} ${y + 28} l S`);
  ops.push("BT", Tf("F1", 8), ink(), Tm(MARGIN, y + 14), Tj("Received by"), "ET");
  ops.push("BT", Tf("F1", 8), Tm(PAGE_W - MARGIN - 200, y + 14), Tj("Signature"), "ET");
  ops.push(
    "BT",
    Tf("F1", 8),
    Tm(MARGIN, 48),
    Tj(`Thank you for your business  ·  ${APP_NAME} / Made by ${APP_AUTHOR}`),
    "ET",
  );
  return ops;
}

function buildPages(streams: string[]): Uint8Array {
  const pageCount = streams.length;
  const pageObjs: number[] = [];
  const contentObjs: number[] = [];
  let next = 3;
  for (let i = 0; i < pageCount; i++) {
    pageObjs.push(next++);
    contentObjs.push(next++);
  }
  const font1 = next++;
  const font2 = next++;

  const kids = pageObjs.map((n) => `${n} 0 R`).join(" ");
  const ordered: string[] = [];
  ordered[0] = `<< /Type /Catalog /Pages 2 0 R >>`;
  ordered[1] = `<< /Type /Pages /Kids [${kids}] /Count ${pageCount} >>`;

  for (let i = 0; i < pageCount; i++) {
    const p = pageObjs[i];
    const c = contentObjs[i];
    ordered[p - 1] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents ${c} 0 R /Resources << /Font << /F1 ${font1} 0 R /F2 ${font2} 0 R >> >> >>`;
    const stream = streams[i];
    ordered[c - 1] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  }
  ordered[font1 - 1] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`;
  ordered[font2 - 1] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`;
  return encodePdf(ordered);
}

function streamFrom(ops: Cmd[]): string {
  return ops.join("\n");
}

export function customerPdfBytes(c: Customer, rate: number): Uint8Array {
  const meta = { billNo: billNumber(), date: formatDate(), rate };
  const ops: Cmd[] = [];
  const { ops: hop, y: y0 } = headerOps(PAGE_H - 40, meta);
  ops.push(...hop);
  ops.push("BT", Tf("F2", 13), goldFill(), Tm(MARGIN, y0), Tj("CUSTOMER BILL"), "ET");
  let y = y0 - 28;
  const name = toWinAnsi(c.name);
  ops.push("BT", Tf("F2", 18), ink(), Tm(MARGIN, y), Tj(name), "ET");
  y -= 26;
  const terms = `${formatTermsLine(c.terms, c.units)}  ×  ${formatRate(rate)}`;
  for (const line of wrap(terms, 10, PAGE_W - MARGIN * 2)) {
    ops.push("BT", Tf("F1", 10), Tm(MARGIN, y), Tj(line), "ET");
    y -= 14;
  }
  y -= 10;
  const boxH = 56;
  ops.push(goldStroke(), "1.5 w", cream(), rect(MARGIN, y - boxH, PAGE_W - MARGIN * 2, boxH, true, true));
  ops.push("BT", Tf("F1", 9), ink(), Tm(MARGIN + 14, y - 18), Tj("Total bill"), "ET");
  ops.push("BT", Tf("F2", 20), Tm(MARGIN + 14, y - 42), Tj(formatPkr(c.amount, true)), "ET");
  y -= boxH + 22;
  ops.push("BT", Tf("F1", 10), Tm(MARGIN, y), Tj(amountInWords(c.amount)), "ET");
  ops.push(...footerOps());
  return buildPages([streamFrom(ops)]);
}

export function fullBillPdfBytes(customers: Customer[], rate: number): Uint8Array {
  const meta = { billNo: billNumber(), date: formatDate(), rate };
  const totalUnits = customers.reduce((a, c) => a + c.units, 0);
  const totalAmount = customers.reduce((a, c) => a + c.amount, 0);
  const col = { n: MARGIN + 4, name: MARGIN + 36, units: 360, amt: 450 };
  const rowH = 18;
  const bottom = 110;
  const streams: string[] = [];

  let index = 0;
  while (index < customers.length || streams.length === 0) {
    const ops: Cmd[] = [];
    const { ops: hop, y: y0 } = headerOps(PAGE_H - 40, meta);
    ops.push(...hop);
    ops.push("BT", Tf("F2", 13), goldFill(), Tm(MARGIN, y0), Tj("FULL BILL"), "ET");
    let y = y0 - 24;
    ops.push(cream(), goldStroke(), "1 w", rect(MARGIN, y - 16, PAGE_W - MARGIN * 2, 20, true, true));
    ops.push("BT", Tf("F2", 9), ink(), Tm(col.n, y - 10), Tj("#"), "ET");
    ops.push("BT", Tf("F2", 9), Tm(col.name, y - 10), Tj("Customer"), "ET");
    ops.push("BT", Tf("F2", 9), Tm(col.units, y - 10), Tj("Units"), "ET");
    ops.push("BT", Tf("F2", 9), Tm(col.amt, y - 10), Tj("Amount"), "ET");
    y -= 22;
    while (index < customers.length && y > bottom + 48) {
      const c = customers[index];
      const stripe = index % 2 === 0;
      if (stripe) {
        ops.push(rg(0.98, 0.96, 0.92), rect(MARGIN, y - 4, PAGE_W - MARGIN * 2, rowH, true, false));
      }
      ops.push("BT", Tf("F1", 9), ink(), Tm(col.n, y), Tj(String(index + 1)), "ET");
      ops.push("BT", Tf("F1", 9), Tm(col.name, y), Tj(toWinAnsi(c.name).slice(0, 36)), "ET");
      ops.push("BT", Tf("F1", 9), Tm(col.units, y), Tj(formatIndianNumber(c.units, 0)), "ET");
      ops.push("BT", Tf("F1", 9), Tm(col.amt, y), Tj(formatPkr(c.amount, true)), "ET");
      y -= rowH;
      index += 1;
    }
    const lastPage = index >= customers.length;
    if (lastPage) {
      ops.push(goldStroke(), "1.4 w", cream(), rect(MARGIN, y - 8, PAGE_W - MARGIN * 2, 24, true, true));
      ops.push("BT", Tf("F2", 10), ink(), Tm(col.name, y), Tj("Grand Total"), "ET");
      ops.push("BT", Tf("F2", 10), Tm(col.units, y), Tj(formatIndianNumber(totalUnits, 0)), "ET");
      ops.push("BT", Tf("F2", 10), Tm(col.amt, y), Tj(formatPkr(totalAmount, true)), "ET");
      y -= 28;
      for (const line of wrap(amountInWords(totalAmount), 10, PAGE_W - MARGIN * 2)) {
        ops.push("BT", Tf("F1", 10), Tm(MARGIN, y), Tj(line), "ET");
        y -= 13;
      }
    }
    ops.push(...footerOps());
    streams.push(streamFrom(ops));
    if (lastPage) break;
  }
  return buildPages(streams);
}

export function downloadPdf(bytes: Uint8Array, filename: string) {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  const blob = new Blob([copy], { type: "application/pdf" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 800);
}
