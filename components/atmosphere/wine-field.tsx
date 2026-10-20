"use client";

import { useEffect, useRef } from "react";

/**
 * The wine from the hero, seen from inside: a deep field crossed by slow
 * shafts of light. One tiny shader, paused off-screen, half resolution
 * (it is all soft light). Without WebGL2 the CSS backdrop underneath stays.
 */
const VERT = `#version 300 es
in vec2 aPos; out vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; vUv.y = 1.0 - vUv.y; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform float uTime; uniform vec2 uRes; uniform float uLight;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float a = 0.5, s = 0.0; for(int i=0;i<4;i++){ s += a*n(p); p *= 2.02; a *= 0.5; } return s; }
void main(){
  vec2 uv = vUv; float t = uTime;
  float ax = uv.x * (uRes.x / uRes.y);
  vec3 deep = vec3(0.145, 0.027, 0.051);
  vec3 col = mix(vec3(0.3, 0.026, 0.055), deep, smoothstep(0.0, 0.85, uv.y));
  float rays = smoothstep(0.45, 0.82, fbm(vec2(ax * 1.6 + uv.y * 1.2 + t * 0.02, uv.y * 0.6 + t * 0.03)));
  col += rays * vec3(0.22, 0.03, 0.05) * exp(-uv.y * 1.6) * uLight;
  col *= 0.85 + 0.3 * fbm(vec2(ax * 1.2, uv.y * 0.9 - t * 0.012) + 4.1);
  col += (h(uv * uRes + t) - 0.5) * 0.016;
  o = vec4(col, 1.0);
}`;

export function WineField({ className = "", light = 1 }: { className?: string; light?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, depth: false });
    if (!gl) return;
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.bindAttribLocation(prog, 0, "aPos");
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uRes = gl.getUniformLocation(prog, "uRes");
    gl.uniform1f(gl.getUniformLocation(prog, "uLight"), light);
    canvas.dataset.live = "true";

    let raf = 0;
    let visible = false;
    const start = performance.now();
    const resize = () => {
      const s = Math.min(window.devicePixelRatio || 1, 2) * 0.5;
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * s));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * s));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    const frame = () => {
      raf = visible ? requestAnimationFrame(frame) : 0;
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    });
    const ro = new ResizeObserver(resize);
    resize();
    ro.observe(canvas);
    io.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [light]);

  return <canvas ref={ref} aria-hidden className={`wine-field ${className}`} />;
}
