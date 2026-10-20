/**
 * The pour, as a pure function of hero scroll progress (0..1).
 *
 * Everything the shader needs is precomputed once into a table, so the
 * scene is deterministic and reversible: scrolling back un-pours the wine.
 *
 * Units are the source still's height (see geometry.generated.ts); y grows
 * downward, positive tilt is clockwise on screen (the right lip goes down).
 */
import { POUR_GEOMETRY } from "./geometry.generated";

export type PourVariant = keyof typeof POUR_GEOMETRY;
export type PourGeometry = (typeof POUR_GEOMETRY)[PourVariant];
type Vec = [number, number];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
/** Slow in, slow out, no overshoot: the weight of a hand turning a glass. */
const easeSine = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(t));

/** Timeline, in hero progress. Copy fades 0.14–0.30, reveal 0.72–0.92. */
export const TIMELINE = {
  leanFrom: 0.01, // the first scroll already leans the glass, barely
  tiltFrom: 0.16, // the hand starts to turn the glass
  pourAt: 0.42, // …reaches the angle where wine meets the lip
  pourTo: 0.84, // …and turns slowly through the pour until the glass is dry
  poolTop: 0.88, // the pool has swallowed the viewport
  deepFrom: 0.85,
  deepTo: 0.99,
} as const;

/** Gravity and lip speed of the stream, in still-height units. */
export const STREAM = { gravity: 5.5, speed: 0.22 } as const;

export type PourFrame = {
  zoom: number;
  tilt: number;
  lift: Vec;
  /** Wine remaining in the glass, 0..1. */
  wine: number;
  level: number;
  chord: Vec;
  lip: Vec;
  lipVel: Vec;
  /** Stream half-width at the lip (0 = no pour). */
  flow: number;
  head: number;
  tail: number;
  /** Pool surface in screen space (1 = bottom edge, 0 = top). */
  pool: number;
  wave: number;
  splash: number;
  deep: number;
};

function bowlPolygon(g: PourGeometry): Vec[] {
  const n = g.profile.length;
  const hw = (i: number) => Math.max(0, i === 0 ? g.profile[1] : g.profile[i]);
  const y = (i: number) => g.rim + ((g.bottom - g.rim) * i) / (n - 1);
  const left: Vec[] = [];
  const right: Vec[] = [];
  for (let i = 0; i < n; i++) {
    left.push([g.cx - hw(i), y(i)]);
    right.push([g.cx + hw(i), y(i)]);
  }
  return [...left, ...right.reverse()];
}

export function pivotOf(g: PourGeometry): Vec {
  return [g.cx, g.rim + (g.bottom - g.rim) * 0.55];
}

const rotate = (p: Vec, c: number, s: number, o: Vec, t: Vec): Vec => {
  const x = p[0] - o[0];
  const y = p[1] - o[1];
  return [c * x - s * y + o[0] + t[0], s * x + c * y + o[1] + t[1]];
};

/** Area of the polygon below the horizontal line y = Y (y grows downward). */
function areaBelow(poly: Vec[], Y: number) {
  const out: Vec[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const ina = a[1] >= Y;
    const inb = b[1] >= Y;
    if (ina) out.push(a);
    if (ina !== inb) {
      const t = (Y - a[1]) / (b[1] - a[1]);
      out.push([a[0] + (b[0] - a[0]) * t, Y]);
    }
  }
  let s = 0;
  for (let i = 0; i < out.length; i++) {
    const a = out[i];
    const b = out[(i + 1) % out.length];
    s += a[0] * b[1] - b[0] * a[1];
  }
  return Math.abs(s) / 2;
}

/** Where the horizontal line y = Y crosses the bowl walls. */
function chordAt(poly: Vec[], Y: number): Vec {
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    if ((a[1] - Y) * (b[1] - Y) <= 0 && a[1] !== b[1]) {
      const x = a[0] + ((b[0] - a[0]) * (Y - a[1])) / (b[1] - a[1]);
      lo = Math.min(lo, x);
      hi = Math.max(hi, x);
    }
  }
  return Number.isFinite(lo) ? [lo, hi] : [0, 0];
}

const SAMPLES = 720;

/**
 * Camera: the original slow push-in until the hand moves, then a gentle
 * pull-back so the turning glass stays whole in frame (more on a portrait
 * screen, where a horizontal glass is wider than the view).
 */
const PULL_BACK: Record<PourVariant, number> = { desktop: 0.94, mobile: 0.68 };
/** Sideways drift of the lifted glass: on a phone the stem needs room on the left. */
const DRIFT_X: Record<PourVariant, number> = { desktop: -0.035, mobile: 0.05 };

export function buildTimeline(g: PourGeometry) {
  const poly = bowlPolygon(g);
  const pivot = pivotOf(g);
  const v0 = areaBelow(poly, g.surface);
  const lipLocal: Vec = [g.cx + Math.max(g.profile[1], 0), g.rim];
  const yMin = Math.min(...poly.map((p) => p[1]));
  const yMax = Math.max(...poly.map((p) => p[1]));

  type Raw = Omit<PourFrame, "head" | "tail" | "pool" | "wave" | "splash" | "deep" | "flow"> & {
    p: number;
    volume: number;
  };
  // The angles that matter, from the bowl's real shape: where the wine first
  // reaches the lip, and where the glass is (almost) dry.
  const capacityAt = (th: number) => {
    const c = Math.cos(th);
    const s = Math.sin(th);
    const lift: Vec = [0, 0];
    const wp = poly.map((q) => rotate(q, c, s, pivot, lift));
    return areaBelow(wp, rotate(lipLocal, c, s, pivot, lift)[1]);
  };
  let tiltPour = 0.9;
  let tiltEnd = 1.75;
  for (let th = 0.05; th < 2.4; th += 0.005) {
    const cap = capacityAt(th);
    if (tiltPour === 0.9 && cap < v0) tiltPour = th;
    if (cap < v0 * 0.03) {
      tiltEnd = th;
      break;
    }
  }
  /**
   * A slight lean from the first scroll (about 2°), then the turn to the pour
   * angle, then slowly through it: the pour lasts. The two rising curves are
   * summed, so the glass never rocks back.
   */
  const LEAN = Math.min(0.15, 0.035 / tiltPour);
  const tiltAt = (p: number) => {
    if (p <= TIMELINE.pourAt)
      return (
        tiltPour *
        0.995 *
        (LEAN * easeSine(smoothstep(TIMELINE.leanFrom, TIMELINE.tiltFrom, p)) +
          (1 - LEAN) * easeSine(smoothstep(TIMELINE.tiltFrom, TIMELINE.pourAt, p) ** 0.9))
      );
    const t = clamp01((p - TIMELINE.pourAt) / (TIMELINE.pourTo - TIMELINE.pourAt));
    // ease-out: generous at first, thinning as the last of the wine leaves
    const e = 1 - (1 - t) ** 1.6;
    return tiltPour * 0.995 + (tiltEnd - tiltPour * 0.995) * e + 0.12 * smoothstep(TIMELINE.pourTo, 1, p);
  };

  const raw: Raw[] = [];
  for (let k = 0; k <= SAMPLES; k++) {
    const p = k / SAMPLES;
    const tilt = tiltAt(p);
    const tt = Math.min(1, tilt / tiltEnd);
    // The glass is lifted a little off the table and drawn back, giving the
    // stream room, while staying inside the frame.
    const lift: Vec = [DRIFT_X[g.dir] * easeSine(tt), -0.045 * Math.sin(Math.min(1, tt * 1.5) * Math.PI * 0.5)];
    const c = Math.cos(tilt);
    const s = Math.sin(tilt);
    const wp = poly.map((q) => rotate(q, c, s, pivot, lift));
    const lip = rotate(lipLocal, c, s, pivot, lift);
    // Capacity: what the tilted bowl holds below its lowest rim point.
    const capacity = tilt < 1e-4 ? Infinity : areaBelow(wp, lip[1]);
    const volume = Math.min(v0, capacity);
    // Level: bisection for the line that encloses `volume`.
    let level = lip[1];
    if (volume < capacity || tilt < 1e-4) {
      let lo = Math.min(...wp.map((q) => q[1]));
      let hi = Math.max(...wp.map((q) => q[1]));
      if (tilt < 1e-4) {
        lo = yMin;
        hi = yMax;
      }
      for (let it = 0; it < 40; it++) {
        const mid = (lo + hi) / 2;
        if (areaBelow(wp, mid) > volume) lo = mid;
        else hi = mid;
      }
      level = (lo + hi) / 2;
    }
    raw.push({
      p,
      zoom:
        (1.06 + 0.06 * smoothstep(0, TIMELINE.tiltFrom, p)) *
        (1 - (1 - PULL_BACK[g.dir] / 1.12) * easeSine(smoothstep(TIMELINE.tiltFrom, 0.62, p))),
      tilt,
      lift,
      wine: v0 > 0 ? volume / v0 : 0,
      volume,
      level,
      chord: chordAt(wp, level),
      lip,
      lipVel: [Math.cos(tilt) * STREAM.speed, Math.sin(tilt) * STREAM.speed * 0.4],
    });
  }

  // Flow from the volume lost per unit of progress.
  let pourStart = -1;
  let pourEnd = -1;
  const flows = raw.map((r, k) => {
    const prev = raw[Math.max(0, k - 2)];
    const lost = Math.max(0, prev.volume - r.volume) / (r.p - prev.p || 1);
    return lost;
  });
  const maxFlow = Math.max(...flows, 1e-6);
  flows.forEach((f, k) => {
    if (f > maxFlow * 0.02) {
      if (pourStart < 0) pourStart = raw[k].p;
      pourEnd = raw[k].p;
    }
  });
  if (pourStart < 0) {
    pourStart = 0.5;
    pourEnd = 0.8;
  }
  const hitAt = pourStart + 0.05;

  const frames: PourFrame[] = raw.map((r, k) => {
    const f = flows[k] / maxFlow;
    // Width follows the flow with a floor, so the stream thins gracefully.
    const flow = f > 0.02 ? 0.011 + 0.03 * Math.sqrt(f) : 0;
    const fall = (from: number) => r.lip[1] + 1.8 * smoothstep(from, from + 0.075, r.p) ** 1.6;
    const head = r.p < pourStart ? r.lip[1] : fall(pourStart);
    const tail = r.p < pourEnd ? -10 : fall(pourEnd);
    const rise = smoothstep(hitAt, TIMELINE.poolTop, r.p);
    // starts below the frame with its surface band and waves, so nothing
    // of the pool shows before the wine reaches it
    const pool = 1.1 - 1.23 * (rise * rise * (3 - 2 * rise) * 0.55 + rise * 0.45);
    return {
      zoom: r.zoom,
      tilt: r.tilt,
      lift: r.lift,
      wine: r.wine,
      level: r.level,
      chord: r.chord,
      lip: r.lip,
      lipVel: r.lipVel,
      flow,
      head,
      tail,
      pool,
      wave: 0.018 + 0.03 * f,
      splash: r.p > hitAt ? 0.022 * (0.4 + 0.6 * f) * (1 - smoothstep(0.8, 0.9, r.p)) : 0,
      deep: smoothstep(TIMELINE.deepFrom, TIMELINE.deepTo, r.p),
    };
  });

  return {
    frames,
    pourStart,
    pourEnd,
    /** Interpolated frame for any progress. */
    at(p: number): PourFrame {
      const x = clamp01(p) * SAMPLES;
      const i = Math.min(SAMPLES - 1, Math.floor(x));
      const t = x - i;
      const a = frames[i];
      const b = frames[i + 1];
      const m = (u: number, v: number) => u + (v - u) * t;
      const mv = (u: Vec, v: Vec): Vec => [m(u[0], v[0]), m(u[1], v[1])];
      return {
        zoom: m(a.zoom, b.zoom),
        tilt: m(a.tilt, b.tilt),
        lift: mv(a.lift, b.lift),
        wine: m(a.wine, b.wine),
        level: m(a.level, b.level),
        chord: mv(a.chord, b.chord),
        lip: mv(a.lip, b.lip),
        lipVel: mv(a.lipVel, b.lipVel),
        flow: m(a.flow, b.flow),
        head: m(a.head, b.head),
        tail: m(a.tail, b.tail),
        pool: m(a.pool, b.pool),
        wave: m(a.wave, b.wave),
        splash: m(a.splash, b.splash),
        deep: m(a.deep, b.deep),
      };
    },
  };
}

export type PourTimeline = ReturnType<typeof buildTimeline>;
