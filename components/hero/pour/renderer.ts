/**
 * Minimal WebGL2 renderer for the pour: one program, one full-screen
 * triangle, five small textures. No framework — the whole scene is a shader.
 */
import { FRAG, VERT } from "./shaders";
import { POUR_GEOMETRY } from "./geometry.generated";
import { STREAM, pivotOf, type PourFrame, type PourVariant } from "./choreography";

export const POUR_BASE = "/sequences/wine-glass/pour";
/** Bump when the layers are rebuilt, so no browser keeps the old ones. */
const POUR_VERSION = "2";
export const pourAssets = (v: PourVariant) =>
  ["stage", "glass", "wet", "shade"].map((n) => `${POUR_BASE}/${v}/${n}.webp?v=${POUR_VERSION}`);

const UNIFORMS = [
  "uRes", "uTime", "uView", "uCenter", "uZoom", "uAspect", "uStage", "uGlass", "uWet",
  "uShade", "uNoise", "uCrop", "uCx", "uRim", "uBottom", "uSurface", "uFoot", "uProfile", "uOuter", "uPivot",
  "uLift", "uRot", "uLevel", "uChord", "uEllK", "uWall", "uRest", "uWine", "uLip", "uLipVel",
  "uGravity", "uFlow", "uHead", "uTail", "uPool", "uImpact", "uWave", "uSplash", "uDeep",
  "uExposure",
] as const;
type U = (typeof UNIFORMS)[number];

let webgl2: boolean | null = null;
export function supportsWebGL2() {
  if (webgl2 === null) {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2");
      webgl2 = !!gl;
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      webgl2 = false;
    }
  }
  return webgl2;
}

/** Tileable value noise (4 octaves baked), 256², single channel in R. */
function noiseTexture(gl: WebGL2RenderingContext) {
  const N = 256;
  const data = new Uint8Array(N * N * 4);
  const lattice = (period: number) => {
    const g = new Float32Array(period * period);
    for (let i = 0; i < g.length; i++) g[i] = Math.random();
    return (x: number, y: number) => {
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      const fx = x - xi;
      const fy = y - yi;
      const sx = fx * fx * (3 - 2 * fx);
      const sy = fy * fy * (3 - 2 * fy);
      const at = (a: number, b: number) => g[((b % period) + period) % period * period + (((a % period) + period) % period)];
      const a = at(xi, yi) + (at(xi + 1, yi) - at(xi, yi)) * sx;
      const b = at(xi, yi + 1) + (at(xi + 1, yi + 1) - at(xi, yi + 1)) * sx;
      return a + (b - a) * sy;
    };
  };
  const octaves = [8, 16, 32, 64].map((p) => ({ p, f: lattice(p) }));
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      let v = 0;
      let amp = 0.5;
      let norm = 0;
      for (const o of octaves) {
        v += o.f((x / N) * o.p, (y / N) * o.p) * amp;
        norm += amp;
        amp *= 0.5;
      }
      const i = (y * N + x) * 4;
      data[i] = Math.round((v / norm) * 255);
      data[i + 1] = data[i + 2] = data[i];
      data[i + 3] = 255;
    }
  }
  const t = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, N, N, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return t;
}

async function loadBitmap(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`pour asset ${url}: ${res.status}`);
  return createImageBitmap(await res.blob());
}

export class PourRenderer {
  private gl: WebGL2RenderingContext;
  private prog: WebGLProgram;
  private u = {} as Record<U, WebGLUniformLocation | null>;
  private tex: WebGLTexture[] = [];
  private geo: (typeof POUR_GEOMETRY)[PourVariant];
  private start = performance.now();
  private ellK: number;
  /** Render scale on top of DPR, lowered automatically if frames run long. */
  quality = 1;

  constructor(
    private canvas: HTMLCanvasElement,
    readonly variant: PourVariant,
  ) {
    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });
    if (!gl) throw new Error("webgl2 unavailable");
    this.gl = gl;
    this.geo = POUR_GEOMETRY[variant];

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.bindAttribLocation(prog, 0, "aPos");
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? "link");
    this.prog = prog;
    gl.useProgram(prog);
    for (const name of UNIFORMS) this.u[name] = gl.getUniformLocation(prog, name);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // Static uniforms: the glass's measured geometry.
    const g = this.geo;
    gl.uniform1f(this.u.uAspect, g.still.aspect);
    gl.uniform4f(this.u.uCrop, g.crop.x0, g.crop.y0, g.crop.w, g.crop.h);
    gl.uniform1f(this.u.uCx, g.cx);
    gl.uniform1f(this.u.uRim, g.rim);
    gl.uniform1f(this.u.uBottom, g.bottom);
    gl.uniform1f(this.u.uSurface, g.surface);
    gl.uniform1f(this.u.uFoot, g.foot);
    gl.uniform1fv(this.u.uProfile, new Float32Array(g.profile));
    gl.uniform1fv(this.u.uOuter, new Float32Array(g.outer));
    const pv = pivotOf(g);
    gl.uniform2f(this.u.uPivot, pv[0], pv[1]);
    // Surface ellipse flattening, measured on the photograph.
    const surfaceHalfWidth = g.profile[Math.round(((g.surface - g.rim) / (g.bottom - g.rim)) * 63)];
    this.ellK = g.surfaceHalf / Math.max(surfaceHalfWidth, 1e-3);
    gl.uniform1f(this.u.uEllK, this.ellK);
    gl.uniform1f(this.u.uWall, g.wall);
    gl.uniform1f(this.u.uGravity, STREAM.gravity);
    [this.u.uStage, this.u.uGlass, this.u.uWet, this.u.uShade, this.u.uNoise].forEach((loc, i) =>
      gl.uniform1i(loc, i),
    );
  }

  async load() {
    const gl = this.gl;
    const bitmaps = await Promise.all(pourAssets(this.variant).map(loadBitmap));
    bitmaps.forEach((bmp, i) => {
      const t = gl.createTexture()!;
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bmp);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      bmp.close();
      this.tex.push(t);
    });
    gl.activeTexture(gl.TEXTURE4);
    this.tex.push(noiseTexture(gl));
    gl.bindTexture(gl.TEXTURE_2D, this.tex[4]);
  }

  /**
   * The wine as photographed (the untilted frame): the shader finds every
   * point of the moving wine in the photograph from here, so at rest the
   * picture is the photograph and the first degree of tilt is continuous.
   */
  setRest(f: PourFrame) {
    const hc = Math.max(0.5 * (f.chord[1] - f.chord[0]), 1e-4);
    this.gl.useProgram(this.prog);
    this.gl.uniform4f(this.u.uRest, 0.5 * (f.chord[0] + f.chord[1]), hc, f.level, hc * this.ellK);
  }

  /** Match the drawing buffer to the element, DPR capped for memory. */
  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * this.quality;
    const w = Math.max(1, Math.round(this.canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(this.canvas.clientHeight * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  render(f: PourFrame, exposure: number) {
    const gl = this.gl;
    const u = this.u;
    const W = this.canvas.width;
    const H = this.canvas.height;
    gl.viewport(0, 0, W, H);

    // "Cover" framing of the still, as the original frames were cut.
    const A = this.geo.still.aspect;
    const a = W / H;
    const view: [number, number] = a > A ? [A, A / a] : [a, 1];
    gl.uniform2f(u.uRes, W, H);
    gl.uniform1f(u.uTime, (performance.now() - this.start) / 1000);
    gl.uniform2f(u.uView, view[0], view[1]);
    gl.uniform2f(u.uCenter, A / 2, 0.5);
    gl.uniform1f(u.uZoom, f.zoom);
    gl.uniform2f(u.uLift, f.lift[0], f.lift[1]);
    gl.uniform2f(u.uRot, Math.cos(f.tilt), Math.sin(f.tilt));
    gl.uniform1f(u.uLevel, f.level);
    gl.uniform2f(u.uChord, f.chord[0], f.chord[1]);
    gl.uniform1f(u.uWine, f.wine);
    gl.uniform2f(u.uLip, f.lip[0], f.lip[1]);
    gl.uniform2f(u.uLipVel, f.lipVel[0], f.lipVel[1]);
    gl.uniform1f(u.uFlow, f.flow);
    gl.uniform1f(u.uHead, f.head);
    gl.uniform1f(u.uTail, f.tail);
    gl.uniform1f(u.uPool, f.pool);
    gl.uniform1f(u.uWave, f.wave);
    gl.uniform1f(u.uSplash, f.splash);
    gl.uniform1f(u.uDeep, f.deep);
    gl.uniform1f(u.uExposure, exposure);

    // Where the stream meets the pool, in screen space (for the splash).
    const poolY = 0.5 + ((f.pool - 0.5) * view[1]) / f.zoom;
    const dy = Math.max(0, poolY - f.lip[1]);
    const s = (-f.lipVel[1] + Math.sqrt(f.lipVel[1] ** 2 + 2 * STREAM.gravity * dy)) / STREAM.gravity;
    const impactX = f.lip[0] + f.lipVel[0] * s;
    gl.uniform1f(u.uImpact, (impactX - A / 2) * (f.zoom / view[0]) + 0.5);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  dispose() {
    const gl = this.gl;
    this.tex.forEach((t) => gl.deleteTexture(t));
    gl.deleteProgram(this.prog);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
