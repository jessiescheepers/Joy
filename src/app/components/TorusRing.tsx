"use client";

import { useEffect, useRef } from "react";
import type { Register } from "../page";

interface TorusRingProps {
  register: Register;
  size?: number;
}

// ─── Breath cycle: 4s in, 2s hold, 5s out ───
const INHALE = 4.0, HOLD = 2.0, EXHALE = 5.0;
const CYCLE = INHALE + HOLD + EXHALE; // 11s

function breathCycle(time: number): number {
  const drift = Math.sin(time * 0.037) * 0.4 + Math.sin(time * 0.089) * 0.25;
  const t = ((time + drift) % CYCLE + CYCLE) % CYCLE;
  if (t < INHALE) {
    const p = t / INHALE;
    return p * p * (3.0 - 2.0 * p);
  } else if (t < INHALE + HOLD) {
    return 1.0 + Math.sin(time * 1.7) * 0.015;
  } else {
    const p = (t - INHALE - HOLD) / EXHALE;
    const ease = p * p * (3.0 - 2.0 * p);
    return 1.0 - ease;
  }
}

// ─── GLSL ───

const VERT = `#version 300 es
layout(location=0) in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `#version 300 es
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform float uBreathAmt;
uniform float uBreathing;
uniform vec3 uRimTint;
uniform vec3 uBgColor;

out vec4 fragColor;

// ─── SDF helpers ───

mat3 rotX(float a) { float c=cos(a),s=sin(a); return mat3(1,0,0,0,c,-s,0,s,c); }

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float ringSDF(vec3 p) {
  // Face-on orientation (rotX π/2)
  p = rotX(1.5708) * p;

  // Breathing: tube inflation
  float breath = uBreathAmt;
  float breath2 = breath * breath;
  float breath3 = breath2 * breath;

  float tubeR = 0.078 + breath * 0.10;
  float majorR = 0.288 - breath2 * 0.015;

  float majorAngle = atan(p.z, p.x);
  float radialDist = length(p.xz) - majorR;
  float tubeAngle = atan(p.y, radialDist);

  // Inner face creases
  float innerFace = smoothstep(1.2, 2.5, abs(tubeAngle));
  float c1 = exp(-pow(sin(majorAngle * 1.5 + 0.4), 2.0) * 2.0);
  float c2 = exp(-pow(sin(majorAngle * 1.5 + 2.5), 2.0) * 2.5) * 0.7;
  float creasePinch = (c1 + c2) * innerFace * breath3 * 0.010;

  // Outer bulge — asymmetric, like a balloon
  float outerFace = 1.0 - smoothstep(0.0, 1.4, abs(tubeAngle));
  float bulge = sin(majorAngle * 1.0 + 0.3) * 0.3 + sin(majorAngle * 2.7 - 0.5) * 0.2;
  float asymBulge = outerFace * bulge * breath2 * 0.012;

  // Exhale wobble
  float exhalePhase = max(0.0, -sin(uTime * 0.57));
  float wobble = sin(majorAngle * 3.0 + uTime * 4.0) * sin(tubeAngle * 2.0 + uTime * 3.0)
               * exhalePhase * (1.0 - breath) * 0.006;

  // Subtle organic baseline
  float baseDisp = sin(p.x * 4.0 + uTime * 0.25) *
                   sin(p.z * 3.0 + uTime * 0.18) * 0.004;

  return sdTorus(p, vec2(majorR, tubeR)) + baseDisp + creasePinch + asymBulge + wobble;
}

vec3 calcNormal(vec3 p) {
  vec2 e = vec2(0.0005, 0.0);
  return normalize(vec3(
    ringSDF(p + e.xyy) - ringSDF(p - e.xyy),
    ringSDF(p + e.yxy) - ringSDF(p - e.yxy),
    ringSDF(p + e.yyx) - ringSDF(p - e.yyx)
  ));
}

float march(vec3 ro, vec3 rd, out vec3 hitPos, out float closestDist) {
  float t = 0.0;
  closestDist = 1e10;
  for (int i = 0; i < 64; i++) {
    vec3 p = ro + rd * t;
    float d = ringSDF(p);
    closestDist = min(closestDist, d);
    if (d < 0.0004) { hitPos = p; return t; }
    if (t > 20.0) break;
    t += d;
  }
  return -1.0;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 ndc = (uv - 0.5) * 2.0;
  ndc.x *= uRes.x / uRes.y;

  // Camera — ring centered
  vec3 ro = vec3(0.0, 0.0, 3.0);
  vec3 rd = normalize(vec3(ndc, -1.5));

  vec3 bg = uBgColor;

  vec3 hitPos;
  float closestDist;
  float t = march(ro, rd, hitPos, closestDist);

  if (t > 0.0) {
    vec3 N = calcNormal(hitPos);
    vec3 V = normalize(ro - hitPos);
    float NdotV = max(dot(N, V), 0.0);
    float edge = 1.0 - NdotV;

    // Glass = background, sculpted
    vec3 glass = bg;

    // Shadow sculpting
    vec3 lightDir = normalize(vec3(-0.5, 0.8, 0.6));
    float NdotL = dot(N, lightDir);
    float shadow = smoothstep(0.2, -0.6, NdotL) * 0.10;
    glass *= (1.0 - shadow);

    // Inner hole depth cue
    float innerFace = smoothstep(0.25, 0.0, NdotV) * smoothstep(-0.1, -0.5, NdotL);
    glass *= (1.0 - innerFace * 0.08);

    // Silhouette highlights — razor-thin
    vec3 warmWhite = vec3(1.0, 0.988, 0.94);
    float rimDir = dot(N, normalize(vec3(-0.5, 0.7, 0.3)));
    float dirRim = smoothstep(0.0, 0.5, rimDir);

    glass += pow(edge, 8.0) * 0.55 * warmWhite * dirRim;
    glass += pow(edge, 12.0) * 0.30 * warmWhite * dirRim;
    glass += pow(edge, 10.0) * 0.08 * uRimTint * dirRim;

    fragColor = vec4(glass, 1.0);
  } else {
    // Contact shadow
    float breathScale = 1.0 + uBreathAmt * 1.5;
    float safeDist = max(closestDist, 0.012);
    float sharpness = 120.0 / (breathScale * breathScale);
    float prox = exp(-safeDist * safeDist * sharpness);

    float vertOffset = (0.5 - uv.y);
    float dirWeight = 0.7 + 0.3 * smoothstep(-0.1, 0.15, vertOffset);
    float shadow = prox * dirWeight * 0.06;

    fragColor = vec4(bg - shadow, 1.0);
  }
}
`;

// ─── Shader helpers ───

function compileShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader | null {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error("Shader compile:", gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

function linkProgram(gl: WebGL2RenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram | null {
  const p = gl.createProgram();
  if (!p) return null;
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error("Program link:", gl.getProgramInfoLog(p));
    return null;
  }
  return p;
}

export default function TorusRing({ register, size = 300 }: TorusRingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const progRef = useRef<WebGLProgram | null>(null);
  const locsRef = useRef<Record<string, WebGLUniformLocation | null>>({});
  const rafRef = useRef<number>(0);
  const t0Ref = useRef<number>(0);
  const breathSmoothRef = useRef<number>(0);
  const regWeightsRef = useRef({ breathing: 1, talking: 0, thinking: 0, listening: 0, settling: 0 });

  // Update register targets
  const regTargetsRef = useRef({ breathing: 1, talking: 0, thinking: 0, listening: 0, settling: 0 });
  useEffect(() => {
    const tgt = regTargetsRef.current;
    for (const k in tgt) (tgt as Record<string, number>)[k] = 0;
    (tgt as Record<string, number>)[register] = 1;
  }, [register]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
    if (!gl) return;
    glRef.current = gl;

    // Compile
    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = linkProgram(gl, vs, fs);
    if (!prog) return;
    progRef.current = prog;

    // Uniforms
    locsRef.current = {
      uRes: gl.getUniformLocation(prog, "uRes"),
      uTime: gl.getUniformLocation(prog, "uTime"),
      uBreathAmt: gl.getUniformLocation(prog, "uBreathAmt"),
      uBreathing: gl.getUniformLocation(prog, "uBreathing"),
      uRimTint: gl.getUniformLocation(prog, "uRimTint"),
      uBgColor: gl.getUniformLocation(prog, "uBgColor"),
    };

    // Full-screen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    t0Ref.current = performance.now();

    // Background color: #F5F2E8 → normalized
    const bgR = 0xF5 / 255, bgG = 0xF2 / 255, bgB = 0xE8 / 255;

    // Wood rim tint: [0.82, 0.88, 0.72]
    const rimR = 0.82, rimG = 0.88, rimB = 0.72;

    function frame(now: number) {
      if (!glRef.current || !progRef.current || !canvas) return;
      const gl = glRef.current;
      const locs = locsRef.current;
      const time = (now - t0Ref.current) * 0.001;

      // Lerp register weights
      const weights = regWeightsRef.current;
      const targets = regTargetsRef.current;
      const rate = 0.04;
      for (const k in weights) {
        (weights as Record<string, number>)[k] +=
          ((targets as Record<string, number>)[k] - (weights as Record<string, number>)[k]) * rate;
      }

      // Breath
      const rawBreath = breathCycle(time) * weights.breathing;
      breathSmoothRef.current += (rawBreath - breathSmoothRef.current) * 0.06;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(progRef.current);

      gl.uniform2f(locs.uRes!, canvas.width, canvas.height);
      gl.uniform1f(locs.uTime!, time);
      gl.uniform1f(locs.uBreathAmt!, breathSmoothRef.current);
      gl.uniform1f(locs.uBreathing!, weights.breathing);
      gl.uniform3f(locs.uRimTint!, rimR, rimG, rimB);
      gl.uniform3f(locs.uBgColor!, bgR, bgG, bgB);

      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
      gl.deleteVertexArray(vao);
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
      }}
    />
  );
}
