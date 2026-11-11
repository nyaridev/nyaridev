// Draws the profile page in black and white ink: the name panel and one panel per project, dark and light, and
// the README that shows them. Nothing moves. Usage: node generate.mjs
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const out = import.meta.dirname;
const SANS = `'Segoe UI', Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif`;
const ROUND = `fill="none" stroke-width="22.4" stroke-linecap="round" stroke-linejoin="round"`;
const SHARP = `fill="none" stroke-width="22.4" stroke-linecap="square" stroke-linejoin="miter"`;

const THEMES = {
  dark: { bg: "#0b0b0c", ink: "#f3f3f1", grey: "#8d8d8d" },
  light: { bg: "#f7f7f5", ink: "#0b0b0c", grey: "#6c6c6c" },
};

// ── Ink effects ───────────────────────────
/** A seeded random number generator, so every run draws the same lines. */
const random = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const n = (v) => +v.toFixed(1);

/** Screentone: dots on a 45° grid that shrink with distance from a corner. */
const halftone = (cx, cy, extent, pitch, maxR, w, h) => {
  const step = pitch / Math.SQRT2;
  let d = "";
  for (let row = 0, y = 0; y <= h; row++, y = row * step)
    for (let x = row % 2 ? step : 0; x <= w; x += step * 2) {
      const r = maxR * (1 - Math.hypot(x - cx, y - cy) / extent) ** 0.85;
      if (!(r > 0.55)) continue;
      d += `M${n(x - r)} ${n(y)}a${n(r)} ${n(r)} 0 1 0 ${n(r * 2)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-r * 2)} 0`;
    }
  return d;
};

/** Focus lines: thin spikes that point at (fx, fy) and stop at an ellipse around it. */
const focusLines = (fx, fy, rx, ry, count, seed) => {
  const rand = random(seed);
  let d = "";
  for (let i = 0; i < count; i++) {
    const angle = ((i + rand() * 0.9) / count) * Math.PI * 2;
    const reach = 1 + rand() * rand() * 0.9;
    const width = 2 + rand() * 8;
    if (rand() < 0.18) continue;
    const tx = fx + rx * reach * Math.cos(angle);
    const ty = fy + ry * reach * Math.sin(angle);
    const len = Math.hypot(tx - fx, ty - fy);
    const [ux, uy] = [(tx - fx) / len, (ty - fy) / len];
    const [ox, oy] = [fx + ux * 1700, fy + uy * 1700];
    d += `M${n(tx)} ${n(ty)}L${n(ox - uy * width)} ${n(oy + ux * width)}L${n(ox + uy * width)} ${n(oy - ux * width)}Z`;
  }
  return d;
};

const splatter = (x, y, spread, count, seed) => {
  const rand = random(seed);
  return Array.from({ length: count }, () => {
    const r = 1.5 + rand() * rand() * 8;
    return `<circle cx="${n(x + rand() * spread)}" cy="${n(y + (rand() - 0.5) * spread * 0.6)}" r="${n(r)}"/>`;
  }).join("");
};

const frame = (w, h, title, desc, t, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="t d">
  <title id="t">${title}</title>
  <desc id="d">${desc}</desc>
  <defs>
    <filter id="ink" x="-5%" y="-20%" width="110%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="7" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="4.5" xChannelSelector="R" yChannelSelector="G"/></filter>
    <clipPath id="frame"><rect width="${w}" height="${h}"/></clipPath>
  </defs>
  <rect width="${w}" height="${h}" fill="${t.bg}"/>
${body.map((l) => `  ${l}`).join("\n")}
  <rect x="2.5" y="2.5" width="${w - 5}" height="${h - 5}" fill="none" stroke="${t.ink}" stroke-width="5"/>
</svg>
`;

// ── Name panel ────────────────────────────
const NYARIDEV =
  "M341 114.8V170.8M341 142.8A28 28 0 0 1 397 142.8V170.8M433 114.8V142.8A28 28 0 0 0 489 142.8M489 114.8V182.8A28 28 0 0 1 441.2 202.6M525 142.8A28 28 0 1 0 581 142.8A28 28 0 1 0 525 142.8ZM581 114.8V170.8M619 114.8V170.8M619 142.8A28 28 0 0 1 661 118.6M693 114.8V170.8M726 142.8A28 28 0 1 0 782 142.8A28 28 0 1 0 726 142.8ZM782 75.6V170.8M818 142.8H874A28 28 0 1 0 865.8 162.6M904 114.8L930 170.8L956 114.8";

/** The name in the middle, inked by hand, with every line pointing at it. */
const hero = (t) =>
  frame(1280, 400, "nyaridev", "The name nyaridev in rough ink, with manga focus lines and screentone.", t, [
    `<g clip-path="url(#frame)" fill="${t.ink}">`,
    `  <path d="${focusLines(640, 198, 440, 168, 230, 11)}"/>`,
    `  <path d="${halftone(0, 400, 260, 14, 4.8, 1280, 400)}${halftone(1280, 0, 260, 14, 4.8, 1280, 400)}"/>`,
    `</g>`,
    `<g filter="url(#ink)">`,
    `  <path d="M330 284L944 264L952 276L332 310Z" fill="${t.ink}"/><g fill="${t.ink}">${splatter(968, 274, 90, 9, 5)}</g>`,
    `  <g transform="translate(-8.5 37.2)"><path d="${NYARIDEV}" ${SHARP} stroke="${t.ink}"/><rect x="680" y="63.7" width="26" height="26" fill="${t.ink}"/></g>`,
    `</g>`,
  ]);

// ── Project panels ────────────────────────
// Each mark and wordmark is the one from that project's own banner, in the banner's coordinates, in one ink.
// `left`: the wordmark's left edge; `centre` and `size`: the mark's middle and the scale that fits it in a panel.
const projects = {
  "iro-ui": {
    title: "iro-ui",
    tagline: "React components with swappable styles.",
    left: 332.8,
    centre: [190, 160],
    size: 0.5,
    mark: (t) =>
      `<g transform="translate(110 80)"><g fill="${t.ink}"><rect rx="14" width="46" height="140" x="57" y="8" fill-opacity="0.4" transform="rotate(-24 80 148)"/><rect rx="14" width="46" height="140" x="57" y="8" fill-opacity="0.4" transform="rotate(24 80 148)"/><rect rx="14" width="46" height="140" x="57" y="8"/></g><circle cx="80" cy="128" r="8" fill="${t.bg}"/></g>`,
    word: (t) =>
      `<path d="M344 114.8V170.8M377 114.8V170.8M377 142.8A28 28 0 0 1 419 118.6M449 142.8A28 28 0 1 0 505 142.8A28 28 0 1 0 449 142.8ZM541 142.8H569M605 114.8V142.8A28 28 0 0 0 661 142.8M661 114.8V170.8M694 114.8V170.8" ${ROUND} stroke="${t.ink}"/><g fill="${t.ink}"><circle cx="344" cy="76.7" r="13.4"/><circle cx="694" cy="76.7" r="13.4"/></g>`,
  },
  shiori: {
    title: "Shiori",
    tagline: "A project dashboard you run with agents.",
    left: 329.8,
    centre: [190, 160],
    size: 0.48,
    mark: (t) =>
      `<g fill="${t.ink}"><rect x="110" y="113.3" width="33.3" height="93.3" rx="10" fill-opacity="0.4"/><rect x="166.7" y="80" width="46.7" height="160" rx="13.3"/><rect x="236.7" y="113.3" width="33.3" height="93.3" rx="10" fill-opacity="0.4"/></g>`,
    word: (t) =>
      `<path d="M378 120.5Q370 114.8 360 114.8A20 14 0 0 0 360 142.8A20 14 0 0 1 360 170.8Q349 170.8 341 165M416 75.6V170.8M416 142.8A28 28 0 0 1 472 142.8V170.8M518 114.8V170.8M551 142.8A28 28 0 1 0 607 142.8A28 28 0 1 0 551 142.8ZM652 114.8V170.8M652 142.8A28 28 0 0 1 694 118.6M738 114.8V170.8" ${ROUND} stroke="${t.ink}"/><g fill="${t.ink}"><circle cx="518" cy="76.7" r="13.4"/><circle cx="738" cy="76.7" r="13.4"/></g>`,
  },
  blomboui: {
    title: "BlomboUI",
    repo: "BlomboUI",
    tagline: "A friendly face for ComfyUI.",
    left: 329.8,
    centre: [184.6, 146],
    size: 0.5,
    mark: (t) =>
      `<g transform="translate(51.4 12.9) scale(0.52)" fill="${t.ink}"><path fill-rule="evenodd" d="M116 196V184A44 44 0 0 1 160 140H352A44 44 0 0 1 396 184V196ZM116 210H396V253A37 37 0 0 0 396 327V328A44 44 0 0 1 352 372H160A44 44 0 0 1 116 328V327A37 37 0 0 0 116 253ZM199 290A21 38 0 1 0 241 290A21 38 0 1 0 199 290ZM271 290A21 38 0 1 0 313 290A21 38 0 1 0 271 290ZM86 290A30 30 0 1 0 146 290A30 30 0 1 0 86 290ZM105 290A11 11 0 1 0 127 290A11 11 0 1 0 105 290Z"/><circle cx="396" cy="290" r="30"/></g>`,
    word: (t) =>
      `<path d="M341 75.6V170.8M341 142.8A28 28 0 1 0 397 142.8A28 28 0 1 0 341 142.8M437 75.6V170.8M475 142.8A28 28 0 1 0 531 142.8A28 28 0 1 0 475 142.8M569 114.8V170.8M569 139.8A25 25 0 0 1 619 139.8V170.8M619 139.8A25 25 0 0 1 669 139.8V170.8M715 75.6V170.8M715 142.8A28 28 0 1 0 771 142.8A28 28 0 1 0 715 142.8M807 142.8A28 28 0 1 0 863 142.8A28 28 0 1 0 807 142.8" ${ROUND} stroke="${t.ink}"/>`,
  },
  prepkit: {
    title: "PrepKit",
    tagline: "Get game assets ready in one drop.",
    left: 330,
    centre: [190, 160],
    size: 0.38,
    mark: (t) =>
      `<path fill="${t.ink}" fill-rule="evenodd" d="M142.1 260.1C124.2 260.1 110.1 248.8 111 231L112.9 126.6C113.9 89 143.9 60.8 183.4 59.9H198.5C240.8 59.9 270.8 90 269 132.3C268 174.6 237.9 205.6 196.6 206.5H183.4C176.8 206.5 172.1 211.2 172.1 217.8L173.1 231C174 248.8 159.9 260.1 142.1 260.1ZM168.4 133.2A11.3 21.6 0 1 0 190.9 133.2A11.3 21.6 0 1 0 168.4 133.2ZM209.7 133.2A11.3 21.6 0 1 0 232.3 133.2A11.3 21.6 0 1 0 209.7 133.2Z"/>`,
    word: (t) =>
      `<g fill="${t.ink}"><path d="M330 114.8L330 210A11.2 11.2 0 0 0 352.4 210L352.4 114.8A11.2 11.2 0 0 0 330 114.8Z"/><path fill-rule="evenodd" d="M330 142.8A39.2 39.2 0 1 0 408.4 142.8A39.2 39.2 0 1 0 330 142.8ZM352.4 142.8A16.8 16.8 0 1 0 386 142.8A16.8 16.8 0 1 0 352.4 142.8Z"/><path d="M423 114.8L423 170.8A11.2 11.2 0 0 0 445.4 170.8L445.4 114.8A11.2 11.2 0 0 0 423 114.8Z"/><path d="M423 142.8A39.2 39.2 0 0 1 481.8 108.9A11.2 11.2 0 0 1 470.6 128.2A16.8 16.8 0 0 0 445.4 142.8A11.2 11.2 0 0 1 423 142.8Z"/><path d="M548 181.4A39.2 39.2 0 1 1 580.3 142.8A11.2 11.2 0 0 1 557.9 142.8A16.8 16.8 0 1 0 544 159.3A11.2 11.2 0 0 1 548 181.4Z"/><path d="M513.1 154L569.1 154A11.2 11.2 0 0 0 569.1 131.6L513.1 131.6A11.2 11.2 0 0 0 513.1 154Z"/><path d="M594.9 114.8L594.9 210A11.2 11.2 0 0 0 617.3 210L617.3 114.8A11.2 11.2 0 0 0 594.9 114.8Z"/><path fill-rule="evenodd" d="M594.9 142.8A39.2 39.2 0 1 0 673.3 142.8A39.2 39.2 0 1 0 594.9 142.8ZM617.3 142.8A16.8 16.8 0 1 0 650.9 142.8A16.8 16.8 0 1 0 617.3 142.8Z"/><path d="M687.8 75.6L687.8 170.8A11.2 11.2 0 0 0 710.2 170.8L710.2 75.6A11.2 11.2 0 0 0 687.8 75.6Z"/><path d="M715.5 155.6L751.3 123.1A11.2 11.2 0 0 0 736.3 106.5L700.5 139A11.2 11.2 0 0 0 715.5 155.6Z"/><path d="M708.4 143.3L737.5 178A11.2 11.2 0 0 0 754.6 163.6L725.5 128.9A11.2 11.2 0 0 0 708.4 143.3Z"/><path d="M771.8 114.8L771.8 170.8A11.2 11.2 0 0 0 794.2 170.8L794.2 114.8A11.2 11.2 0 0 0 771.8 114.8Z"/><path d="M769.6 76.7A13.4 13.4 0 1 0 796.5 76.7A13.4 13.4 0 1 0 769.6 76.7Z"/><path d="M820 81.2L820 170.8A11.2 11.2 0 0 0 842.4 170.8L842.4 81.2A11.2 11.2 0 0 0 820 81.2Z"/><path d="M820 126L862.6 126A11.2 11.2 0 0 0 862.6 103.6L820 103.6A11.2 11.2 0 0 0 820 126Z"/></g>`,
  },
};

const card = (p, t) => {
  const at = (x, y, s, cx, cy) => `translate(${n(x - cx * s)} ${n(y - cy * s)}) scale(${s})`;
  return frame(620, 200, p.title, p.tagline, t, [
    `<path d="${halftone(620, 0, 165, 13, 4.2, 620, 200)}" fill="${t.ink}"/>`,
    `<g filter="url(#ink)">`,
    `  <g transform="${at(74, 76, p.size, ...p.centre)}">${p.mark(t)}</g>`,
    `  <g transform="${at(132, 76, 0.4, p.left, 142.8)}">${p.word(t)}</g>`,
    `  <text x="38" y="158" fill="${t.grey}" font-family="${SANS}" font-size="22">${p.tagline}</text>`,
    `  <path d="M550 150H578M568 140L578 150L568 160" fill="none" stroke="${t.ink}" stroke-width="4" stroke-linecap="square" stroke-linejoin="miter"/>`,
    `</g>`,
  ]);
};

// ── Output ────────────────────────────────
const pictures = [];
const write = (path, svg) => {
  writeFileSync(join(out, path), svg);
  pictures.push(path);
};
mkdirSync(join(out, "assets", "cards"), { recursive: true });
for (const [mode, t] of Object.entries(THEMES)) {
  write(`assets/hero-${mode}.svg`, hero(t));
  for (const [id, p] of Object.entries(projects)) write(`assets/cards/${id}-${mode}.svg`, card(p, t));
}

const picture = (base, alt, width) =>
  `<picture><source media="(prefers-color-scheme: dark)" srcset="${base}-dark.svg" /><img src="${base}-light.svg" width="${width}" alt="${alt}" /></picture>`;
// The name panel is a little narrower than the page, so its edges line up with the two panels below it.
writeFileSync(
  join(out, "README.md"),
  `<p align="center">
  ${picture("assets/hero", "nyaridev", "98.6%")}
</p>

<p align="center">
${Object.entries(projects)
  .map(([id, p]) => `  <a href="https://github.com/nyaridev/${p.repo ?? id}">${picture(`assets/cards/${id}`, `${p.title}: ${p.tagline}`, "49%")}</a>`)
  .join("\n")}
</p>
`,
);

// ── Self-check ────────────────────────────
const inks = new Set(Object.values(THEMES).flatMap((t) => Object.values(t)));
for (const path of pictures) {
  const svg = readFileSync(join(out, path), "utf8");
  assert(svg.startsWith("<svg") && svg.trimEnd().endsWith("</svg>"), `${path}: not an SVG`);
  assert(!/NaN|undefined|Infinity/.test(svg), `${path}: a number went missing`);
  assert(!/<style|<animate|<script|<set /.test(svg), `${path}: nothing may move`);
  for (const color of svg.match(/#[0-9a-f]{6}\b/gi) ?? []) assert(inks.has(color), `${path}: ${color} isn't black, white or grey`);
}
const readme = readFileSync(join(out, "README.md"), "utf8");
for (const [, src] of readme.matchAll(/(?:src|srcset)="([^"]+)"/g)) assert(pictures.includes(src), `README.md: ${src} isn't drawn`);
console.log(`Drew ${pictures.length} pictures and README.md.`);
