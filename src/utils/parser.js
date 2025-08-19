// public/utils/parser.js
// Normalizes pasted text into a record the UI can preview.
// PDF handling will be added later (self-hosted pdf.js).
export function parseText(input) {
  const text = String(input || '');
  const lower = text.toLowerCase();

  const carrier = detectCarrier(lower);
  const section = (rx) => sliceOriginal(text, lower, rx, 240);
  const links = Array.from(text.matchAll(/https?:\/\/\S+/g)).map((m) => m[0]);

  return {
    carrier,
    fees: section(/(fee|charge|surcharge)/g),
    dates: section(/(effective|date|updated)/g),
    prohibited: section(/(prohibit|not allowed|forbidden|restriction)/g),
    links,
    rawLength: text.length,
  };
}

function detectCarrier(lower) {
  const m = /(verizon|at&t|att|cricket|t-mobile|tmobile)/.exec(lower);
  if (!m) return 'unknown';
  const raw = m[1];
  if (raw === 'att') return 'at&t';
  if (raw === 'tmobile') return 't-mobile';
  return raw;
}

function sliceOriginal(orig, lower, rx, span) {
  const m = rx.exec(lower);
  if (!m) return null;
  const idx = m.index;
  return orig.slice(idx, Math.min(idx + span, orig.length));
}
