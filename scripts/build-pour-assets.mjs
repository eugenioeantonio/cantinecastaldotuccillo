/**
 * Builds the layers of the real-time "pour" hero from the ORIGINAL photoreal
 * stills (.higgsfield/source/hero-{desktop,mobile}.png). Nothing is invented:
 * every pixel of the glass comes from the photograph.
 *
 *   stage.webp  — the still with the glass painted out (the dark set + floor),
 *                 at full resolution: outside the glass it IS the photograph
 *   glass.webp  — the glass alone, *dry* (the photographed wine removed),
 *                 stored as light added over the stage, so it can tilt freely
 *   wet.webp    — the same crop with the photographed wine
 *   shade.webp  — what the glass takes away from the set (R: wet, G: dry):
 *                 the dark wine and the foot's contact, which pure added
 *                 light cannot carry
 *   geometry    — bowl profile and landmarks, written to
 *                 components/hero/pour/geometry.generated.ts
 *
 * stage + wet − shade reproduces the photograph exactly at rest, and the
 * layers are zero outside a matte cut from the glass's own silhouette, so
 * nothing frames the glass. The shader moves the photographed wine inside
 * the tilting bowl rather than inventing a new one. The original frame
 * sequence is left untouched.
 *
 *   node scripts/build-pour-assets.mjs
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
// The two stills hold the same number of pixels (landscape / portrait): the
// operation cache would hand the mobile build the desktop's matte.
sharp.cache(false);

/**
 * Landmarks measured on the stills (x as a fraction of width, y of height).
 * rim: top of the rim ellipse · surface: centre of the wine surface ellipse
 * bottom: bowl bottom / stem top · foot: lowest point of the foot.
 */
const VARIANTS = [
  {
    dir: "desktop",
    src: "hero-desktop.png",
    cx: 0.4995,
    rim: 0.133,
    surface: 0.413,
    surfaceHalf: 0.028,
    bottom: 0.575,
    foot: 0.905,
    crop: { x0: 0.33, x1: 0.67, y0: 0.1, y1: 0.95 },
    band: 0.2,
    // The still was widened at generation: two straight vertical joins
    // where the outer panels sit ~2 levels brighter than the centre, which
    // reads as a dark box around the glass. Measured, then healed below.
    seams: [
      { x: 463, outer: "left" },
      { x: 2260, outer: "right" },
    ],
  },
  {
    dir: "mobile",
    src: "hero-mobile.png",
    cx: 0.4985,
    rim: 0.229,
    surface: 0.442,
    surfaceHalf: 0.018,
    bottom: 0.548,
    foot: 0.823,
    crop: { x0: 0.16, x1: 0.84, y0: 0.2, y1: 0.88 },
    band: 0.34,
  },
];

/** The shade layer stores darkening ×3 for precision (the shader divides). */
const SHADE_GAIN = 3;

const PROFILE_SAMPLES = 64;
const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

/**
 * Levels an outer panel to the centre across a straight vertical join: per
 * row and channel, the step between the two sides (smoothed over nearby
 * rows) is taken off the whole outer panel, so the set reads as one room.
 */
function healSeam(data, W, H, { x: sx, outer }) {
  const STRIP = 40;
  const sign = outer === "left" ? -1 : 1;
  const raw = [];
  for (let y = 0; y < H; y++) {
    const off = [0, 0, 0];
    for (let k = 3; k < STRIP; k++) {
      const o = (y * W + sx + sign * k) * 3;
      const n = (y * W + sx - sign * k) * 3;
      for (let c = 0; c < 3; c++) off[c] += data[o + c] - data[n + c];
    }
    raw.push(off.map((v) => v / (STRIP - 3)));
  }
  const R = 40;
  for (let y = 0; y < H; y++) {
    const off = [0, 0, 0];
    let n = 0;
    for (let k = Math.max(0, y - R); k <= Math.min(H - 1, y + R); k++, n++)
      for (let c = 0; c < 3; c++) off[c] += raw[k][c];
    const x0 = outer === "left" ? 0 : sx;
    const x1 = outer === "left" ? sx : W;
    for (let x = x0; x < x1; x++) {
      const i = (y * W + x) * 3;
      for (let c = 0; c < 3; c++) data[i + c] = Math.round(clamp(data[i + c] - off[c] / n, 0, 255));
    }
  }
}

async function build(v) {
  const srcPath = join(ROOT, ".higgsfield", "source", v.src);
  const { data, info } = await sharp(srcPath)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const at = (x, y) => (y * W + x) * 3;
  for (const s of v.seams ?? []) healSeam(data, W, H, s);

  // ---- 1. Outer silhouette per row (bright rim light against the dark set)
  const cxPx = Math.round(v.cx * W);
  const bandPx = Math.round(v.band * W);
  const edges = new Array(H).fill(null);
  for (let y = 0; y < H; y++) {
    let L = -1;
    let R = -1;
    for (let x = cxPx - bandPx; x <= cxPx + bandPx; x++) {
      const i = at(x, y);
      // rim light is warm-white (strong green); the wine glow is pure red
      if (lum(data[i], data[i + 1], data[i + 2]) > 34 && data[i + 1] > 40) {
        if (L < 0) L = x;
        R = x;
      }
    }
    if (L >= 0) edges[y] = [L, R];
  }

  // Half-width of the bowl (outer) from rim to bottom; the dark lower bowl
  // has no rim light, so it is closed with an elliptic taper to the stem.
  const rimPx = Math.round(v.rim * H);
  const bottomPx = Math.round(v.bottom * H);
  const hw = new Array(H).fill(0);
  let lastGood = rimPx;
  for (let y = rimPx; y <= bottomPx; y++) {
    const e = edges[y];
    const w = e ? (e[1] - e[0]) / 2 : 0;
    if (e && w > W * 0.02) {
      hw[y] = w;
      lastGood = y;
    }
  }
  // The lower bowl is unlit (only the wine glows there), so its curve into
  // the stem is closed geometrically: an elliptic taper over the last 16%.
  const taperFrom = Math.min(lastGood, Math.round(bottomPx - (bottomPx - rimPx) * 0.16));
  let base = taperFrom;
  while (base > rimPx && !hw[base]) base--;
  for (let y = taperFrom + 1; y <= bottomPx; y++) {
    const t = (y - taperFrom) / Math.max(1, bottomPx - taperFrom);
    hw[y] = Math.max(W * 0.004, hw[base] * Math.sqrt(Math.max(0, 1 - t * t)));
  }
  // Fill any gap in the upper bowl (rim ellipse rows) from neighbours.
  for (let y = rimPx; y <= bottomPx; y++) if (!hw[y]) hw[y] = hw[y - 1] || hw[y + 1] || 0;

  // ---- 2. Dry glass: paint the photographed wine out of the bowl.
  const dry = Buffer.from(data);
  const wall = Math.max(6, Math.round(W * 0.0055));
  const wineTop = Math.round((v.surface - v.surfaceHalf - 0.035) * H);
  const glowEnd = Math.round((v.bottom + 0.05) * H);
  const bg = [7, 6, 8];
  // Below the lit silhouette the bowl's true width is where the wine glows.
  const redHalfRow = (y, threshold = 22) => {
    let L = -1;
    let R = -1;
    for (let x = cxPx - bandPx; x <= cxPx + bandPx; x++) {
      const i = at(x, y);
      if (data[i] - Math.max(data[i + 1], data[i + 2]) > threshold) {
        if (L < 0) L = x;
        R = x;
      }
    }
    return L < 0 ? 0 : Math.max(R - cxPx, cxPx - L);
  };
  // Average cross-section of the empty upper bowl, indexed by u ∈ [-1, 1].
  const SHEEN = 128;
  const sheen = Array.from({ length: SHEEN }, () => [0, 0, 0]);
  const yA = Math.round(H * (v.rim + (v.surface - v.rim) * 0.3));
  const yB = Math.round(H * (v.rim + (v.surface - v.rim) * 0.8));
  for (let k = 0; k < SHEEN; k++) {
    const u = (k / (SHEEN - 1)) * 2 - 1;
    let r = 0, g = 0, b = 0, n = 0;
    for (let y = yA; y <= yB; y++) {
      const i = at(Math.round(cxPx + u * hw[y]), y);
      r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
    }
    sheen[k] = [bg[0] + (r / n - bg[0]) * 0.9, bg[1] + (g / n - bg[1]) * 0.9, bg[2] + (b / n - bg[2]) * 0.9];
  }
  const lowEnd = bottomPx + Math.round(H * 0.012);
  const redHalfCache = new Map();
  const redHalf = (y) => {
    if (!redHalfCache.has(y)) redHalfCache.set(y, redHalfRow(y));
    return redHalfCache.get(y);
  };
  const lowBowlFrom = taperFrom - Math.round(H * 0.04);
  for (let y = wineTop; y <= glowEnd; y++) {
    // The open interior is painted back to the set only where the silhouette
    // was measured; the tapered bowl bottom keeps its thick-glass light.
    const open =
      y <= taperFrom ? hw[y] - wall * 2 : y <= lowEnd ? Math.max(redHalf(y), hw[y]) - wall * 2 : 0;
    const fadeIn = smooth(wineTop, wineTop + H * 0.03, y) * smooth(lowEnd, lowEnd - H * 0.02, y);
    // the sheen dies away into the dark bowl bottom instead of stopping
    const sheenFade = smooth(lowEnd, taperFrom - H * 0.03, y);
    for (let x = cxPx - bandPx; x <= cxPx + bandPx; x++) {
      const i = at(x, y);
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];
      // Anything lit red by the wine becomes the neutral warm rim light.
      if (r - Math.max(g, b) > 10) {
        // the wine's glowing edge in the lower bowl is not glass light: an
        // empty bowl bottom is dark there
        const lowBowl =
          y >= lowBowlFrom && y <= lowEnd + H * 0.02 && Math.abs(x - cxPx) < redHalf(y) - wall * 0.6;
        const l = lum(r, g, b) * (lowBowl ? 0.18 : 0.85);
        r = clamp(l * 1.18, 0, 255);
        g = clamp(l * 0.9, 0, 255);
        b = clamp(l * 0.74, 0, 255);
      }
      const d = Math.abs(x - cxPx);
      const k = open > 0 ? smooth(open, open - wall * 1.5, d) * fadeIn : 0;
      // Fill the emptied interior with the empty bowl's average cross-section
      // (its soft vertical sheen), so the crystal reads as one empty glass.
      let fr = bg[0], fg = bg[1], fb = bg[2];
      if (k > 0 && open > 0) {
        const u = clamp((x - cxPx) / (open + wall * 2), -0.82, 0.82);
        const s0 = sheen[Math.round(((u + 1) / 2) * (SHEEN - 1))];
        fr = bg[0] + (s0[0] - bg[0]) * sheenFade;
        fg = bg[1] + (s0[1] - bg[1]) * sheenFade;
        fb = bg[2] + (s0[2] - bg[2]) * sheenFade;
      }
      dry[i] = Math.round(r + (fr - r) * k);
      dry[i + 1] = Math.round(g + (fg - g) * k);
      dry[i + 2] = Math.round(b + (fb - b) * k);
    }
  }

  // ---- 3. Stage: the set with the whole glass painted out (row inpaint).
  const stage = Buffer.from(data);
  /** Where the set was painted (the glass's footprint): the layers' matte. */
  const region = new Uint8Array(W * H);
  /** Half-width of that footprint per row: the glass as photographed. */
  const reach = new Array(H).fill(0);
  const top =Math.round((v.rim - 0.012) * H);
  const footPx = Math.round(v.foot * H);
  const pad = Math.round(W * 0.012);
  const sample = (x, y) => {
    let r = 0, g = 0, b = 0, n = 0;
    for (let k = -3; k <= 3; k++) {
      const i = at(clamp(x + k, 0, W - 1), y);
      r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
    }
    return [r / n, g / n, b / n];
  };
  // a little below the foot too: the foot's lower edge is drawn on the
  // floor, and must leave with the glass rather than stay on the table
  const floorPx = footPx + Math.round(H * 0.014);
  let lastL = cxPx;
  let lastR = cxPx;
  for (let y = top; y <= floorPx; y++) {
    const e = y <= footPx ? edges[y] : null;
    let L = e ? e[0] - pad : y > footPx ? lastL : cxPx - Math.round(W * 0.01);
    let R = e ? e[1] + pad : y > footPx ? lastR : cxPx + Math.round(W * 0.01);
    if (y <= bottomPx) {
      L = Math.min(L, cxPx - Math.round(hw[y]) - pad);
      R = Math.max(R, cxPx + Math.round(hw[y]) + pad);
    }
    // the wine's red glow spills past the silhouette around the stem top
    if (y >= bottomPx - H * 0.04 && y <= bottomPx + H * 0.1) {
      const rh = redHalfRow(y, 8);
      if (rh > 0) {
        L = Math.min(L, cxPx - rh - pad);
        R = Math.max(R, cxPx + rh + pad);
      }
    }
    if (y <= footPx) {
      lastL = L;
      lastR = R;
    }
    reach[y] = Math.max(cxPx - L, R - cxPx);
    const a = sample(L - 4, y);
    const c = sample(R + 4, y);
    for (let x = L; x <= R; x++) region[y * W + x] = 255;
    for (let x = L; x <= R; x++) {
      const t = (x - L) / Math.max(1, R - L);
      const i = at(x, y);
      const n = (Math.random() - 0.5) * 1.2; // dither, no banding
      stage[i] = Math.round(a[0] + (c[0] - a[0]) * t + n);
      stage[i + 1] = Math.round(a[1] + (c[1] - a[1]) * t + n);
      stage[i + 2] = Math.round(a[2] + (c[2] - a[2]) * t + n);
    }
  }

  // Row by row the painted set streaks; soften it down the rows, inside the
  // painted footprint only, so the floor the glass reveals reads as one.
  {
    const painted = Buffer.from(stage);
    const RY = Math.round(H * 0.006);
    for (let y = top; y <= floorPx; y++) {
      for (let x = 0; x < W; x++) {
        if (!region[y * W + x]) continue;
        const sum = [0, 0, 0];
        let n = 0;
        for (let k = Math.max(top, y - RY); k <= Math.min(floorPx, y + RY); k++) {
          if (!region[k * W + x]) continue;
          const i = at(x, k);
          sum[0] += painted[i];
          sum[1] += painted[i + 1];
          sum[2] += painted[i + 2];
          n++;
        }
        const i = at(x, y);
        for (let c = 0; c < 3; c++) stage[i + c] = Math.round(sum[c] / n);
      }
    }
  }

  // ---- 4. Layers against the stage *as shipped* (encoded, then decoded), so
  //         stage + wet − shade is the photograph, compression included.
  const outDir = join(ROOT, "public", "sequences", "wine-glass", "pour", v.dir);
  await mkdir(outDir, { recursive: true });
  const stageFile = await sharp(stage, { raw: { width: W, height: H, channels: 3 } })
    .webp({ quality: 92, smartSubsample: true })
    .toBuffer();
  await writeFile(join(outDir, "stage.webp"), stageFile);
  const shipped = await sharp(stageFile).removeAlpha().raw().toBuffer();

  // The matte: the painted footprint, softened by a few pixels. Outside it
  // the stage already is the photograph, and the layers are exactly zero.
  const matte = await sharp(Buffer.from(region), { raw: { width: W, height: H, channels: 1 } })
    .blur(Math.max(1.5, W * 0.0015))
    .extractChannel(0)
    .raw()
    .toBuffer();

  const cx0 = Math.round(v.crop.x0 * W);
  const cx1 = Math.round(v.crop.x1 * W);
  const cy0 = Math.round(v.crop.y0 * H);
  const cy1 = Math.round(v.crop.y1 * H);
  const cw = cx1 - cx0;
  const ch = cy1 - cy0;
  let outside = 0;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (region[y * W + x] && (x < cx0 || x >= cx1 || y < cy0 || y >= cy1)) outside++;
  if (outside) console.warn(`${v.dir}: ${outside} footprint pixels fall outside the crop`);

  const glass = Buffer.alloc(cw * ch * 3);
  const wet = Buffer.alloc(cw * ch * 3);
  const shade = Buffer.alloc(cw * ch * 3);
  // Signed difference split into added light (per channel) and one shared
  // darkening: exact wherever no channel is darker than the pixel's mean.
  const split = (src, i, m, out, o, shadeCh) => {
    const d = [0, 1, 2].map((c) => src[i + c] - shipped[i + c]);
    const neg = Math.max(0, -(d[0] + d[1] + d[2]) / 3);
    for (let c = 0; c < 3; c++) out[o + c] = Math.round(clamp((d[c] + neg) * m, 0, 255));
    shade[o + shadeCh] = Math.round(clamp(neg * m * SHADE_GAIN, 0, 255));
  };
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const p = (cy0 + y) * W + cx0 + x;
      const i = p * 3;
      const o = (y * cw + x) * 3;
      const m = matte[p] / 255;
      split(dry, i, m, glass, o, 1);
      split(data, i, m, wet, o, 0);
    }
  }

  const layer = (buf, file) =>
    sharp(buf, { raw: { width: cw, height: ch, channels: 3 } })
      .webp({ quality: 92, smartSubsample: true, effort: 6 })
      .toFile(join(outDir, file));
  await layer(glass, "glass.webp");
  // The photograph of the glass with its wine.
  await layer(wet, "wet.webp");
  await layer(shade, "shade.webp");
  // A review image of the dry glass (not shipped to the page).
  await mkdir(join(ROOT, ".higgsfield", "review"), { recursive: true });
  await sharp(dry, { raw: { width: W, height: H, channels: 3 } })
    .extract({ left: cx0, top: cy0, width: cw, height: ch })
    .resize({ height: 900 })
    .png()
    .toFile(join(ROOT, ".higgsfield", "review", `pour-dry-${v.dir}.png`));

  // ---- 5. Geometry, in still units normalised by height (isotropic).
  const profile = [];
  const outer = [];
  for (let k = 0; k < PROFILE_SAMPLES; k++) {
    const y = Math.round(rimPx + ((bottomPx - rimPx) * k) / (PROFILE_SAMPLES - 1));
    profile.push(+((hw[y] - wall) / H).toFixed(5));
    outer.push(+(reach[y] / H).toFixed(5));
  }
  return {
    dir: v.dir,
    still: { width: W, height: H, aspect: +(W / H).toFixed(5) },
    crop: {
      x0: +(cx0 / H).toFixed(5),
      y0: +(cy0 / H).toFixed(5),
      w: +(cw / H).toFixed(5),
      h: +(ch / H).toFixed(5),
    },
    cx: +(cxPx / H).toFixed(5),
    rim: +(rimPx / H).toFixed(5),
    bottom: +(bottomPx / H).toFixed(5),
    surface: v.surface,
    surfaceHalf: v.surfaceHalf,
    foot: v.foot,
    lipHalf: +((hw[rimPx + 2] || hw[rimPx + 6]) / H).toFixed(5),
    /** Wall thickness: the profile is the interior, the wall lies outside it. */
    wall: +(wall / H).toFixed(5),
    profile,
    /** Half-width of the photographed glass per profile row, outer edge plus a margin. */
    outer,
  };
}

const out = [];
for (const v of VARIANTS) out.push(await build(v));

const ts = `// Generated by scripts/build-pour-assets.mjs — do not edit by hand.
// Units: fractions of the source still's HEIGHT (x and y), origin top-left.
export const POUR_GEOMETRY = ${JSON.stringify(Object.fromEntries(out.map((g) => [g.dir, g])), null, 2)} as const;
`;
await mkdir(join(ROOT, "components", "hero", "pour"), { recursive: true });
await writeFile(join(ROOT, "components", "hero", "pour", "geometry.generated.ts"), ts);
console.log(out.map((g) => `${g.dir}: crop ${g.crop.w}x${g.crop.h} lipHalf ${g.lipHalf}`).join("\n"));
