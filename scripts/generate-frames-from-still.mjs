/**
 * Builds the hero frame sequence from a PHOTOREAL still (generated with the
 * Higgsfield connector) — an honest interim while the true liquid-pour render
 * is produced. Choreography per frame:
 *
 *   • slow cinematic camera push-in (scale up, no rotation)
 *   • the wine floods up the viewport in the final third
 *   • the last frames converge to a solid #25070D (seamless into next section)
 *
 * It does NOT fake liquid physics or a tilt — just the real glass, a camera
 * move, and a wine wash. Replace with real pour frames 1:1 when available.
 *
 *   node scripts/generate-frames-from-still.mjs
 */
import sharp from "sharp";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const END = "#25070D";

const VARIANTS = [
  { dir: "desktop", src: "hero-desktop.png", count: 120, w: 1920, h: 1080, quality: 72 },
  { dir: "mobile", src: "hero-mobile.png", count: 90, w: 828, h: 1472, quality: 70 },
];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Wine wash overlay: a rising #25070D fill + a slow global tint near the end. */
function overlaySvg(w, h, p) {
  const fill = smooth(0.52, 0.97, p); // 0..1 of viewport height
  const fillH = Math.round(h * fill);
  const tint = smooth(0.6, 1, p) * 0.5; // subtle overall wine tint late
  const meniscus = fill > 0 && fill < 1 ? 0.5 * (1 - fill) : 0;
  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="wash" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="${END}" stop-opacity="1"/>
      <stop offset="0.82" stop-color="${END}" stop-opacity="1"/>
      <stop offset="1" stop-color="${END}" stop-opacity="0.0"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${w}" height="${h}" fill="${END}" opacity="${tint.toFixed(3)}"/>
  <rect x="0" y="${h - fillH}" width="${w}" height="${fillH + 2}" fill="url(#wash)"/>
  <rect x="0" y="${h - fillH - 2}" width="${w}" height="2" fill="#5a1122" opacity="${meniscus.toFixed(3)}"/>
</svg>`);
}

async function run() {
  const report = [];
  for (const v of VARIANTS) {
    const outDir = join(ROOT, "public", "sequences", "wine-glass", v.dir);
    await mkdir(outDir, { recursive: true });
    const srcBuf = await readFile(join(ROOT, ".higgsfield", "source", v.src));

    let bytes = 0;
    let idx = 0;
    const CONCURRENCY = 6;
    const worker = async () => {
      while (idx < v.count) {
        const i = idx++;
        const p = v.count > 1 ? i / (v.count - 1) : 0;

        // Camera push-in: scale the still up and center-crop to frame size.
        const scale = 1.06 + smooth(0, 1, p) * 0.14; // 1.06 → 1.20
        const sw = Math.round(v.w * scale);
        const sh = Math.round(v.h * scale);
        const left = Math.round((sw - v.w) / 2);
        const top = Math.round((sh - v.h) / 2);

        const base = await sharp(srcBuf)
          .resize(sw, sh, { fit: "cover", position: "attention" })
          .extract({ left, top, width: v.w, height: v.h })
          .toBuffer();

        const buf = await sharp(base)
          .composite([{ input: overlaySvg(v.w, v.h, p) }])
          .webp({ quality: v.quality })
          .toBuffer();

        bytes += buf.length;
        const name = `frame_${String(i + 1).padStart(4, "0")}.webp`;
        await writeFile(join(outDir, name), buf);
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    report.push({ dir: v.dir, count: v.count, mb: (bytes / 1048576).toFixed(2) });
    console.log(`  ✓ ${v.dir}: ${v.count} frames → ${(bytes / 1048576).toFixed(2)} MB`);
  }

  // Poster = first frame (photoreal, no wash) for LCP / no-JS.
  for (const v of VARIANTS) {
    const srcBuf = await readFile(join(ROOT, ".higgsfield", "source", v.src));
    const outDir = join(ROOT, "public", "sequences", "wine-glass", v.dir);
    const poster = await sharp(srcBuf).resize(v.w, v.h, { fit: "cover" }).webp({ quality: 82 }).toBuffer();
    await writeFile(join(outDir, "poster.webp"), poster);
  }

  console.log("Done — photoreal frames built from Higgsfield stills.");
  console.table(report);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
