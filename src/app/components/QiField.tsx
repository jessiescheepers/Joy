"use client";

import { useEffect, useRef, useCallback } from "react";

type Register = "breathing" | "listening" | "thinking" | "talking" | "settling";

interface QiFieldProps {
  register: Register;
}

// Register-specific parameters for the grain canvas
const REGISTER_PARAMS: Record<Register, {
  speed: number;      // noise drift speed (px/frame)
  scale: number;      // noise frequency multiplier
  alpha: number;      // max grain alpha
  breathRate: number;  // ms per CSS wash breath cycle
}> = {
  breathing: { speed: 0.15, scale: 1.6, alpha: 0.055, breathRate: 8000 },
  listening: { speed: 0.08, scale: 1.2, alpha: 0.06, breathRate: 10000 },
  thinking:  { speed: 0.25, scale: 0.8, alpha: 0.07, breathRate: 6000 },
  talking:   { speed: 0.40, scale: 1.0, alpha: 0.065, breathRate: 4000 },
  settling:  { speed: 0.05, scale: 1.4, alpha: 0.045, breathRate: 12000 },
};

// Wood element wash gradients per register — CSS transitions handle the crossfade
const WASH_STYLES: Record<Register, React.CSSProperties> = {
  breathing: {
    background: `
      radial-gradient(ellipse 55% 45% at 30% 25%, rgba(140,165,130,0.18) 0%, transparent 65%),
      radial-gradient(ellipse 50% 40% at 70% 70%, rgba(180,165,110,0.12) 0%, transparent 55%),
      radial-gradient(ellipse 65% 55% at 50% 50%, rgba(95,120,85,0.08) 0%, transparent 70%)
    `,
  },
  listening: {
    background: `
      radial-gradient(ellipse 50% 40% at 40% 30%, rgba(140,165,130,0.22) 0%, transparent 55%),
      radial-gradient(ellipse 45% 35% at 65% 65%, rgba(130,150,125,0.14) 0%, transparent 50%),
      radial-gradient(ellipse 60% 50% at 50% 50%, rgba(95,120,85,0.10) 0%, transparent 65%)
    `,
  },
  thinking: {
    background: `
      radial-gradient(ellipse 45% 40% at 35% 40%, rgba(140,165,130,0.16) 0%, transparent 55%),
      radial-gradient(ellipse 55% 45% at 60% 55%, rgba(180,165,110,0.14) 0%, transparent 55%),
      radial-gradient(ellipse 60% 50% at 50% 50%, rgba(68,88,72,0.10) 0%, transparent 60%)
    `,
  },
  talking: {
    background: `
      radial-gradient(ellipse 60% 50% at 45% 35%, rgba(180,165,110,0.20) 0%, transparent 60%),
      radial-gradient(ellipse 50% 42% at 55% 60%, rgba(140,165,130,0.16) 0%, transparent 52%),
      radial-gradient(ellipse 65% 55% at 50% 50%, rgba(125,142,115,0.08) 0%, transparent 65%)
    `,
  },
  settling: {
    background: `
      radial-gradient(ellipse 55% 45% at 50% 55%, rgba(130,150,125,0.24) 0%, transparent 55%),
      radial-gradient(ellipse 48% 38% at 40% 40%, rgba(95,120,85,0.14) 0%, transparent 50%),
      radial-gradient(ellipse 62% 52% at 50% 50%, rgba(68,88,72,0.08) 0%, transparent 62%)
    `,
  },
};

// Simple seeded hash for deterministic noise
function hash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  return (h & 0x7fffffff) / 0x7fffffff;
}

// Value noise with bilinear interpolation
function valueNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  // Smoothstep
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);

  const n00 = hash(ix, iy);
  const n10 = hash(ix + 1, iy);
  const n01 = hash(ix, iy + 1);
  const n11 = hash(ix + 1, iy + 1);

  const nx0 = n00 + sx * (n10 - n00);
  const nx1 = n01 + sx * (n11 - n01);
  return nx0 + sy * (nx1 - nx0);
}

// 3-octave FBM for organic grain
function fbm(x: number, y: number): number {
  return valueNoise(x, y) * 0.5 + valueNoise(x * 2.1, y * 2.1) * 0.33 + valueNoise(x * 4.7, y * 4.7) * 0.17;
}

export default function QiField({ register }: QiFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const wallTimeRef = useRef<number>(0);
  const targetRef = useRef(REGISTER_PARAMS.breathing);
  const currentRef = useRef({ ...REGISTER_PARAMS.breathing });
  const breathRateRef = useRef(REGISTER_PARAMS.breathing.breathRate);
  const prefersReducedMotion = useRef(false);
  const isMobileRef = useRef(false);

  // Update target params when register changes
  useEffect(() => {
    targetRef.current = REGISTER_PARAMS[register];
  }, [register]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion.current) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = isMobileRef.current ? 0.25 : 0.5;
    const w = Math.floor(window.innerWidth * dpr);
    const h = Math.floor(window.innerHeight * dpr);

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    // Lerp current params toward target
    const cur = currentRef.current;
    const tgt = targetRef.current;
    const lerpRate = 0.02;
    cur.speed += (tgt.speed - cur.speed) * lerpRate;
    cur.scale += (tgt.scale - cur.scale) * lerpRate;
    cur.alpha += (tgt.alpha - cur.alpha) * lerpRate;
    breathRateRef.current += (tgt.breathRate - breathRateRef.current) * lerpRate;

    timeRef.current += cur.speed;
    const t = timeRef.current;
    wallTimeRef.current = performance.now();

    // Breath modulation — alpha swells and recedes on the breath cycle
    const breathPhase = (wallTimeRef.current % breathRateRef.current) / breathRateRef.current;
    const breathWave = Math.sin(breathPhase * Math.PI * 2);
    // Smoothstep the wave so it lingers at peaks — 30% modulation depth
    const breathMod = 1.0 + breathWave * 0.15;

    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    const noiseScale = 0.032 * cur.scale;
    const maxAlpha = cur.alpha * breathMod * 255;

    // Wood element colors: sage, gold, green
    const colors = [
      [68, 88, 72],     // mote core — dark sage
      [85, 105, 82],    // mote second — mid sage
      [125, 142, 115],  // mote glow — bright sage
      [140, 130, 90],   // gold accent
    ];

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const nx = x * noiseScale + t * 0.01;
        const ny = y * noiseScale + t * 0.007;
        const n = fbm(nx, ny);

        // Pick color based on noise value
        const ci = Math.floor(n * colors.length) % colors.length;
        const c = colors[ci];
        const alpha = n * maxAlpha;

        const idx = (y * w + x) * 4;
        data[idx] = c[0];
        data[idx + 1] = c[1];
        data[idx + 2] = c[2];
        data[idx + 3] = alpha;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Mobile: throttle to ~20fps
    if (isMobileRef.current) {
      setTimeout(() => {
        rafRef.current = requestAnimationFrame(animate);
      }, 50);
    } else {
      rafRef.current = requestAnimationFrame(animate);
    }
  }, []);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    isMobileRef.current = window.matchMedia("(max-width: 768px)").matches;

    if (!prefersReducedMotion.current) {
      rafRef.current = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  return (
    <>
      {/* CSS wash layer — transitions between register states, breathes with field */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          ...WASH_STYLES[register],
          transition: "background 1.8s cubic-bezier(0.4, 0, 0.2, 1)",
          animation: `qi-breathe ${REGISTER_PARAMS[register].breathRate}ms ease-in-out infinite`,
        }}
      />

      {/* Canvas grain layer — animated noise texture */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[2] pointer-events-none"
        style={{
          width: "100vw",
          height: "100vh",
          imageRendering: "auto",
          opacity: 1,
        }}
      />
    </>
  );
}
