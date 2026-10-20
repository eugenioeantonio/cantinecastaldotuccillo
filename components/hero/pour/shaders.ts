/**
 * One full-screen pass. Layers, back to front:
 *   stage (the photographed set) → the falling stream → the glass and its
 *   wine, both photographed (the glass tilted, the wine moved inside it so
 *   it stays level)
 *   → the pool rising from the bottom of the frame, which ends as the
 *     deep wine field the rest of the site is built on.
 * Coordinates: S = point of the source still (units of its height, y down).
 */
export const VERT = /* glsl */ `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

export const FRAG = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uView;
uniform vec2 uCenter;
uniform float uZoom;
uniform float uAspect;
uniform sampler2D uStage;
uniform sampler2D uGlass;
uniform sampler2D uWet;
uniform sampler2D uShade;
uniform sampler2D uNoise;
uniform vec4 uCrop;
uniform float uCx;
uniform float uRim;
uniform float uBottom;
uniform float uSurface;
uniform float uFoot;
uniform float uProfile[64];
uniform float uOuter[64];
uniform vec2 uPivot;
uniform vec2 uLift;
uniform vec2 uRot;
uniform float uLevel;
uniform vec2 uChord;
uniform float uEllK;
uniform float uWall;
uniform vec4 uRest;  // the wine as photographed: chord centre, half chord, level, half depth
uniform float uWine;
uniform vec2 uLip;
uniform vec2 uLipVel;
uniform float uGravity;
uniform float uFlow;
uniform float uHead;
uniform float uTail;
uniform float uPool;
uniform float uImpact;
uniform float uWave;
uniform float uSplash;
uniform float uDeep;
uniform float uExposure;

const vec3 DEEP = vec3(0.145, 0.027, 0.051);   // #25070d, the next scene
// the stream's margins and core, as the photographed wine reads: near-black
// in depth, a deep red only where it is thin and backlit
const vec3 RUBY = vec3(0.46, 0.03, 0.06);
const vec3 GARNET = vec3(0.05, 0.005, 0.012);
const float SHADE = 1.0 / 3.0; // shade.webp stores darkening x3
const float MENISCUS = 0.014;   // the band above the surface that moves with it

vec2 toStill(vec2 uv) { return uCenter + (uv - 0.5) * uView / uZoom; }
vec2 toUv(vec2 s) { return (s - uCenter) * uZoom / uView + 0.5; }
float nz(vec2 p) { return texture(uNoise, p).r; }
float fbm(vec2 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 4; i++) { s += a * texture(uNoise, p).r; p = p * 2.03 + 0.17; a *= 0.5; }
  return s;
}
float profileAt(float t) {
  float x = clamp(t, 0.0, 1.0) * 63.0;
  int i = int(floor(x));
  int j = min(i + 1, 63);
  return max(0.0, mix(uProfile[i], uProfile[j], fract(x)));
}
vec2 toLocal(vec2 s) {
  vec2 d = s - uPivot - uLift;
  return vec2(uRot.x * d.x + uRot.y * d.y, -uRot.y * d.x + uRot.x * d.y) + uPivot;
}

vec2 toWorld(vec2 L) {
  vec2 d = L - uPivot;
  return vec2(uRot.x * d.x - uRot.y * d.y, uRot.y * d.x + uRot.x * d.y) + uPivot + uLift;
}
vec2 cropUv(vec2 P) { return (P - uCrop.xy) / uCrop.zw; }

/* The photographed glass as signed light over the set: what it adds, minus
   what it takes away (the dark wine, the foot on the floor). */
vec3 wetAt(vec2 P, float shadeK) {
  vec2 g = cropUv(P);
  return texture(uWet, g).rgb - texture(uShade, g).r * SHADE * shadeK;
}
vec3 dryAt(vec2 P, float shadeK) {
  vec2 g = cropUv(P);
  return texture(uGlass, g).rgb - texture(uShade, g).g * SHADE * shadeK;
}

float outerAt(float t) {
  float x = clamp(t, 0.0, 1.0) * 63.0;
  int i = int(floor(x));
  int j = min(i + 1, 63);
  return mix(uOuter[i], uOuter[j], fract(x));
}

/* The bowl as photographed (local coords); t: 0 rim … 1 bottom. Bounded by
   the glass's own measured reach, not the interior profile: the profile is
   an estimate in the unlit lower bowl and would cut through it, while no
   bound at all would carry the set beside the glass into the wine. */
float bowlZone(vec2 L, out float t) {
  t = (L.y - uRim) / (uBottom - uRim);
  float reach = outerAt(t);
  return smoothstep(reach + 0.004, reach, abs(L.x - uCx))
       * smoothstep(-0.01, 0.0, t) * smoothstep(1.02, 1.0, t);
}

/* The wine's surface ellipse in its own unit coordinates. Above the level
   it reaches a little further than the disc, so the meniscus line the wine
   draws on the glass travels with the surface instead of staying behind. */
vec2 discQ(vec2 P, float mx, float hc, float level, float e) {
  float ey = P.y < level ? e + MENISCUS : e;
  return vec2((P.x - mx) / hc, (P.y - level) / ey);
}

/* How much of P is wine: inside the level surface ellipse, or below its
   near edge. P is in a frame where that surface is horizontal. */
float wineIn(vec2 P, float mx, float hc, float level, float e) {
  vec2 q = discQ(P, mx, hc, level, e);
  float disc = 1.0 - smoothstep(0.94, 1.06, dot(q, q));
  float lower = level + e * sqrt(max(0.0, 1.0 - q.x * q.x));
  return max(disc, smoothstep(lower - 0.0014, lower + 0.0014, P.y));
}

/* Where a point of the tilted wine sat in the photograph: each column of
   the bowl is stretched from today's surface to the bottom onto the rest
   surface and the bottom, at the same fraction of the bowl's width. At rest
   this is the identity, so the first degree of tilt changes nothing. */
vec2 restOf(vec2 L, float t) {
  float span = uBottom - uRim;
  float c = max(uRot.x, 0.2);
  float ys = uPivot.y + (uLevel - uPivot.y - uLift.y - uRot.y * (L.x - uPivot.x)) / c;
  float tS = (ys - uRim) / span;
  float tR = (uRest.z - uRim) / span;
  // (past the bottom, t > 1, the map is left as it is: still the identity at rest)
  float tr = clamp(tR + (t - tS) * (1.0 - tR) / max(1.0 - tS, 0.05), 0.0, max(1.0, t));
  float k = (profileAt(tr) + uWall) / max(profileAt(t) + uWall, 1e-4);
  return vec2(uCx + (L.x - uCx) * k, uRim + tr * span);
}

bool gUnder = false; // true while sampling the scene through the pool

/* The scene above the pool: set, wine in the glass, stream, glass. */
vec3 scene(vec2 uv) {
  vec2 S = toStill(uv);
  vec2 st = vec2(S.x / uAspect, S.y);
  vec3 col = texture(uStage, clamp(st, 0.001, 0.999)).rgb;

  // The red the wine threw on the table goes with the wine, and fades as
  // the glass is lifted away from it.
  vec2 footL = vec2(uCx, uFoot);
  float footMoved = length(toWorld(footL) - footL);
  float floorZone = smoothstep(uFoot - 0.14, uFoot - 0.03, S.y);
  float red = max(0.0, col.r - max(col.g, col.b));
  float cover = smoothstep(0.0, 0.25, uWine);
  col.r -= red * floorZone * (1.0 - cover * (1.0 - smoothstep(0.0, 0.08, footMoved))) * 0.95;

  // The stream: a viscous column falling from the lip.
  if (!gUnder && uFlow > 0.0 && S.y > uLip.y - 0.006 && S.y < uHead && S.y > uTail) {
    float t = uTime;
    float dy = max(S.y - uLip.y, 0.0);
    float vy = uLipVel.y;
    float s = (-vy + sqrt(vy * vy + 2.0 * uGravity * dy)) / uGravity;
    float wob = sin(S.y * 30.0 - t * 2.2) * 0.0018 + (nz(vec2(S.y * 0.7 - t * 0.25, 0.37)) - 0.5) * 0.014;
    float xc = uLip.x + uLipVel.x * s + wob * smoothstep(0.0, 0.12, s);
    // a sheet as it leaves the rim, narrowing as it accelerates
    float w = uFlow * (1.0 + 0.7 * exp(-s * 22.0)) / sqrt(1.0 + 10.0 * s);
    w *= 0.93 + 0.14 * nz(vec2(S.y * 1.6 - t * 0.9, 0.11));
    float n = (S.x - xc) / max(w, 1e-4);
    float edge = 1.0 - smoothstep(0.88, 1.03, abs(n));
    float th = sqrt(max(0.0, 1.0 - n * n));
    // a lit cylinder of wine: thin bright margins, a deep core
    vec3 sc = mix(RUBY * 1.05, GARNET * 0.75, pow(th, 0.55));
    float flowTex = nz(vec2(n * 0.06 + 0.31, S.y * 2.6 - t * 3.6));
    float flowTex2 = nz(vec2(n * 0.05 + 0.71, S.y * 1.4 - t * 2.2));
    sc += exp(-pow((n + 0.46) / 0.1, 2.0)) * (0.25 + 0.75 * flowTex) * vec3(1.0, 0.82, 0.78) * 0.62;
    sc += exp(-pow((n - 0.58) / 0.07, 2.0)) * (0.2 + 0.8 * flowTex2) * vec3(0.9, 0.5, 0.5) * 0.22;
    float fade = smoothstep(uHead, uHead - 0.025, S.y) * smoothstep(uTail, uTail + 0.02, S.y)
               * smoothstep(uLip.y - 0.006, uLip.y + 0.008, S.y);
    // margins are thin enough to let the dark show through
    col = mix(col, sc, edge * fade * (0.72 + 0.28 * th));
  }

  // The glass, photographed, tilted with the hand. Its wine is the
  // photographed wine too, moved inside the bowl so it stays level.
  vec2 L = toLocal(S);
  vec2 g = cropUv(L);
  if (g.x > 0.0 && g.x < 1.0 && g.y > 0.0 && g.y < 1.0) {
    // the foot's darkness on the floor is contact: it lifts with the glass
    float contact = 1.0 - smoothstep(0.0, 0.012, footMoved);
    float shadeK = mix(1.0, 0.35 + 0.65 * contact, smoothstep(uFoot - 0.035, uFoot - 0.01, L.y));
    vec3 wet = wetAt(L, shadeK);
    vec3 dry = dryAt(L, shadeK);
    vec3 glass = mix(dry, wet, cover);
    float t;
    float zone = bowlZone(L, t);
    if (zone > 0.0) {
      float hc = max(0.5 * (uChord.y - uChord.x), 1e-4);
      float mx = 0.5 * (uChord.x + uChord.y);
      float e = hc * uEllK;
      float now = uWine > 0.002 ? zone * wineIn(S, mx, hc, uLevel, e) : 0.0;
      float was = zone * wineIn(L, uRest.x, uRest.y, uRest.z, uRest.w);
      // the surface keeps its photographed sheen, level in the world
      // Only the interior is remapped: the wall keeps its own photographed
      // light where it stands, so it never breaks at the wine line, and
      // nothing beside the glass can be pulled into the wine.
      float hw = profileAt(t);
      float interior = smoothstep(hw + 0.002, hw - 0.002, abs(L.x - uCx));
      vec2 q = discQ(S, mx, hc, uLevel, e);
      float onDisc = (1.0 - smoothstep(0.94, 1.06, dot(q, q))) * interior;
      float restEy = q.y < 0.0 ? uRest.w + MENISCUS : uRest.w;
      vec3 body = wetAt(mix(L, restOf(L, t), interior), shadeK);
      vec3 disc = wetAt(vec2(uRest.x + q.x * uRest.y, uRest.z + q.y * restEy), shadeK);
      vec3 wine = mix(body, disc, onDisc);
      // where the wine has left, the bowl is the photographed empty glass
      float air = max(0.0, was - now);
      glass = now * wine + air * dry + (1.0 - now - air) * glass;
    }
    // the layers are empty this close to the crop; this only keeps the
    // compressed edge texels from drawing its outline
    vec2 inner = smoothstep(0.0, 0.012, g) * smoothstep(1.0, 0.988, g);
    // below the foot the layers hold only floor: it stays on the table
    float floorOnly = smoothstep(uFoot - 0.006, uFoot + 0.002, L.y);
    col += glass * inner.x * inner.y * mix(1.0, contact, floorOnly);
  }
  return col;
}

float poolAt(float xUv) {
  float t = uTime;
  // waves keep their physical size on any screen shape
  float x = xUv * (uRes.x / uRes.y) / 1.6;
  // a slow swell sloshing across the frame…
  float w = sin(x * 3.1 + t * 0.55) * 0.55 + sin(x * 5.7 - t * 0.8 + 1.3) * 0.3;
  w += (nz(vec2(x * 0.9 + t * 0.03, t * 0.04)) - 0.5) * 1.2;
  w += (nz(vec2(x * 2.1 - t * 0.05, 0.3 + t * 0.03)) - 0.5) * 0.5;
  // …and the small, uneven chop that makes it liquid, not a curve
  w += (nz(vec2(x * 8.5 - t * 0.35, 0.71 + t * 0.05)) - 0.5) * 0.2;
  w += (nz(vec2(x * 21.0 + t * 0.6, 0.13 - t * 0.08)) - 0.5) * 0.045;
  w *= uWave;
  // where the stream lands: a churning mound and rings running outward
  float dx = (xUv - uImpact) * (uRes.x / uRes.y) / 1.6;
  float churn = 0.75 + 0.5 * nz(vec2(t * 0.9, dx * 6.0 + 0.5));
  w -= uSplash * 1.8 * churn * exp(-dx * dx / 0.0025);
  w += sin(abs(dx) * 64.0 - t * 5.0) * uSplash * 0.4 * exp(-abs(dx) * 4.0);
  return uPool + w;
}

void main() {
  vec2 uv = vUv;
  float h = poolAt(uv.x);
  float d = uv.y - h;
  vec3 col = vec3(0.0);

  if (d < 0.003) col = scene(uv);  // above the pool (the surface band overrides)

  // The pool is seen from slightly above: a band of reflecting surface
  // (far edge to near edge), then the body of wine below it.
  float skin = 0.05 * (1.0 - uDeep) * (0.6 + 0.4 * smoothstep(1.0, 0.4, uPool));
  float hFar = h - skin;
  if (uv.y > hFar - 0.003) {
    float t = uTime;
    float ax = uv.x * (uRes.x / uRes.y) / 1.6;
    float dx = uv.x - uImpact;
    float under = smoothstep(-0.006, 0.006, d);
    // —— body ——
    float rays = fbm(vec2(ax * 1.1 + uv.y * 0.9 + t * 0.012, uv.y * 0.5 + t * 0.02));
    rays = smoothstep(0.45, 0.8, rays) * 0.7;
    float mottle = fbm(vec2(ax * 0.9, uv.y * 0.7 - t * 0.01) + 3.7);
    float lit = exp(-max(d, 0.0) * 4.2);
    vec3 body = mix(vec3(0.36, 0.028, 0.06), DEEP, smoothstep(0.0, 0.42, d));
    body *= 0.85 + 0.3 * mottle;
    body += rays * lit * vec3(0.2, 0.025, 0.04) * (1.0 - uDeep);
    body += exp(-max(d, 0.0) * 38.0) * vec3(0.32, 0.03, 0.06) * (1.0 - uDeep);
    // the stream's plume, stirred, under the impact
    float stir = nz(vec2(dx * 9.0 + t * 0.3, uv.y * 3.0 - t * 0.9));
    body += exp(-dx * dx / 0.006) * exp(-max(d, 0.0) * 3.5) * uSplash * (10.0 + 10.0 * stir) * vec3(0.3, 0.03, 0.055);
    // translucency: near the surface, and everywhere while the pool is shallow
    float shallow = smoothstep(0.55, 1.0, uPool);
    float see = max(exp(-max(d, 0.0) * 18.0), shallow * exp(-max(d, 0.0) * 3.0)) * (1.0 - uDeep);
    if (see > 0.02) {
      vec2 off = (vec2(nz(uv * 1.7 + t * 0.03), nz(uv * 1.3 - t * 0.02)) - 0.5) * 0.03;
      gUnder = true;
      vec3 behind = scene(uv + off);
      gUnder = false;
      body = mix(body, behind * vec3(0.9, 0.24, 0.28) + body * 0.4, see * 0.72);
    }
    body = mix(body, DEEP, uDeep);

    // —— surface (between far and near edge) ——
    float s = clamp((uv.y - hFar) / max(skin, 1e-4), 0.0, 1.0);   // 0 far … 1 near
    // reflection of the dark room, streaked by the light, brighter toward
    // the far edge (fresnel) and broken by the chop
    float streak = nz(vec2(ax * 7.0 - t * 0.12, s * 0.6 + t * 0.05));
    streak = pow(smoothstep(0.55, 0.95, streak), 2.0);
    float fres = pow(1.0 - s, 2.2);                                   // far edge catches the light
    vec3 surf = mix(vec3(0.32, 0.035, 0.065), vec3(0.62, 0.2, 0.24), fres);
    surf += streak * (0.35 + 0.65 * fres) * vec3(0.95, 0.7, 0.68) * 0.5;
    // where the stream breaks the surface: a lighter, churned patch
    float hit = exp(-dx * dx / 0.0012) * uSplash * 40.0;
    surf = mix(surf, vec3(0.7, 0.28, 0.32), clamp(hit * (0.5 + 0.5 * stir), 0.0, 0.8));
    surf = mix(surf, body, smoothstep(0.6, 1.0, s));                   // near edge melts into body
    surf = mix(surf, DEEP, uDeep);
    float onSurf = smoothstep(-0.002, 0.002, uv.y - hFar) * (1.0 - under);

    // the bright meniscus line on the far edge
    float rim = exp(-abs(uv.y - hFar) * 700.0) * (1.0 - uDeep);
    float slope = (poolAt(uv.x + 0.003) - poolAt(uv.x - 0.003)) * 90.0;

    vec3 liquid = mix(surf, body, under);
    col = mix(col, liquid, max(onSurf, under));
    col += rim * vec3(0.95, 0.62, 0.6) * (0.3 + 0.5 * clamp(abs(slope), 0.0, 1.0));
  }

  // finish: gentle vignette, film grain, exposure
  vec2 vc = uv - 0.5;
  col *= 1.0 - 0.28 * dot(vc, vc) * (1.0 - uDeep);
  float grain = fract(sin(dot(uv * uRes + uTime * 61.7, vec2(12.9898, 78.233))) * 43758.5453);
  col += (grain - 0.5) * 0.018;
  col *= uExposure;
  outColor = vec4(col, 1.0);
}`;
