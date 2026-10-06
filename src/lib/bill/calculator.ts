export type Op = "+" | "-" | "*" | "/" | null;

export type CalcState = {
  display: string;
  acc: number | null;
  op: Op;
  fresh: boolean;
};

export const initialCalc: CalcState = {
  display: "0",
  acc: null,
  op: null,
  fresh: true,
};

function parse(d: string): number {
  const n = Number(d);
  return Number.isFinite(n) ? n : 0;
}

function fmt(n: number): string {
  if (!Number.isFinite(n)) return "Error";
  const s = n.toPrecision(12);
  const n2 = Number(s);
  let out = String(n2);
  if (out.includes("e")) out = n2.toFixed(10).replace(/\.?0+$/, "");
  if (out.length > 14) out = n2.toExponential(6);
  return out;
}

function apply(a: number, op: Op, b: number): number {
  if (op === "+") return a + b;
  if (op === "-") return a - b;
  if (op === "*") return a * b;
  if (op === "/") return b === 0 ? NaN : a / b;
  return b;
}

export function inputDigit(s: CalcState, d: string): CalcState {
  if (s.display === "Error") return { ...initialCalc, display: d, fresh: false };
  if (s.fresh) return { ...s, display: d, fresh: false };
  if (s.display.replace("-", "").replace(".", "").length >= 12) return s;
  if (s.display === "0") return { ...s, display: d };
  return { ...s, display: s.display + d };
}

export function inputDot(s: CalcState): CalcState {
  if (s.display === "Error") return { ...initialCalc, display: "0.", fresh: false };
  if (s.fresh) return { ...s, display: "0.", fresh: false };
  if (s.display.includes(".")) return s;
  return { ...s, display: s.display + "." };
}

export function inputOp(s: CalcState, op: Exclude<Op, null>): CalcState {
  if (s.display === "Error") return initialCalc;
  const n = parse(s.display);
  if (s.acc !== null && s.op && !s.fresh) {
    const r = apply(s.acc, s.op, n);
    return { display: fmt(r), acc: r, op, fresh: true };
  }
  return { ...s, acc: n, op, fresh: true };
}

export function inputEq(s: CalcState): CalcState {
  if (s.display === "Error") return initialCalc;
  if (s.acc === null || !s.op) return s;
  const r = apply(s.acc, s.op, parse(s.display));
  return { display: fmt(r), acc: r, op: null, fresh: true };
}

export function inputPct(s: CalcState): CalcState {
  const n = parse(s.display);
  if (s.acc !== null && s.op) {
    const pct = s.acc * (n / 100);
    return { ...s, display: fmt(pct), fresh: true };
  }
  return { ...s, display: fmt(n / 100), fresh: true };
}

export function inputBack(s: CalcState): CalcState {
  if (s.fresh || s.display === "Error") return { ...s, display: "0", fresh: true };
  const next = s.display.slice(0, -1);
  if (!next || next === "-" || next === "-0") return { ...s, display: "0", fresh: true };
  return { ...s, display: next };
}

export function inputClear(): CalcState {
  return { ...initialCalc };
}

export function handleKey(s: CalcState, key: string): CalcState | null {
  if (key >= "0" && key <= "9") return inputDigit(s, key);
  if (key === ".") return inputDot(s);
  if (key === "+") return inputOp(s, "+");
  if (key === "-") return inputOp(s, "-");
  if (key === "*") return inputOp(s, "*");
  if (key === "/") return inputOp(s, "/");
  if (key === "Enter" || key === "=") return inputEq(s);
  if (key === "Backspace") return inputBack(s);
  if (key === "Escape" || key === "Delete" || key === "c" || key === "C") return inputClear();
  if (key === "%") return inputPct(s);
  return null;
}
