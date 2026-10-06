let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(on: boolean) {
  enabled = on;
}

function audio(): AudioContext | null {
  if (!enabled || typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  frequency: number,
  duration: number,
  type: OscillatorType,
  gain: number,
  delay = 0,
  slideTo?: number,
) {
  const c = audio();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, t0);
  if (slideTo !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + duration);
  }
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export function playClick() {
  tone(1480, 0.035, "square", 0.03);
}

export function playSuccess() {
  tone(523.25, 0.09, "sine", 0.06, 0);
  tone(784.0, 0.14, "sine", 0.05, 0.09);
}

export function playThud() {
  tone(90, 0.16, "sine", 0.08, 0, 40);
}

export function playPdf() {
  tone(392, 0.08, "triangle", 0.05, 0);
  tone(523.25, 0.08, "triangle", 0.05, 0.07);
  tone(659.25, 0.08, "triangle", 0.05, 0.14);
  tone(784, 0.16, "triangle", 0.06, 0.21);
}

export type SoundKind = "click" | "success" | "thud" | "pdf" | "none";

export function play(kind: SoundKind) {
  if (kind === "click") playClick();
  else if (kind === "success") playSuccess();
  else if (kind === "thud") playThud();
  else if (kind === "pdf") playPdf();
}
