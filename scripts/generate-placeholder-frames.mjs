/**
 * Generates NUMBERED PLACEHOLDER frames for the hero wine-glass sequence,
 * so we can validate the technical pipeline (scrub, ring buffer, resize,
 * desktop/mobile swap, seamless end transition) before the real renders exist.
 *
 * These are deliberately diagrammatic — NOT a wine simulation. They will be
 * replaced 1:1 by the photorealistic renders.
 *
 *   node scripts/generate-placeholder-frames.mjs
 *
 * Keep counts/resolutions in sync with components/hero/sequence-config.ts.
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const END = "#25070D";
const BASE = "#0a0508";
const WINE = "#4A0F1B";
const WINE2 = "#5a1122";
const GOLD = "#A88A56";
const IVORY = "#F3EFE6";
const STONE = "#D4C7B5";

const VARIANTS = [
  { dir: "desktop", count: 120, w: 1920, h: 1080, quality: 82, label: "DESKTOP · 16:9" },
  { dir: "mobile", count: 90, w: 828, h: 1472, quality: 78, label: "MOBILE · 9:16" },
];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

function phaseOf(p) {
  if (p < 0.17) return "INIZIO";
  if (p < 0.5) return "INCLINAZIONE";
  if (p < 0.75) return "VERSAMENTO";
  if (p < 0.92) return "INVASIONE";
  return "TRANSIZIONE";
}

function svgFrame(v, i) {
  const { w, h, count, label } = v;
  const p = count > 1 ? i / (count - 1) : 0;
  const cx = w / 2;
  const cy = h * 0.44;

  // Glass scale relative to the shorter side (works for both aspect ratios).
  const s = Math.min(w, h) / 1000;
  const tilt = -smooth(0.17, 0.78, p) * 32; // degrees
  const wineFill = smooth(0.6, 0.98, p); // full-screen wine invasion 0..1
  const labelFade = 1 - smooth(0.9, 1, p); // labels fade as it goes solid
  const glassFade = 1 - smooth(0.86, 0.99, p);

  const fillH = h * wineFill;

  // Diagrammatic glass (bowl + stem + foot), drawn upright then rotated.
  const glass = `
    <g transform="translate(${cx} ${cy}) rotate(${tilt}) scale(${s})" opacity="${glassFade.toFixed(3)}">
      <path d="M -150 -260 C -150 -60 -110 60 0 70 C 110 60 150 -60 150 -260 Z"
            fill="none" stroke="${STONE}" stroke-width="4" opacity="0.7"/>
      <path d="M -120 -150 C -120 -20 -80 30 0 38 C 80 30 120 -20 120 -150 Z"
            fill="${WINE}" opacity="${(0.55 + 0.45 * (1 - wineFill)).toFixed(2)}"/>
      <line x1="0" y1="70" x2="0" y2="300" stroke="${STONE}" stroke-width="6" opacity="0.6"/>
      <ellipse cx="0" cy="308" rx="120" ry="20" fill="none" stroke="${STONE}" stroke-width="4" opacity="0.6"/>
    </g>`;

  // Pour stream after the tilt gets steep.
  const pour =
    p > 0.5 && p < 0.95
      ? `<rect x="${cx - 6 * s}" y="${cy}" width="${12 * s}" height="${h}" fill="${WINE2}" opacity="${(0.5 * smooth(0.5, 0.62, p)).toFixed(2)}"/>`
      : "";

  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#16090e"/>
      <stop offset="0.55" stop-color="${BASE}"/>
      <stop offset="1" stop-color="#060306"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  ${glass}
  ${pour}
  <!-- Rising wine that invades the screen and converges to END color -->
  <rect x="0" y="${h - fillH}" width="${w}" height="${fillH}" fill="${END}"/>
  <rect x="0" y="${h - fillH - 3}" width="${w}" height="3" fill="${WINE2}" opacity="${(0.6 * (1 - wineFill)).toFixed(2)}"/>

  <!-- Technical HUD (placeholder only) -->
  <g opacity="${labelFade.toFixed(3)}" font-family="monospace">
    <text x="${w / 2}" y="${h * 0.12}" fill="${GOLD}" font-size="${28 * s}" letter-spacing="${6 * s}" text-anchor="middle">${label}</text>
    <text x="${w / 2}" y="${h * 0.19}" fill="${IVORY}" font-size="${120 * s}" font-weight="bold" text-anchor="middle">${String(i + 1).padStart(4, "0")}</text>
    <text x="${w / 2}" y="${h * 0.24}" fill="${STONE}" font-size="${26 * s}" text-anchor="middle">frame ${i + 1} / ${count}</text>
    <text x="${w / 2}" y="${h * 0.9}" fill="${GOLD}" font-size="${34 * s}" letter-spacing="${8 * s}" text-anchor="middle">${phaseOf(p)}</text>
    <text x="${w / 2}" y="${h * 0.94}" fill="${IVORY}" font-size="${26 * s}" text-anchor="middle">scroll ${(p * 100).toFixed(0)}%</text>
    <rect x="${w * 0.2}" y="${h * 0.96}" width="${w * 0.6}" height="${6 * s}" fill="#ffffff" opacity="0.15" rx="${3 * s}"/>
    <rect x="${w * 0.2}" y="${h * 0.96}" width="${w * 0.6 * p}" height="${6 * s}" fill="${GOLD}" rx="${3 * s}"/>
  </g>
  <!-- Faint corner index kept even on solid frames (placeholder id) -->
  <text x="${w - 24 * s}" y="${h - 20 * s}" fill="${IVORY}" opacity="0.25" font-family="monospace" font-size="${22 * s}" text-anchor="end">${String(i + 1).padStart(4, "0")}</text>
</svg>`);
}

async function run() {
  let total = 0;
  const sizes = [];
  for (const v of VARIANTS) {
    const outDir = join(ROOT, "public", "sequences", "wine-glass", v.dir);
    await mkdir(outDir, { recursive: true });

    const tasks = [];
    const CONCURRENCY = 8;
    let idx = 0;
    let bytes = 0;
    const worker = async () => {
      while (idx < v.count) {
        const i = idx++;
        const svg = svgFrame(v, i);
        const name = `frame_${String(i + 1).padStart(4, "0")}.webp`;
        const buf = await sharp(svg).webp({ quality: v.quality }).toBuffer();
        bytes += buf.length;
        await writeFile(join(outDir, name), buf);
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    total += v.count;
    sizes.push({ dir: v.dir, count: v.count, mb: (bytes / 1048576).toFixed(2) });
    console.log(`  ✓ ${v.dir}: ${v.count} frames → ${(bytes / 1048576).toFixed(2)} MB`);
    void tasks;
  }
  console.log(`Done. ${total} placeholder frames generated.`);
  console.table(sizes);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
