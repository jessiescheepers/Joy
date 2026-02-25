"use client";

import { useEffect, useRef, useCallback } from "react";

interface OrbSystemProps {
  glowExpanded: boolean;
}

/**
 * Full orb animation stack — identical to the hero orb.
 * 5 layers: warm glow, heart, drift, breathe, rotate + masked image.
 * Slight timing offsets per instance keep them organic, not synced.
 */
function FullOrb({ src, offset = 0 }: { src: string; offset?: number }) {
  const glowDur = 5 + offset * 0.4;
  const heartDur = 5 + offset * 0.3;
  const driftDur = 10 + offset * 1.2;
  const breatheDur = 5 + offset * 0.35;
  const rotateDur = 90 + offset * 15;
  const dir = offset % 2 === 0 ? "" : " reverse";

  return (
    <>
      {/* Warm glow — bleeds beyond orb edges */}
      <div
        className="absolute"
        style={{
          inset: "-35%",
          background:
            "radial-gradient(circle, rgba(212,165,116,0.35) 0%, rgba(212,165,116,0.12) 45%, transparent 70%)",
          filter: "blur(60px)",
          animation: `hero-orb-glow-swell ${glowDur}s ease-in-out infinite`,
        }}
      />
      {/* Heart — bright inner light */}
      <div
        className="absolute"
        style={{
          inset: "0%",
          background:
            "radial-gradient(circle at 50% 40%, rgba(224,140,120,1) 0%, rgba(200,110,90,0.5) 35%, transparent 70%)",
          filter: "blur(40px) brightness(1.4)",
          animation: `hero-orb-heart ${heartDur}s ease-in-out infinite`,
          mixBlendMode: "screen",
        }}
      />
      {/* Drift → Breathe → Rotate → Image */}
      <div style={{ width: "100%", height: "100%", animation: `hero-orb-drift ${driftDur}s ease-in-out infinite` }}>
        <div style={{ width: "100%", height: "100%", animation: `hero-orb-breathe ${breatheDur}s ease-in-out infinite` }}>
          <div style={{ width: "100%", height: "100%", animation: `hero-orb-rotate ${rotateDur}s ease-in-out infinite${dir}` }}>
            <img
              src={src}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                opacity: 0.85,
                mixBlendMode: "screen",
                WebkitMaskImage: "radial-gradient(circle, black 30%, transparent 70%)",
                maskImage: "radial-gradient(circle, black 30%, transparent 70%)",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default function OrbSystem({ glowExpanded }: OrbSystemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<{ revert: () => void } | null>(null);

  const initGSAP = useCallback(async () => {
    const gsapModule = await import("gsap");
    const gsap = gsapModule.default;
    const { ScrollTrigger } = await import("gsap/ScrollTrigger");
    const { MotionPathPlugin } = await import("gsap/MotionPathPlugin");
    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

    // No scope element — triggers must find section IDs in the page DOM
    const ctx = gsap.context(() => {
      const primary = primaryRef.current;
      if (!primary) return;

      const vh = window.innerHeight;
      const vw = window.innerWidth;

      // Shared orb geometry — used by multiple timelines
      const orbSize = Math.min(vh, 1.2 * vw);
      const orbCSSCenterY = 1.1 * vh - orbSize / 2;
      const cardOrbMatchScale = 340 / orbSize;
      const visionEndScale = Math.min(cardOrbMatchScale * 2.77, 1.2);

      // Helper: no-op (post-vision orbs removed — rebuild individually)
      const hideSecondary = () => {};

      // ═══════════════════════════════════════════════════════════════
      // HERO → BRIDGE → VISION — one continuous scrub timeline
      // ═══════════════════════════════════════════════════════════════

      // Compute bridge text centre Y
      const bridgeTextEl = document.querySelector("#bridge p");
      const heroEl = document.querySelector("#hero") as HTMLElement | null;
      const heroH = heroEl?.offsetHeight || vh;
      let targetY = -vh * 0.43; // fallback
      if (bridgeTextEl) {
        const textRect = bridgeTextEl.getBoundingClientRect();
        const textCenterDoc = textRect.top + window.scrollY + textRect.height / 2;
        const textCenterVP = textCenterDoc - heroH;
        targetY = textCenterVP - vh * 0.6;
      }

      // Bridge scale — noticeably smaller, grows back in mission
      const bridgeScale = 0.5;

      // ═══ HERO — orb stays full size, no animation ═══
      gsap.set(primary, { x: 0, y: 0, scale: 1, opacity: 1, filter: "none", rotation: 0 });

      // ═══ BRIDGE → VISION — shrink, swirl, grow ═══
      const bridgeVisionTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#bridge",
          start: "top 80%",
          endTrigger: "#vision",
          end: "top 30%",
          scrub: 0.6,
        },
      });

      // 0.00→0.35: Bridge — orb shrinks + swirls
      bridgeVisionTl.to(primary, {
        y: 0, scale: bridgeScale,
        opacity: 1, filter: "none", rotation: 60,
        duration: 0.35, ease: "none",
      }, 0);

      // 0.35→0.55: Bridge hold — continues swirl at small size
      bridgeVisionTl.to(primary, {
        y: 0, scale: bridgeScale,
        opacity: 1, filter: "none", rotation: 150,
        duration: 0.20, ease: "none",
      });

      // 0.55→1.0: Vision — orb grows to visionEndScale, continues swirl
      bridgeVisionTl.to(primary, {
        y: 0, scale: bridgeScale + (visionEndScale - bridgeScale) * 0.5,
        opacity: 1, filter: "none", rotation: 220,
        duration: 0.22, ease: "none",
      });
      bridgeVisionTl.to(primary, {
        y: 0, scale: visionEndScale,
        opacity: 1, filter: "none", rotation: 270,
        duration: 0.23, ease: "power1.out",
      });

      // ═══ VISION WANDER — sweeping leftward arc through vision text ═══
      // Wide counterclockwise sweep: from vision section, the orb curves
      // LEFT (clear of centred copy), sweeps down along the left edge,
      // then curves back RIGHT to hand off at stat-scale so the stats
      // interaction begins seamlessly — no size jump.
      // Early stat measurements so visionWanderTl lands at the right size + position
      const earlyStatItems = document.querySelectorAll<HTMLElement>(".stat-item");
      const earlyStatFontEl = earlyStatItems[0]?.querySelector("p") as HTMLElement | null;
      const earlyFontSize = earlyStatFontEl
        ? parseFloat(getComputedStyle(earlyStatFontEl).fontSize) : 40;
      const wanderTargetScale = (earlyFontSize * 0.5) / (orbSize * 0.3);
      // Stat 1 (82%) GSAP x offset — so the sweep lands directly above it
      const stat1VX = earlyStatItems[0]
        ? earlyStatItems[0].getBoundingClientRect().left
          + earlyStatItems[0].getBoundingClientRect().width / 2
        : vw * 0.25;
      const stat1GsapX = stat1VX - vw / 2;

      const visionH2 = document.querySelector("#vision h2") as HTMLElement | null;
      if (visionH2) {
        const dustEndScale = visionEndScale * 0.5;
        const dustDriftY = vh * 0.25;

        const visionWanderTl = gsap.timeline({
          scrollTrigger: {
            trigger: visionH2,
            start: "top 15%",
            endTrigger: "#sort-stats",
            end: "top 80%",
            scrub: 0.8,
          },
        });

        // Two joined cubic Béziers for a natural, unstudied arc.
        // Coordinates are raw GSAP offsets (relative to orb's CSS centre).
        const vBez = (
          t: number,
          p0: { x: number; y: number },
          p1: { x: number; y: number },
          p2: { x: number; y: number },
          p3: { x: number; y: number },
        ) => {
          const u = 1 - t;
          return {
            x: u*u*u*p0.x + 3*u*u*t*p1.x + 3*u*t*t*p2.x + t*t*t*p3.x,
            y: u*u*u*p0.y + 3*u*u*t*p1.y + 3*u*t*t*p2.y + t*t*t*p3.y,
          };
        };

        // Start & end in raw GSAP offsets — end lands above stat 1 (82%)
        // so sortWanderTl approach continues seamlessly from there
        const wStart = { x: 0, y: 0 };
        const wEnd   = { x: stat1GsapX, y: dustDriftY };

        // Left apex: furthest left, well clear of centred text
        const leftX = -vw * 0.42;
        const leftY = dustDriftY * 0.40;

        // Phase A: start → left apex (curve left, slightly up at first)
        const wa0 = wStart;
        const wa1 = { x: -vw * 0.12, y: -vh * 0.05 };
        const wa2 = { x: leftX + vw * 0.02, y: leftY * 0.25 };
        const wa3 = { x: leftX, y: leftY };

        // Phase B: left apex → end (sweep down along left edge, curve right)
        const wb0 = wa3;
        const wb1 = { x: leftX + vw * 0.03, y: dustDriftY * 0.80 };
        const wb2 = { x: wEnd.x - vw * 0.06, y: dustDriftY * 1.08 };
        const wb3 = wEnd;

        // 12 waypoints with geometric scale interpolation
        const wStepsPerSeg = 6;
        const totalWSteps = wStepsPerSeg * 2;
        for (let i = 1; i <= totalWSteps; i++) {
          const pt = i <= wStepsPerSeg
            ? vBez(i / wStepsPerSeg, wa0, wa1, wa2, wa3)
            : vBez((i - wStepsPerSeg) / wStepsPerSeg, wb0, wb1, wb2, wb3);
          const t = i / totalWSteps;
          // Geometric scale: shrinks all the way to stat size for seamless handoff
          const sc = visionEndScale * Math.pow(wanderTargetScale / visionEndScale, t);
          visionWanderTl.to(primary, {
            x: pt.x, y: pt.y,
            scale: sc, filter: "none",
            duration: 1 / totalWSteps,
            ease: i === totalWSteps ? "power1.out" : "none",
          });
        }
      }

      // ═══ VISION-TO-SORT — orb shrinks, wanders through stats, lands under CTA ═══
      // Continuous from mainTl end state (visionEndScale, y:0, opacity:1).
      // Full brightness throughout — matches hero orb heart.
      const statEls = document.querySelectorAll<HTMLElement>(".stat-item");
      const launchEl = document.querySelector("#sort-solution .text-gradient-warm") as HTMLElement | null;
      const sortSection = document.querySelector("#sort") as HTMLElement | null;

      if (statEls.length === 3 && sortSection) {
        const scrollY0 = window.scrollY;

        // Stat document positions (center X, top Y of stat container)
        const statDocs = Array.from(statEls).map(el => {
          const r = el.getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + scrollY0 };
        });

        // "Launching 2026" position — orb lands just below this text
        let launchDoc = { x: vw / 2, y: 0 };
        if (launchEl) {
          const r = launchEl.getBoundingClientRect();
          launchDoc = { x: r.left + r.width / 2, y: r.top + r.height + scrollY0 + 30 };
        }

        // Target orb scale: half the stat letter height
        // Visible core ≈ 30% radius of element (mask). We want core diameter ≈ fontSize/2.
        const statFontEl = statEls[0]?.querySelector("p");
        const statFontSize = statFontEl
          ? parseFloat(getComputedStyle(statFontEl).fontSize)
          : 40;
        const statScale = (statFontSize * 0.5) / (orbSize * 0.3);

        // Hover gap: orb center this far above the stat top
        const hoverGap = statFontSize * 0.8;

        // Detect layout: vertical (mobile) vs horizontal (desktop)
        const isVerticalLayout = Math.abs(statDocs[2].y - statDocs[0].y) > Math.abs(statDocs[2].x - statDocs[0].x);
        const statRects = Array.from(statEls).map(el => el.getBoundingClientRect());
        const statOrbY = (i: number) => isVerticalLayout
          ? statDocs[i].y + statRects[i].height / 2
          : statDocs[i].y - hoverGap;
        const drift = isVerticalLayout ? 0 : 10;

        // Scroll range matching ScrollTrigger
        const statsEl = document.querySelector("#sort-stats") as HTMLElement;
        const statsRect = statsEl ? statsEl.getBoundingClientRect() : sortSection.getBoundingClientRect();
        const statsDocTop = statsRect.top + scrollY0;
        const statsDocBot = statsDocTop + statsRect.height;
        const sStart = statsDocTop - vh * 0.80;
        const sEnd = statsDocTop;
        const sRange = sEnd - sStart;

        // Helper: GSAP x/y offsets to place orb center at (docX, docY) at progress p
        const xy = (docX: number, docY: number, p: number) => ({
          x: docX - vw / 2,
          y: (docY - (sStart + p * sRange)) - orbCSSCenterY,
        });

        // Phase allocations (progress 0→1):
        //  0.00→0.10  Settle at stat 1 from visionWanderTl handoff
        //  0.10→0.20  Hover stat 1
        //  0.20→0.32  Bézier arc to stat 2 (6 waypoints)
        //  0.32→0.42  Hover stat 2
        //  0.42→0.54  Bézier arc to stat 3 (6 waypoints)
        //  0.54→0.62  Hover stat 3
        //  0.62→1.00  Exit arc to "Launching 2026"

        const sortWanderTl = gsap.timeline({
          scrollTrigger: {
            trigger: "#sort-stats",
            start: "top 80%",
            end: "top top",
            scrub: 0.8,
          },
        });

        // ═══ Settle at stat 1 — smooth handoff from visionWanderTl ═══
        const s1x = statDocs[0].x;
        const visionEndY = vh * 0.25; // dustDriftY from visionWanderTl
        // Convert vision end position to document coordinates so we can
        // express it in the same scroll-relative xy() system as everything
        // else — eliminates the coordinate-system mismatch that caused jumps.
        const visionEndDocY = orbCSSCenterY + visionEndY + sStart;

        // Set starting position (matches visionWanderTl end exactly)
        sortWanderTl.set(primary, {
          ...xy(s1x, visionEndDocY, 0),
          scale: wanderTargetScale, filter: "none",
          immediateRender: false,
        }, 0);

        // Smooth settle to stat 1 hover position
        sortWanderTl.to(primary, {
          ...xy(s1x, statOrbY(0), 0.10),
          scale: statScale, filter: "none",
          duration: 0.10, ease: "power1.out",
        });

        // ═══ Stats flow — smooth Bézier arcs between stats ═══
        // Desktop: scalloped arcs (orb lifts UP between horizontal stats)
        // Mobile: serpentine arcs (orb swings LEFT/RIGHT between stacked stats)

        // Cubic Bézier evaluator — shared by stat arcs and exit arc
        const cBez = (
          t: number,
          p0: { x: number; y: number },
          p1: { x: number; y: number },
          p2: { x: number; y: number },
          p3: { x: number; y: number },
        ) => {
          const u = 1 - t;
          return {
            x: u*u*u*p0.x + 3*u*u*t*p1.x + 3*u*t*t*p2.x + t*t*t*p3.x,
            y: u*u*u*p0.y + 3*u*u*t*p1.y + 3*u*t*t*p2.y + t*t*t*p3.y,
          };
        };

        const arcSteps = 6; // waypoints per stat-to-stat arc

        // Phase allocations — arcs get generous room to breathe
        const P_HOVER1_END = 0.20;
        const P_ARC12_END  = 0.32;
        const P_HOVER2_END = 0.42;
        const P_ARC23_END  = 0.54;
        const P_HOVER3_END = 0.62;

        // Stat 1 (0.10→0.20): Hover with subtle drift
        sortWanderTl.to(primary, {
          ...xy(statDocs[0].x + drift, statOrbY(0), P_HOVER1_END),
          scale: statScale, filter: "none",
          duration: P_HOVER1_END - 0.10, ease: "none",
        });

        // Arc 1→2 (0.20→0.32): Smooth Bézier, 6 waypoints
        {
          const s = { x: statDocs[0].x + drift, y: statOrbY(0) };
          const e = { x: statDocs[1].x, y: statOrbY(1) };
          let c1: { x: number; y: number }, c2: { x: number; y: number };
          if (isVerticalLayout) {
            const swing = vw * 0.15;
            c1 = { x: s.x + swing, y: s.y + (e.y - s.y) * 0.33 };
            c2 = { x: e.x + swing * 0.6, y: s.y + (e.y - s.y) * 0.67 };
          } else {
            const lift = hoverGap * 2.5;
            c1 = { x: s.x + (e.x - s.x) * 0.33, y: Math.min(s.y, e.y) - lift };
            c2 = { x: s.x + (e.x - s.x) * 0.67, y: Math.min(s.y, e.y) - lift };
          }
          const arcDur = P_ARC12_END - P_HOVER1_END;
          for (let i = 1; i <= arcSteps; i++) {
            const t = i / arcSteps;
            const pt = cBez(t, s, c1, c2, e);
            const p = P_HOVER1_END + arcDur * t;
            sortWanderTl.to(primary, {
              ...xy(pt.x, pt.y, p), scale: statScale, filter: "none",
              duration: arcDur / arcSteps, ease: "none",
            });
          }
        }

        // Stat 2 (0.32→0.42): Hover with subtle drift
        sortWanderTl.to(primary, {
          ...xy(statDocs[1].x + drift, statOrbY(1), P_HOVER2_END),
          scale: statScale, filter: "none",
          duration: P_HOVER2_END - P_ARC12_END, ease: "none",
        });

        // Arc 2→3 (0.42→0.54): Smooth Bézier, 6 waypoints
        {
          const s = { x: statDocs[1].x + drift, y: statOrbY(1) };
          const e = { x: statDocs[2].x, y: statOrbY(2) };
          let c1: { x: number; y: number }, c2: { x: number; y: number };
          if (isVerticalLayout) {
            const swing = vw * 0.15;
            c1 = { x: s.x - swing, y: s.y + (e.y - s.y) * 0.33 };
            c2 = { x: e.x - swing * 0.6, y: s.y + (e.y - s.y) * 0.67 };
          } else {
            const lift = hoverGap * 2.5;
            c1 = { x: s.x + (e.x - s.x) * 0.33, y: Math.min(s.y, e.y) - lift };
            c2 = { x: s.x + (e.x - s.x) * 0.67, y: Math.min(s.y, e.y) - lift };
          }
          const arcDur = P_ARC23_END - P_HOVER2_END;
          for (let i = 1; i <= arcSteps; i++) {
            const t = i / arcSteps;
            const pt = cBez(t, s, c1, c2, e);
            const p = P_HOVER2_END + arcDur * t;
            sortWanderTl.to(primary, {
              ...xy(pt.x, pt.y, p), scale: statScale, filter: "none",
              duration: arcDur / arcSteps, ease: "none",
            });
          }
        }

        // Stat 3 (0.54→0.62): Hover with subtle drift
        sortWanderTl.to(primary, {
          ...xy(statDocs[2].x + drift, statOrbY(2), P_HOVER3_END),
          scale: statScale, filter: "none",
          duration: P_HOVER3_END - P_ARC23_END, ease: "none",
        });

        // ═══ Exit arc — wide clockwise sweep from stat 3 to "Launching 2026" ═══
        const exitStart = { x: statDocs[2].x + drift, y: statOrbY(2) };
        const exitEnd   = { x: launchDoc.x, y: launchDoc.y };

        const apexX = Math.min(vw * 0.92, vw - 40);
        const apexY = exitStart.y + (exitEnd.y - exitStart.y) * 0.32;

        const a0 = exitStart;
        const a1 = { x: exitStart.x + vw * 0.14, y: exitStart.y - hoverGap * 3 };
        const a2 = { x: apexX + 8, y: apexY - (exitEnd.y - exitStart.y) * 0.15 };
        const a3 = { x: apexX, y: apexY };

        const b0 = a3;
        const b1 = { x: apexX - vw * 0.05, y: exitEnd.y + vh * 0.14 };
        const b2 = { x: exitEnd.x + vw * 0.10, y: exitEnd.y + vh * 0.19 };
        const b3 = exitEnd;

        const exitDur = 1 - P_HOVER3_END;
        const stepsPerSeg = 7;
        const totalArcSteps = stepsPerSeg * 2;
        for (let i = 1; i <= totalArcSteps; i++) {
          const pt = i <= stepsPerSeg
            ? cBez(i / stepsPerSeg, a0, a1, a2, a3)
            : cBez((i - stepsPerSeg) / stepsPerSeg, b0, b1, b2, b3);
          const p = P_HOVER3_END + exitDur * (i / totalArcSteps);
          sortWanderTl.to(primary, {
            ...xy(pt.x, pt.y, p), scale: statScale, filter: "none",
            duration: exitDur / totalArcSteps,
            ease: i === totalArcSteps ? "power1.out" : "none",
          });
        }
      }

    });

    ctxRef.current = ctx;

    // Refresh trigger positions after layout fully settles
    // (fonts, images, reveal transitions may shift element positions)
    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 1200);
    return () => clearTimeout(refreshTimer);
  }, []);

  useEffect(() => {
    initGSAP();
    return () => {
      ctxRef.current?.revert();
    };
  }, [initGSAP]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 2,
        overflow: "hidden",
        opacity: glowExpanded ? 0 : 1,
        transition: "opacity 0.3s ease",
      }}
    >
      {/* ═══ PRIMARY ORB — the narrative thread ═══ */}
      <div
        ref={primaryRef}
        className="absolute pointer-events-none orb-primary"
        style={{
          bottom: "-10%",
          left: "calc(50% - min(50vh, 60vw))",
          width: "min(100vh, 120vw)",
          height: "min(100vh, 120vw)",
          willChange: "transform, opacity, filter", backfaceVisibility: "hidden",
        }}
      >
        <FullOrb src="/orb-hero.png" offset={0} />
      </div>

    </div>
  );
}
