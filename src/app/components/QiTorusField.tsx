"use client";

import { useEffect, useRef } from "react";
import type { Register } from "../page";

interface QiTorusFieldProps {
  register: Register;
  ringX?: number;
  ringY?: number;
  ringScale?: number;
  devRotX?: number;
  devRotY?: number;
  devRotZ?: number;
}

// ─── Breath cycle: 4s in, 2s hold, 5s out ───
const INHALE = 4.0, HOLD = 2.0, EXHALE = 5.0;
const CYCLE = INHALE + HOLD + EXHALE;

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

// ─── Shader helpers ───

function compileShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader | null {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error("Shader compile:", gl.getShaderInfoLog(s));
    console.error(src.split("\n").map((l, i) => `${i + 1}: ${l}`).join("\n"));
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

function makeProgram(gl: WebGL2RenderingContext, vertSrc: string, fragSrc: string): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  if (!vs || !fs) return null;
  return linkProgram(gl, vs, fs);
}

// ─── GLSL ───

const VERT = `#version 300 es
layout(location=0) in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

// Shared noise header
const GLSL_NOISE = `#version 300 es
precision highp float;
uniform float t;
uniform vec2 res;
out vec4 fragColor;

vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(443.897, 441.423, 437.195));
  p3 += dot(p3, p3.yzx + 19.19);
  return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0;
}
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 443.897);
  p3 += dot(p3, p3.yzx + 19.19);
  return fract((p3.x + p3.y) * p3.z);
}
float gnoise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = dot(hash22(i + vec2(0,0)), f - vec2(0,0));
  float b = dot(hash22(i + vec2(1,0)), f - vec2(1,0));
  float c = dot(hash22(i + vec2(0,1)), f - vec2(0,1));
  float d = dot(hash22(i + vec2(1,1)), f - vec2(1,1));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p, int oct) {
  float v = 0.0; float a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 6; i++) {
    if (i >= oct) break;
    v += gnoise(p) * a; p = rot * p * 2.0; a *= 0.5;
  }
  return v;
}
`;

// Wood element field shader — renders the living qi background
const WOOD_FRAG = `
float breath(float time) {
  float cycle = fract(time * 0.065);
  float b;
  if (cycle < 0.4) { b = cycle / 0.4; } else { b = 1.0 - (cycle - 0.4) / 0.6; }
  return b * b * (3.0 - 2.0 * b);
}
void main() {
  vec2 uv = gl_FragCoord.xy / res; float aspect = res.x / res.y;
  vec2 p = uv; p.x *= aspect;
  float time = t; float br = breath(time);
  float ny = uv.y;
  float groundT = (1.0 - ny); groundT = groundT * groundT;
  float upSpeed = 0.03 + br * 0.01;
  float weather = fbm(vec2(p.x * 1.5, p.y * 0.8 - time * upSpeed), 4);
  float grain = fbm(vec2(p.x * 4.0 + weather * 0.3, p.y * 1.5 - time * upSpeed * 2.0), 3);
  float fine = gnoise(gl_FragCoord.xy * 0.3 + time * 0.5) * 0.5;
  float fine2 = gnoise(gl_FragCoord.xy * 0.17 - time * 0.3) * 0.3;
  vec3 root = vec3(0.84, 0.85, 0.82); vec3 emerge = vec3(0.85, 0.87, 0.83);
  vec3 bark = vec3(0.86, 0.88, 0.84); vec3 shoot = vec3(0.88, 0.90, 0.86);
  vec3 bud = vec3(0.89, 0.90, 0.88); vec3 light = vec3(0.92, 0.92, 0.90);
  float bloom = fbm(vec2(p.x * 3.0 + time * 0.01, p.y * 2.0), 3) * 0.18;
  float bloom2 = fbm(vec2(p.x * 2.0 - time * 0.008, p.y * 1.5 + 5.0), 2) * 0.12;
  float eny = ny + bloom + bloom2;
  vec3 base = mix(root, emerge, smoothstep(0.0, 0.25, eny));
  base = mix(base, bark, smoothstep(0.15, 0.45, eny));
  base = mix(base, shoot, smoothstep(0.3, 0.7, eny));
  base = mix(base, bud, smoothstep(0.6, 0.88, eny));
  base = mix(base, light, smoothstep(0.85, 1.0, eny) * 0.5);
  float lx = 0.5 * aspect; float ly = 0.78 + br * 0.04;
  float ld = length(vec2(p.x - lx, (p.y - ly) * 0.7));
  float lightI = exp(-ld * 2.0) * (0.18 + br * 0.07);
  vec3 col = base;
  col += weather * vec3(-0.004, 0.012, -0.004) * (1.0 + groundT * 0.15);
  col += grain * vec3(0.012, 0.015, 0.006) * (0.5 + ny * 0.5);
  col += (fine + fine2) * (0.008 + groundT * 0.005) * vec3(0.9, 1.0, 0.7);
  col += lightI * vec3(0.08, 0.06, 0.03);
  col += br * vec3(0.005, 0.007, 0.003);
  col += (1.0 - br) * groundT * vec3(0.006, 0.003, -0.002);
  col = mix(col, vec3(0.78, 0.77, 0.80), smoothstep(0.15, 0.0, ny) * 0.08);
  float vein = gnoise(vec2(p.x * 2.0 + time * 0.01, p.y * 6.0 - time * 0.04));
  vein = smoothstep(0.3, 0.5, vein) * smoothstep(0.7, 0.5, vein);
  col += vein * vec3(0.03, 0.015, 0.02) * (0.3 + ny * 0.4) * (0.5 + br * 0.5);
  col = clamp(col, 0.0, 1.0);
  col += (hash12(gl_FragCoord.xy + fract(time * 100.0)) - 0.5) * 0.03;
  fragColor = vec4(col, 1.0);
}`;

// Glass ring shader — reads qi field texture, refracts through it
const GLASS_FRAG = `#version 300 es
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform sampler2D uQi;
uniform float uSpin;
uniform float uBreathAmt;
uniform vec3 uRimTint;
uniform float uBreathing;
uniform float uTalking;
uniform float uThinking;
uniform float uListening;
uniform float uSettling;
uniform float uSettlePhase;
uniform float uRingX;
uniform float uRingY;
uniform float uRingScale;
uniform float uDevRotX;
uniform float uDevRotY;
uniform float uDevRotZ;

out vec4 fragColor;

// Noise for register distortion
vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(443.897, 441.423, 437.195));
  p3 += dot(p3, p3.yzx + 19.19);
  return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0;
}
float gnoise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = dot(hash22(i), f);
  float b = dot(hash22(i + vec2(1,0)), f - vec2(1,0));
  float c = dot(hash22(i + vec2(0,1)), f - vec2(0,1));
  float d = dot(hash22(i + vec2(1,1)), f - vec2(1,1));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Register field distortion
vec2 registerDistortion(vec2 uv) {
  vec2 center = vec2(uRingX, uRingY);
  vec2 dir = uv - center;
  float dist = length(dir);
  vec2 normDir = dir / (dist + 0.0001);
  vec2 offset = vec2(0.0);

  // Breathing: membrane swell
  float breathPhase = sin(uTime * 0.45) * 0.5 + 0.5;
  float barrel = dist * dist * 0.18 * sin(uTime * 0.45);
  float rings = sin(dist * 8.0 - uTime * 0.6) * 0.04 * breathPhase;
  offset += normDir * (barrel + rings) * uBreathing;

  // Talking: pond ripples
  float pond1 = sin(dist * 5.0 - uTime * 0.8) * exp(-dist * 2.0) * 0.06;
  float pond2 = sin(dist * 3.5 - uTime * 0.55 + 1.5) * exp(-dist * 1.6) * 0.04;
  offset += normDir * (pond1 + pond2) * uTalking;

  // Thinking: slow inward spiral
  float spiralAngle = atan(dir.y, dir.x) + dist * 3.0 - uTime * 0.25;
  vec2 spiralDir = vec2(cos(spiralAngle), sin(spiralAngle));
  float inward = exp(-dist * 1.2) * 0.05;
  float spiral = sin(dist * 3.0 - uTime * 0.15) * exp(-dist * 0.9) * 0.035;
  offset += (normDir * inward + spiralDir * spiral) * uThinking;

  // Listening: singing bowl Chladni patterns
  float k1 = 5.0 + sin(uTime * 0.05) * 1.0;
  float k2 = 4.0 + cos(uTime * 0.04) * 0.8;
  float chladni = sin(uv.x * k1 + uTime * 0.3) * sin(uv.y * k2 - uTime * 0.2)
                + sin(uv.y * k1 * 0.7 + uTime * 0.18) * sin(uv.x * k2 * 0.85 + uTime * 0.15);
  chladni += sin((uv.x + uv.y) * (8.0 + sin(uTime * 0.08) * 0.8) + uTime * 0.1) * 0.5;
  float vib = sin(uTime * 1.2) * 0.15 + 0.85;
  offset += vec2(cos(chladni * 3.14159), sin(chladni * 3.14159)) * 0.06 * vib * uListening;

  // Settling: near-stillness
  float settleShimmer = gnoise(uv * 2.5 + uTime * 0.015) * 0.002;
  offset += vec2(settleShimmer, settleShimmer * 0.4) * uSettling;

  // Base liquid flow
  float flow1 = gnoise(uv * 3.0 + uTime * 0.12);
  float flow2 = gnoise(uv * 2.5 - uTime * 0.09 + 5.0);
  float activeAmount = uBreathing + uTalking + uThinking + uListening;
  offset += vec2(flow1, flow2) * 0.025 * (0.3 + activeAmount * 0.7);

  return offset;
}

// SDF
mat3 rotX(float a) { float c=cos(a),s=sin(a); return mat3(1,0,0,0,c,-s,0,s,c); }
mat3 rotY(float a) { float c=cos(a),s=sin(a); return mat3(c,0,s,0,1,0,-s,0,c); }
mat3 rotZ(float a) { float c=cos(a),s=sin(a); return mat3(c,-s,0,s,c,0,0,0,1); }

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float ringSDF(vec3 p) {
  float phase = uSpin;

  float waveA = sin(phase * 0.5) * sin(phase * 0.5);
  float waveB = sin(phase * 0.309) * sin(phase * 0.309);
  float waveC = sin(phase * 0.191) * sin(phase * 0.191);

  float tumbleX = sin(phase * 0.5)   * (3.14159 + waveB * 0.6 + waveC * 0.3);
  float tumbleY = sin(phase * 0.309) * (3.14159 + waveA * 0.6 + waveC * 0.4);
  float tumbleZ = sin(phase * 0.191) * (2.4 + waveA * waveB * 0.8);

  float restT = max(uBreathing, max(uTalking, uListening));
  float settleTumbleDamp = smoothstep(0.0, 0.4, uSettlePhase) * uSettling;
  float totalDamp = max(restT, settleTumbleDamp);
  tumbleX *= (1.0 - totalDamp);
  tumbleY *= (1.0 - totalDamp);
  tumbleZ *= (1.0 - totalDamp);

  float talkNod = sin(uTime * 3.2) * 0.10 * uTalking;
  float talkSway = sin(uTime * 2.1 + 0.7) * 0.05 * uTalking;

  float listenRock = sin(uTime * 1.4) * 0.04 * uListening;
  float listenTilt = cos(uTime * 1.1 + 0.5) * 0.03 * uListening;

  p = rotZ(tumbleZ + talkSway + listenTilt + uDevRotZ) * rotY(tumbleY + uDevRotY) * rotX(1.5708 + tumbleX + talkNod + listenRock + uDevRotX) * p;

  p /= uRingScale;

  float baseDisp = sin(p.x * 4.0 + uTime * 0.25) *
                   sin(p.z * 3.0 + uTime * 0.18) * 0.004;

  float breath = uBreathAmt;
  float breath2 = breath * breath;
  float breath3 = breath2 * breath;

  float tubeR = 0.078 + breath * 0.10;
  float majorR = 0.288 - breath2 * 0.015;

  // Flatten into a crepe — squash Y before SDF, scale back after
  float flatness = 3.5;
  p.y *= flatness;

  float majorAngle = atan(p.z, p.x);
  float radialDist = length(p.xz) - majorR;
  float tubeAngle = atan(p.y, radialDist);

  float innerFace = smoothstep(1.2, 2.5, abs(tubeAngle));
  float c1 = exp(-pow(sin(majorAngle * 1.5 + 0.4), 2.0) * 2.0);
  float c2 = exp(-pow(sin(majorAngle * 1.5 + 2.5), 2.0) * 2.5) * 0.7;
  float creasePinch = (c1 + c2) * innerFace * breath3 * 0.010;

  float outerFace = 1.0 - smoothstep(0.0, 1.4, abs(tubeAngle));
  float bulge = sin(majorAngle * 1.0 + 0.3) * 0.3 + sin(majorAngle * 2.7 - 0.5) * 0.2;
  float asymBulge = outerFace * bulge * breath2 * 0.012;

  float exhalePhase = max(0.0, -sin(uTime * 0.57));
  float wobble = sin(majorAngle * 3.0 + uTime * 4.0) * sin(tubeAngle * 2.0 + uTime * 3.0)
               * exhalePhase * (1.0 - breath) * 0.006;

  // Listening bowl vibration
  float bowlT = uTime * 0.8;
  float n1 = sin(majorAngle * 3.0 + bowlT) * cos(tubeAngle * 2.0 - bowlT * 0.7);
  float n2 = sin(majorAngle * 5.0 - bowlT * 0.6) * cos(tubeAngle * 3.0 + bowlT * 0.4);
  float n3 = sin(majorAngle * 2.0 + tubeAngle * 4.0 + bowlT * 0.3) * 0.5;
  float bowlDisp = (n1 + n2 * 0.6 + n3) * uListening * 0.008;

  return (sdTorus(p, vec2(majorR, tubeR)) / flatness + baseDisp + creasePinch + asymBulge + wobble + bowlDisp) * uRingScale;
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

  vec2 ringNDC = vec2((uRingX - 0.5) * 2.0 * (uRes.x / uRes.y), -(uRingY - 0.5) * 2.0);

  vec3 ro = vec3(ringNDC.x, ringNDC.y, 3.0);
  vec3 rd = normalize(vec3(ndc - ringNDC, -1.5));

  vec2 fieldOffset = registerDistortion(uv);
  vec2 bgUV = clamp(uv + fieldOffset, 0.0, 1.0);
  vec3 bg = texture(uQi, bgUV).rgb;

  // Field distortion glow
  float fMag = length(fieldOffset);
  bg += fMag * fMag * 15.0 * 15.0 * vec3(0.12, 0.11, 0.14);
  bg += fMag * 4.0 * vec3(0.06, 0.05, 0.08);
  bg = min(bg, vec3(0.93));

  vec3 hitPos;
  float closestDist;
  float t = march(ro, rd, hitPos, closestDist);

  // ── Orbiting backlight palette (computed for both hit and miss) ──
  float lightTime = uTime * 0.75;
  float PI2 = 6.28318;
  float activeEnergy = uTalking * 0.5 + uThinking * 0.3;
  float quietEnergy = uBreathing * 0.5 + uListening * 0.3 + uSettling * 0.4;

  // Compute backlight glow at this screen position
  // Use the closest approach point on the ray for light positions
  vec3 nearPoint = ro + rd * max(t > 0.0 ? t : 3.0, 0.5);
  // Seed accumulator like reference (bgColor * bgWeight)
  vec3 backlightSum = bg * 0.025;
  float backlightWeight = 0.025;

  for (int i = 0; i < 8; i++) {
    float fi = float(i);
    float n = fi / 8.0;
    float wave = sin(n * 3.14159 + lightTime) * 0.5 + 0.5;

    float orbitAngle = n * PI2 + lightTime * 0.1;
    float orbitR = 0.45 + wave * 0.1;
    vec3 lightPos = vec3(
      cos(orbitAngle) * orbitR,
      sin(lightTime * 0.3 + fi * 0.7) * 0.12,
      sin(orbitAngle) * orbitR
    );

    float distToLight = length(lightPos - nearPoint);
    // Soft cutoff — smoothstep instead of hard threshold
    float cutoff = smoothstep(0.05, 0.25, distToLight);
    float angle = atan(lightPos.y - nearPoint.y, lightPos.x - nearPoint.x) / PI2 + 0.5;
    angle += lightTime * 0.25;

    // Much softer decay — diffuse washes, not orbs
    float decayBase = mix(2.5, 5.0, wave);
    float decay = decayBase - quietEnergy * 1.0 + activeEnergy * 1.0;
    float distFactor = exp(-decay * distToLight) * cutoff;

    // Warm palette rooted in qi field — golds, ambers, soft rose
    // palD shifts the hue: warm base (0.0, 0.05, 0.15) keeps it gold/amber
    vec3 palA = bg * 0.6 + uRimTint * 0.3 + 0.1;
    vec3 palB = vec3(0.35, 0.30, 0.25);
    vec3 palC = vec3(1.0, 0.8, 0.6);
    vec3 palD = vec3(0.0, 0.05, 0.15);
    vec3 col = palA + palB * cos(PI2 * (palC * (distFactor + angle) + palD));

    backlightSum += col * distToLight * distFactor;
    backlightWeight += distFactor * distToLight;
  }

  vec3 backlight = backlightSum / max(backlightWeight, 0.001);
  backlight = pow(backlight, vec3(1.0 / 2.2));

  // ── Contact shadow (neumorphic) ──
  float breathScale = 1.0 + uBreathAmt * 1.5;
  float settleExhale = smoothstep(0.85, 1.0, uSettlePhase) * uSettling;
  float settleSpread = 1.0 + settleExhale * 3.0;
  float safeDist = max(closestDist, 0.012);
  float sharpness = 70.0 / (breathScale * breathScale * settleSpread);
  float prox = exp(-safeDist * safeDist * sharpness);
  float ringScaleFade = smoothstep(0.05, 0.3, uRingScale);

  vec3 field = bg;

  if (t > 0.0) {
    // ── HIT: Opaque neumorphic surface ──
    vec3 N = calcNormal(hitPos);
    vec3 V = normalize(ro - hitPos);
    float NdotV = max(dot(N, V), 0.0);
    float edge = 1.0 - NdotV;

    // Base color — slightly recessed to compensate for additive terms
    vec3 surface = bg - 0.008;

    // Neumorphic shading — shadow-dominant for light backgrounds
    vec3 lightDir = normalize(vec3(-0.5, 0.8, 0.6));
    float NdotL = dot(N, lightDir);

    // Light side: very subtle
    surface += smoothstep(0.0, 0.8, NdotL) * 0.012;

    // Shadow side: strong enough to read the form
    surface -= smoothstep(0.2, -0.5, NdotL) * 0.10;

    // Register depth
    float quietRegister = max(uBreathing, uSettling);
    float breathBoost = 1.0 + quietRegister * 0.6;
    surface -= smoothstep(0.0, -0.4, NdotL) * 0.03 * breathBoost;

    // Inner hole — deep recess
    float innerFace = smoothstep(0.25, 0.0, NdotV) * smoothstep(-0.1, -0.5, NdotL);
    surface -= innerFace * 0.12 * breathBoost;

    // ── Surface illumination from orbiting lights ──
    vec3 surfLight = vec3(0.0);
    float surfWeight = 0.0;
    for (int i = 0; i < 8; i++) {
      float fi = float(i);
      float n = fi / 8.0;
      float wave = sin(n * 3.14159 + lightTime) * 0.5 + 0.5;

      float orbitAngle = n * PI2 + lightTime * 0.1;
      float orbitR = 0.45 + wave * 0.1;
      vec3 lp = vec3(
        cos(orbitAngle) * orbitR,
        sin(lightTime * 0.3 + fi * 0.7) * 0.12,
        sin(orbitAngle) * orbitR
      );

      vec3 toL = lp - hitPos;
      float dist = length(toL);
      float cutoff2 = smoothstep(0.05, 0.25, dist);
      vec3 L = normalize(toL);

      float angle = atan(toL.y, toL.x) / PI2 + 0.5 + lightTime * 0.25;
      float decayBase = mix(2.5, 5.0, wave);
      float decay = decayBase - quietEnergy * 1.0 + activeEnergy * 1.0;
      float sf = exp(-decay * dist) * cutoff2;

      // Same warm palette as backlight
      vec3 palA = bg * 0.6 + uRimTint * 0.3 + 0.1;
      vec3 col = palA + vec3(0.35, 0.30, 0.25) * cos(PI2 * (vec3(1.0, 0.8, 0.6) * (sf + angle) + vec3(0.0, 0.05, 0.15)));

      // Match reference: color * dist * distFactor, weighted by NdotL
      float facing = max(dot(N, L), 0.0);
      surfLight += col * dist * sf * facing;
      surfWeight += sf * dist;
    }
    surfLight /= max(surfWeight, 0.001);

    // Tint surface multiplicatively — no brightness shift
    surface *= mix(vec3(1.0), surfLight * 2.0, 0.06);

    // Edge backlight bleed — colored light leaks around the rim
    float rimBleed = pow(edge, 3.0) * 0.5;
    surface = mix(surface, backlight, rimBleed);

    // Very thin bright rim where backlight catches the silhouette
    float thinRim = pow(edge, 6.0) * 0.3;
    surface += backlight * thinRim;

    // Settling: dissolve into field
    float settled = smoothstep(0.8, 1.0, uSettlePhase) * uSettling;
    surface = mix(surface, field, settled * 0.45);

    fragColor = vec4(surface, 1.0);
  } else {
    // ── MISS: Background with backlight halo behind the torus ──

    // Proximity glow — backlight visible near the silhouette
    float haloWidth = 0.04 * breathScale * settleSpread;
    float halo = exp(-safeDist * safeDist / (haloWidth * haloWidth)) * ringScaleFade;

    // Soft neumorphic shadow underneath
    float ringWebGLY = 1.0 - uRingY;
    float vertOffset = (ringWebGLY - uv.y);
    float dirWeight = 0.7 + 0.3 * smoothstep(-0.1, 0.15, vertOffset);
    float cShadowStrength = 0.05 + settleExhale * 0.03;
    float contactShadow = prox * dirWeight * cShadowStrength * ringScaleFade;

    vec3 result = field - contactShadow;

    // Add colored halo glow behind the shape
    result = mix(result, backlight, halo * 0.35);

    fragColor = vec4(result, 1.0);
  }
}
`;

// ─── Component ───

export default function QiTorusField({ register, ringX: propRingX, ringY: propRingY, ringScale: propRingScale, devRotX, devRotY, devRotZ }: QiTorusFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const rafRef = useRef<number>(0);
  const t0Ref = useRef<number>(0);
  const breathSmoothRef = useRef<number>(0);
  const spinRef = useRef<number>(0);
  const settlePhaseRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);

  const regWeightsRef = useRef({ breathing: 1, talking: 0, thinking: 0, listening: 0, settling: 0 });
  const regTargetsRef = useRef({ breathing: 1, talking: 0, thinking: 0, listening: 0, settling: 0 });
  const ringPropsRef = useRef({ x: propRingX ?? 0.5, y: propRingY ?? 0.25, scale: propRingScale ?? 0.8, devRotX: devRotX ?? 0, devRotY: devRotY ?? 0, devRotZ: devRotZ ?? 0 });

  // FBO refs
  const fboRef = useRef<{ fbo: WebGLFramebuffer; tex: WebGLTexture } | null>(null);

  // Program refs
  const woodProgRef = useRef<WebGLProgram | null>(null);
  const glassProgRef = useRef<WebGLProgram | null>(null);
  const woodLocsRef = useRef<Record<string, WebGLUniformLocation | null>>({});
  const glassLocsRef = useRef<Record<string, WebGLUniformLocation | null>>({});

  // Update register targets
  useEffect(() => {
    const tgt = regTargetsRef.current;
    for (const k in tgt) (tgt as Record<string, number>)[k] = 0;
    (tgt as Record<string, number>)[register] = 1;
  }, [register]);

  // Update ring props
  useEffect(() => {
    ringPropsRef.current.x = propRingX ?? 0.5;
    ringPropsRef.current.y = propRingY ?? 0.25;
    ringPropsRef.current.scale = propRingScale ?? 0.8;
    ringPropsRef.current.devRotX = devRotX ?? 0;
    ringPropsRef.current.devRotY = devRotY ?? 0;
    ringPropsRef.current.devRotZ = devRotZ ?? 0;
  }, [propRingX, propRingY, propRingScale, devRotX, devRotY, devRotZ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      // Rebuild FBO
      if (glRef.current) buildFBO(glRef.current, canvas.width, canvas.height);
    }

    const glCtx = canvas.getContext("webgl2", { antialias: false, alpha: false });
    if (!glCtx) return;
    const gl = glCtx;
    glRef.current = gl;

    // Full-screen quad
    const quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const quadVAO = gl.createVertexArray();
    gl.bindVertexArray(quadVAO);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    function drawQuad() {
      gl.bindVertexArray(quadVAO);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    // Compile shaders
    const woodProg = makeProgram(gl, VERT, GLSL_NOISE + WOOD_FRAG);
    if (!woodProg) { console.error("Wood shader failed"); return; }
    woodProgRef.current = woodProg;

    const glassProg = makeProgram(gl, VERT, GLASS_FRAG);
    if (!glassProg) { console.error("Glass shader failed"); return; }
    glassProgRef.current = glassProg;

    // Get uniform locations
    woodLocsRef.current = {
      t: gl.getUniformLocation(woodProg, "t"),
      res: gl.getUniformLocation(woodProg, "res"),
    };

    glassLocsRef.current = {
      uRes: gl.getUniformLocation(glassProg, "uRes"),
      uTime: gl.getUniformLocation(glassProg, "uTime"),
      uQi: gl.getUniformLocation(glassProg, "uQi"),
      uSpin: gl.getUniformLocation(glassProg, "uSpin"),
      uBreathAmt: gl.getUniformLocation(glassProg, "uBreathAmt"),
      uRimTint: gl.getUniformLocation(glassProg, "uRimTint"),
      uBreathing: gl.getUniformLocation(glassProg, "uBreathing"),
      uTalking: gl.getUniformLocation(glassProg, "uTalking"),
      uThinking: gl.getUniformLocation(glassProg, "uThinking"),
      uListening: gl.getUniformLocation(glassProg, "uListening"),
      uSettling: gl.getUniformLocation(glassProg, "uSettling"),
      uSettlePhase: gl.getUniformLocation(glassProg, "uSettlePhase"),
      uRingX: gl.getUniformLocation(glassProg, "uRingX"),
      uRingY: gl.getUniformLocation(glassProg, "uRingY"),
      uRingScale: gl.getUniformLocation(glassProg, "uRingScale"),
      uDevRotX: gl.getUniformLocation(glassProg, "uDevRotX"),
      uDevRotY: gl.getUniformLocation(glassProg, "uDevRotY"),
      uDevRotZ: gl.getUniformLocation(glassProg, "uDevRotZ"),
    };

    function buildFBO(gl: WebGL2RenderingContext, w: number, h: number) {
      // Clean up old
      if (fboRef.current) {
        gl.deleteTexture(fboRef.current.tex);
        gl.deleteFramebuffer(fboRef.current.fbo);
      }

      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      const fbo = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      fboRef.current = { fbo, tex };
    }

    resize();
    window.addEventListener("resize", resize);

    t0Ref.current = performance.now();
    lastFrameRef.current = performance.now();

    // Wood rim tint
    const rimR = 0.82, rimG = 0.88, rimB = 0.72;
    // Ring position read from ref in frame loop (see ringPropsRef)

    function frame(now: number) {
      if (!glRef.current || !woodProgRef.current || !glassProgRef.current || !fboRef.current || !canvas) return;
      const gl = glRef.current;
      const w = canvas.width, h = canvas.height;
      const time = (now - t0Ref.current) * 0.001;
      const realDt = Math.min((now - lastFrameRef.current) * 0.001, 0.1);
      lastFrameRef.current = now;

      // Lerp register weights
      const weights = regWeightsRef.current;
      const targets = regTargetsRef.current;
      const regRate = 1 - Math.pow(0.04, realDt * 60);
      for (const k in weights) {
        (weights as Record<string, number>)[k] +=
          ((targets as Record<string, number>)[k] - (weights as Record<string, number>)[k]) * regRate;
      }

      // Spin accumulates when thinking
      spinRef.current += weights.thinking * 0.012;

      // Settling choreography
      if (weights.settling > 0.01) {
        settlePhaseRef.current = Math.min(settlePhaseRef.current + realDt * 0.4, 1.0);
      } else {
        settlePhaseRef.current = Math.max(0, settlePhaseRef.current - realDt * 0.8);
      }

      // Breath
      const rawBreath = breathCycle(time) * weights.breathing;
      breathSmoothRef.current += (rawBreath - breathSmoothRef.current) * 0.06;

      // Register-aware time scaling for field
      const timeScale = 1.0
        - weights.breathing * 0.15
        + weights.talking * 0.25
        - weights.listening * 0.1
        - weights.settling * 0.5;
      const tScaled = time * Math.max(0.2, timeScale);

      // ── Pass 1: Wood field → FBO ──
      gl.bindFramebuffer(gl.FRAMEBUFFER, fboRef.current.fbo);
      gl.viewport(0, 0, w, h);
      gl.useProgram(woodProgRef.current);
      gl.uniform1f(woodLocsRef.current.t!, tScaled);
      gl.uniform2f(woodLocsRef.current.res!, w, h);
      drawQuad();

      // ── Pass 2: Glass ring + field distortion → screen ──
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, w, h);
      gl.useProgram(glassProgRef.current);

      const locs = glassLocsRef.current;
      gl.uniform2f(locs.uRes!, w, h);
      gl.uniform1f(locs.uTime!, time);
      gl.uniform1f(locs.uSpin!, spinRef.current);
      gl.uniform1f(locs.uBreathAmt!, breathSmoothRef.current);
      gl.uniform1f(locs.uBreathing!, weights.breathing);
      gl.uniform1f(locs.uTalking!, weights.talking);
      gl.uniform1f(locs.uThinking!, weights.thinking);
      gl.uniform1f(locs.uListening!, weights.listening);
      gl.uniform1f(locs.uSettling!, weights.settling);
      gl.uniform1f(locs.uSettlePhase!, settlePhaseRef.current);
      gl.uniform1f(locs.uRingX!, ringPropsRef.current.x);
      gl.uniform1f(locs.uRingY!, ringPropsRef.current.y);
      gl.uniform1f(locs.uRingScale!, ringPropsRef.current.scale);
      gl.uniform3f(locs.uRimTint!, rimR, rimG, rimB);
      gl.uniform1f(locs.uDevRotX!, ringPropsRef.current.devRotX ?? 0);
      gl.uniform1f(locs.uDevRotY!, ringPropsRef.current.devRotY ?? 0);
      gl.uniform1f(locs.uDevRotZ!, ringPropsRef.current.devRotZ ?? 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fboRef.current.tex);
      gl.uniform1i(locs.uQi!, 0);
      drawQuad();

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      if (fboRef.current) {
        gl.deleteTexture(fboRef.current.tex);
        gl.deleteFramebuffer(fboRef.current.fbo);
      }
      gl.deleteProgram(woodProg);
      gl.deleteProgram(glassProg);
      gl.deleteBuffer(quadBuf);
      gl.deleteVertexArray(quadVAO);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[1]"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
