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
      // LATER SECTIONS FIRST — hero/bridge created LAST for GSAP
      // priority (last-created wins when multiple timelines conflict
      // at progress 0 during scroll reversal).
      // ═══════════════════════════════════════════════════════════════

      // Compute bridge text centre Y — needed by both glow and hero timelines
      const bridgeTextEl = document.querySelector("#bridge p");
      const heroEl = document.querySelector("#hero") as HTMLElement | null;
      const heroH = heroEl?.offsetHeight || vh;
      let targetY = -vh * 0.43; // fallback
      if (bridgeTextEl) {
        const textRect = bridgeTextEl.getBoundingClientRect();
        const textCenterDoc = textRect.top + window.scrollY + textRect.height / 2;
        const textCenterVP = textCenterDoc - heroH;
        targetY = textCenterVP - vh * 0.6; // 0.6 = orb natural centre (bottom:-10%, size ~100vh)
      }

      // ═══════════════════════════════════════════════════════════════
      // HERO + BRIDGE — created LAST so they win GSAP priority when
      // multiple scrub timelines revert to progress 0 on scroll-up.
      // ═══════════════════════════════════════════════════════════════

      // ═══ HERO — large clockwise Bezier arc to S2 centre ═══
      // MotionPath traces: centre → right edge → down → sweep bottom → rise to bridge text.
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        },
      });

      // Smooth upward arc — gentle rightward drift, no jumps
      heroTl.fromTo(primary,
        { x: 0, y: 0 },
        {
          motionPath: {
            path: [
              { x: 0, y: 0 },                           // start: natural position
              { x: vw * 0.12, y: targetY * 0.35 },      // gentle right drift, 1/3 up
              { x: vw * 0.05, y: targetY * 0.7 },       // easing back to centre, 2/3 up
              { x: 0, y: targetY },                      // bridge text centre
            ],
            curviness: 1.2,
          },
          duration: 1,
          ease: "none",
        },
        0
      );

      // Scale + filter shrink concurrently — filter:"none" prevents black orb on scroll-up
      heroTl.fromTo(primary,
        { scale: 1, opacity: 1, filter: "none" },
        { scale: 0.2, filter: "none", duration: 1, ease: "power1.in" },
        0
      );

      // Cleanup guardian for scroll-up
      ScrollTrigger.create({
        trigger: "#bridge",
        start: "top top",
        end: "bottom top",
        onLeaveBack: () => {
          hideSecondary();
        },
      });

      // ═══ BRIDGE-TO-GLOW — cinematic orb drop into card ═══
      // Created LAST for highest GSAP priority — overrides hero timeline's
      // scale/y when both target the primary orb during the glow section.
      const cardEl = document.querySelector(".holo-border") as HTMLElement | null;
      const container = containerRef.current;

      // Compute landing Y — exact card-orb alignment at progress 0.85
      let landingY = 0; // fallback: orb natural center
      if (cardEl) {
        const glowSection = document.querySelector("#glow") as HTMLElement | null;
        if (glowSection) {
          const glowTop = glowSection.offsetTop;
          const glowHeight = glowSection.offsetHeight;
          const scrollStart = glowTop - 0.8 * vh;
          const scrollEnd = glowTop + glowHeight / 2 - vh / 2;
          const cardRect = cardEl.getBoundingClientRect();
          const cardDocCenterY = cardRect.top + window.scrollY + cardRect.height * 0.35;
          // Card viewport position when timeline is at progress 0.85
          const scroll085 = scrollStart + 0.85 * (scrollEnd - scrollStart);
          const cardVPCenter = cardDocCenterY - scroll085;
          landingY = cardVPCenter - orbCSSCenterY;
        }
      }

      const levitationWrapper = cardEl?.parentElement;
      const descent = landingY - targetY; // total Y travel from bridge to card

      // Card orb overlay — controlled via GSAP, not CSS class
      const cardOrbOverlay = document.querySelector(".card-orb-overlay") as HTMLElement;

      const glowTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#glow",
          start: "top 80%",
          end: "center center",
          scrub: 0.5,
          onUpdate: (self) => {
            const p = self.progress;
            const card = document.querySelector(".holo-border") as HTMLElement;
            // Z-index: orb in front during initial drop, behind card once shrinking
            if (container) {
              if (p < 0.50) container.classList.add("orb-system-elevated");
              else container.classList.remove("orb-system-elevated");
            }
            // Radiant pulse activation after absorption
            if (card) {
              if (p >= 0.85) card.classList.add("glow-absorbed");
              else card.classList.remove("glow-absorbed");
            }
            // Pause levitation near absorption for alignment
            if (levitationWrapper) {
              levitationWrapper.style.animationPlayState = p > 0.6 ? "paused" : "running";
            }
            // Card brightness boost during absorption
            if (card) {
              card.style.filter = p > 0.7 ? `brightness(${1 + (p - 0.7) / 0.3 * 0.5})` : "";
            }
          },
          onLeaveBack: () => {
            hideSecondary();
            if (container) container.classList.remove("orb-system-elevated");
            const card = document.querySelector(".holo-border") as HTMLElement;
            if (card) { card.classList.remove("glow-absorbed"); card.style.filter = ""; }
            if (levitationWrapper) levitationWrapper.style.animationPlayState = "running";
          },
        },
      });

      // Keyframes: grow → peak → shrink to card-orb size → land → fade behind card
      // At p=0.50 (z-index flip), orb matches card-orb-overlay size exactly.
      // filter:"none" on every keyframe prevents black orb on scroll-up
      glowTl.to(primary, { scale: 0.30, opacity: 1, y: targetY + descent * 0.10, filter: "none", duration: 0.10, ease: "none" });
      glowTl.to(primary, { scale: 0.50, opacity: 1, y: targetY + descent * 0.30, filter: "none", duration: 0.15, ease: "none" });
      glowTl.to(primary, { scale: cardOrbMatchScale * 1.2, opacity: 0.95, y: targetY + descent * 0.60, filter: "none", duration: 0.15, ease: "none" });
      // 0.40→0.50: arrive at card position, matching card-orb-overlay size
      glowTl.to(primary, { scale: cardOrbMatchScale, opacity: 0.9, y: landingY, filter: "none", duration: 0.10, ease: "power1.inOut" });
      // 0.50→0.70: fade out behind card (z-index already flipped)
      glowTl.to(primary, { scale: cardOrbMatchScale, opacity: 0, y: landingY, filter: "none", duration: 0.20, ease: "power1.in" });
      // 0.70→0.85: hold invisible — card-orb-overlay takes over
      glowTl.to(primary, { scale: cardOrbMatchScale, opacity: 0, y: landingY, filter: "none", duration: 0.15, ease: "none" });
      // 0.85→1.00: hold invisible
      glowTl.to(primary, { scale: cardOrbMatchScale, opacity: 0, y: landingY, filter: "none", duration: 0.15, ease: "none" });

      // Card-orb-overlay: drops in from TOP of card at progress 0.70→0.85,
      // holds at centre, then glow-to-vision drops it out the BOTTOM.
      // Clipped both ways by .holo-border overflow:hidden.
      if (cardOrbOverlay) {
        glowTl.fromTo(cardOrbOverlay,
          { opacity: 1, scale: 1, top: "-50%" },
          { opacity: 1, scale: 1, top: "50%", duration: 0.15, ease: "power1.out" },
          0.70
        );
      }

      // ═══ GLOW-TO-VISION — orb DROPS from card and grows into vision ═══
      // Created LAST for highest GSAP priority.
      //
      // RULE: START size === END size of previous phase. No fades, no jumps.
      // Glow timeline ends with orb at cardOrbMatchScale, opacity 0.6, y: landingY.
      //
      // SVG reference circles (cx≈720, viewport 1440×1864):
      //   c1: cy=408  r=150  — card position (START)
      //   c2: cy=633  r=181  — dropping, growing slightly
      //   c3: cy=918  r=250  — past section boundary, growing
      //   c4: cy=1262 r=341  — deep into vision, much larger
      //   c5: cy=1446 r=416  — final position (END)
      //
      // Position normalized (0→1): 0, 0.217, 0.491, 0.823, 1.0
      // Scale normalized (0→1):    0, 0.118, 0.378, 0.720, 1.0

      const totalDrop = -landingY; // positive distance: card → natural center
      const scaleRange = visionEndScale - cardOrbMatchScale;

      const glowToVisionTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#vision",
          start: "top 100%",
          end: "top 30%",
          scrub: 0.5,
        },
      });

      // Card-orb-overlay drops WITHIN the card (clipped by .holo-border overflow:hidden)
      // This creates the "falling out of the card" effect before the bg orb takes over.
      if (cardOrbOverlay) {
        glowToVisionTl.to(cardOrbOverlay, {
          top: "150%",
          opacity: 0,
          duration: 0.20,
          ease: "power1.in",
        }, 0);
      }

      // 4-keyframe drop matching SVG circle trajectory (concurrent with card-orb drop)
      // c1→c2: bg orb stays invisible while card-orb drops out of card
      glowToVisionTl.to(primary, {
        scale: cardOrbMatchScale + scaleRange * 0.118,
        y: landingY + totalDrop * 0.217,
        opacity: 0, filter: "none",
        duration: 0.217, ease: "power1.in",
      }, 0); // position 0: starts same time as card-orb drop
      // c2→c3: card-orb gone — bg orb fades in, accelerating drop
      glowToVisionTl.to(primary, {
        scale: cardOrbMatchScale + scaleRange * 0.378,
        y: landingY + totalDrop * 0.491,
        opacity: 0.6, filter: "none",
        duration: 0.274, ease: "none",
      });
      // c3→c4: rapid growth, nearing final position
      glowToVisionTl.to(primary, {
        scale: cardOrbMatchScale + scaleRange * 0.720,
        y: landingY + totalDrop * 0.823,
        opacity: 0.6, filter: "none",
        duration: 0.332, ease: "none",
      });
      // c4→c5: final position, full size, slight deceleration
      glowToVisionTl.to(primary, {
        scale: visionEndScale,
        y: 0,
        opacity: 0.6, filter: "none",
        duration: 0.177, ease: "power1.out",
      });

      // ═══ VISION-TO-SORT — orb shrinks, wanders through stats, lands under CTA ═══
      // Continuous from glowToVisionTl end state (visionEndScale, y:0, opacity:0.6).
      // No fade — the orb stays at opacity 0.6 throughout.
      const statEls = document.querySelectorAll<HTMLElement>(".stat-item");
      const launchEl = document.querySelector("#sort-solution .text-gradient-warm") as HTMLElement | null;
      const sortSection = document.querySelector("#sort") as HTMLElement | null;

      if (statEls.length === 4 && sortSection) {
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
        //  0.00→0.07  Shrink step 1 — gradual drift toward stats
        //  0.07→0.14  Shrink step 2 — continuing
        //  0.14→0.20  Shrink step 3 — arrive above stat 1 at statScale
        //  0.20→0.26  Hover stat 1
        //  0.26→0.29  Curve to stat 2
        //  0.29→0.36  Hover stat 2
        //  0.36→0.39  Curve to stat 3
        //  0.39→0.46  Hover stat 3
        //  0.46→0.49  Curve to stat 4
        //  0.49→0.56  Hover stat 4
        //  0.56→0.66  Rise + drift right from stat 4
        //  0.66→0.80  Apex — furthest right, highest point
        //  0.80→1.00  Sweep left + down, land under "Launching 2026"

        const sortWanderTl = gsap.timeline({
          scrollTrigger: {
            trigger: "#sort-stats",
            start: "top 80%",
            end: "top top",
            scrub: 0.8,
          },
        });

        // Geometric intermediate scales for smooth, even-looking shrink
        // Each step reduces by the same visual ratio (~cube root)
        const shrinkRatio = Math.pow(statScale / visionEndScale, 1 / 3);
        const shrinkStep1 = visionEndScale * shrinkRatio;
        const shrinkStep2 = shrinkStep1 * shrinkRatio;

        // Phase 1a (0→0.07): Shrink step 1, gentle drift toward stats
        const drift1 = xy(
          vw / 2 + (statDocs[0].x - vw / 2) * 0.2,
          statDocs[0].y - hoverGap - 120,
          0.07
        );
        sortWanderTl.to(primary, {
          ...drift1, scale: shrinkStep1, filter: "none",
          duration: 0.07, ease: "none",
        });

        // Phase 1b (0.07→0.14): Shrink step 2, continue toward stat 1
        const drift2 = xy(
          vw / 2 + (statDocs[0].x - vw / 2) * 0.6,
          statDocs[0].y - hoverGap - 50,
          0.14
        );
        sortWanderTl.to(primary, {
          ...drift2, scale: shrinkStep2, filter: "none",
          duration: 0.07, ease: "none",
        });

        // Phase 1c (0.14→0.20): Shrink step 3, arrive above stat 1
        const s1s = xy(statDocs[0].x, statDocs[0].y - hoverGap, 0.20);
        sortWanderTl.to(primary, {
          ...s1s, scale: statScale, filter: "none",
          duration: 0.06, ease: "power1.out",
        });

        // Phase 2 (0.20→0.26): Hover above stat 1
        const s1e = xy(statDocs[0].x, statDocs[0].y - hoverGap, 0.26);
        sortWanderTl.to(primary, {
          ...s1e, scale: statScale, filter: "none",
          duration: 0.06, ease: "none",
        });

        // Phase 3 (0.26→0.29): Curve to stat 2
        const s2s = xy(statDocs[1].x, statDocs[1].y - hoverGap, 0.29);
        sortWanderTl.to(primary, {
          ...s2s, scale: statScale, filter: "none",
          duration: 0.03, ease: "power1.inOut",
        });

        // Phase 4 (0.29→0.36): Hover above stat 2
        const s2e = xy(statDocs[1].x, statDocs[1].y - hoverGap, 0.36);
        sortWanderTl.to(primary, {
          ...s2e, scale: statScale, filter: "none",
          duration: 0.07, ease: "none",
        });

        // Phase 5 (0.36→0.39): Curve to stat 3
        const s3s = xy(statDocs[2].x, statDocs[2].y - hoverGap, 0.39);
        sortWanderTl.to(primary, {
          ...s3s, scale: statScale, filter: "none",
          duration: 0.03, ease: "power1.inOut",
        });

        // Phase 6 (0.39→0.46): Hover above stat 3
        const s3e = xy(statDocs[2].x, statDocs[2].y - hoverGap, 0.46);
        sortWanderTl.to(primary, {
          ...s3e, scale: statScale, filter: "none",
          duration: 0.07, ease: "none",
        });

        // Phase 7 (0.46→0.49): Curve to stat 4
        const s4s = xy(statDocs[3].x, statDocs[3].y - hoverGap, 0.49);
        sortWanderTl.to(primary, {
          ...s4s, scale: statScale, filter: "none",
          duration: 0.03, ease: "power1.inOut",
        });

        // Phase 8 (0.49→0.56): Hover above stat 4
        const s4e = xy(statDocs[3].x, statDocs[3].y - hoverGap, 0.56);
        sortWanderTl.to(primary, {
          ...s4e, scale: statScale, filter: "none",
          duration: 0.07, ease: "none",
        });

        // Phase 9: Cosine arc — rise right, apex, sweep down to centre

        // 9a (0.56→0.66): Rise and drift right from stat 4
        const arcRiseY = statDocs[3].y - hoverGap * 3;
        const arcRiseX = Math.min(statDocs[3].x + (statDocs[3].x - statDocs[2].x), vw * 0.82);
        const arcRise = xy(arcRiseX, arcRiseY, 0.66);
        sortWanderTl.to(primary, {
          ...arcRise, scale: statScale, filter: "none",
          duration: 0.10, ease: "power1.out",
        });

        // 9b (0.66→0.80): Apex — furthest right, highest point
        const apexX = Math.min(arcRiseX + (statDocs[3].x - statDocs[2].x) * 0.5, vw * 0.88);
        const apexY = arcRiseY - hoverGap * 1.5;
        const apex = xy(apexX, apexY, 0.80);
        sortWanderTl.to(primary, {
          ...apex, scale: statScale, filter: "none",
          duration: 0.14, ease: "none",
        });

        // 9c (0.80→1.0): Sweep left and down, land centred under "Launching 2026"
        const lEnd = xy(launchDoc.x, launchDoc.y, 1.0);
        sortWanderTl.to(primary, {
          ...lEnd, scale: statScale, filter: "none",
          duration: 0.20, ease: "power2.in",
        });
      }
    });

    ctxRef.current = ctx;
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
          left: "0",
          right: "0",
          marginLeft: "auto",
          marginRight: "auto",
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
