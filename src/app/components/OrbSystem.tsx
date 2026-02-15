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
          endTrigger: "#glow",
          end: "top 80%",
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
        { scale: cardOrbMatchScale, opacity: 1, filter: "none", duration: 1, ease: "power1.in" },
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
            // Orb stays behind page content (z-2) during entire glow descent.
            // The card's opaque background naturally hides the orb — no z-flip needed.
            if (container) {
              container.classList.remove("orb-system-elevated");
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

      // Descent at constant cardOrbMatchScale — bg orb stays fully visible (opacity 1).
      // The card's opaque background naturally hides the portion behind it.
      // Card-orb-overlay is positioned dynamically by a sync ScrollTrigger (below).
      glowTl.fromTo(primary,
        { x: 0, y: targetY, scale: cardOrbMatchScale, opacity: 1, filter: "none" },
        { scale: cardOrbMatchScale, y: targetY + descent * 0.12, opacity: 1, filter: "none", duration: 0.12, ease: "none", immediateRender: false },
        0
      );
      glowTl.to(primary, { scale: cardOrbMatchScale, y: targetY + descent * 0.30, opacity: 1, filter: "none", duration: 0.13, ease: "none" });
      glowTl.to(primary, { scale: cardOrbMatchScale, y: targetY + descent * 0.60, opacity: 1, filter: "none", duration: 0.15, ease: "none" });
      // Arrive at card centre — card bg hides the orb core, glow visible around edges
      glowTl.to(primary, { scale: cardOrbMatchScale, y: landingY, opacity: 1, filter: "none", duration: 0.15, ease: "power1.in" });
      // Hold at card centre
      glowTl.to(primary, { scale: cardOrbMatchScale, y: landingY, opacity: 1, filter: "none", duration: 0.45, ease: "none" });

      // ═══ GLOW-TO-VISION — orb DROPS from card and grows into vision ═══
      // Bg orb starts at opacity 1 (card hides it). Transitions to 0.6 as it clears.
      // Card-orb-overlay tracks the bg orb dynamically via sync ScrollTrigger below.

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

      // c1→c2: orb drops from card centre, still mostly behind card
      glowToVisionTl.to(primary, {
        scale: cardOrbMatchScale + scaleRange * 0.118,
        y: landingY + totalDrop * 0.217,
        opacity: 1, filter: "none",
        duration: 0.217, ease: "power1.in",
      }, 0);
      // c2→c3: clearing card, opacity transitions to 0.6
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

      // ═══ Card-orb sync — dynamic positioning on every scroll frame ═══
      // Reads the bg orb's current GSAP transforms and positions the card-orb-overlay
      // so it shows exactly the portion of the orb that's behind the card.
      // The card's overflow:hidden clips naturally — creating the illusion of one
      // continuous orb passing through the card.
      if (cardOrbOverlay) {
        ScrollTrigger.create({
          trigger: "#glow",
          start: "top 80%",
          endTrigger: "#vision",
          end: "top 30%",
          onUpdate: () => {
            if (!cardEl) return;
            const cardRect = cardEl.getBoundingClientRect();
            if (cardRect.bottom < 0 || cardRect.top > vh) {
              cardOrbOverlay.style.opacity = "0";
              return;
            }
            // Bg orb's current viewport center Y
            const curY = Number(gsap.getProperty(primary, "y"));
            const curScale = Number(gsap.getProperty(primary, "scale"));
            const orbScreenY = orbCSSCenterY + curY;

            // Position card-orb center to match bg orb center (relative to card)
            const topPct = ((orbScreenY - cardRect.top) / cardRect.height) * 100;
            cardOrbOverlay.style.top = `${topPct}%`;

            // Scale card-orb to match bg orb's current visual size
            const matchScale = (orbSize * curScale) / 340;
            cardOrbOverlay.style.transform = `translate(-50%, -50%) scale(${matchScale})`;

            // Show card-orb when bg orb overlaps card area
            const visRadius = orbSize * curScale * 0.7;
            const orbTop = orbScreenY - visRadius;
            const orbBot = orbScreenY + visRadius;
            const overlaps = orbBot > cardRect.top && orbTop < cardRect.bottom;
            cardOrbOverlay.style.opacity = overlaps ? "1" : "0";
          },
          onLeave: () => { cardOrbOverlay.style.opacity = "0"; },
          onLeaveBack: () => { cardOrbOverlay.style.opacity = "0"; },
        });
      }

      // ═══ VISION WANDER — dust particle floating through text ═══
      // Triggers when "Human success" H2 nears top of fold.
      // Orb shrinks and drifts down like a floating particle until stats appear.
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

        // Gentle leftward arc — orb wanders left while shrinking,
        // curving toward the "82%" stat position
        visionWanderTl.to(primary, {
          x: -vw * 0.02, y: dustDriftY * 0.25,
          scale: visionEndScale * 0.82, filter: "none",
          duration: 0.25, ease: "none",
        });
        visionWanderTl.to(primary, {
          x: -vw * 0.05, y: dustDriftY * 0.55,
          scale: visionEndScale * 0.65, filter: "none",
          duration: 0.25, ease: "none",
        });
        visionWanderTl.to(primary, {
          x: -vw * 0.07, y: dustDriftY * 0.80,
          scale: dustEndScale * 1.06, filter: "none",
          duration: 0.25, ease: "none",
        });
        visionWanderTl.to(primary, {
          x: -vw * 0.08, y: dustDriftY,
          scale: dustEndScale, filter: "none",
          duration: 0.25, ease: "none",
        });
      }

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

        // ═══ Approach — gentle leftward curve while shrinking ═══
        // Continues the leftward drift from visionWanderTl, curving to stat 1
        const s1x = statDocs[0].x;
        const s1y = statDocs[0].y;

        // 1a (0→0.07): Continue leftward, slight downward curve
        sortWanderTl.to(primary, {
          ...xy(vw / 2 + (s1x - vw / 2) * 0.25, s1y - hoverGap - 140, 0.07),
          scale: shrinkStep1, filter: "none",
          duration: 0.07, ease: "none",
        });

        // 1b (0.07→0.14): Curving further left toward stat 1
        sortWanderTl.to(primary, {
          ...xy(vw / 2 + (s1x - vw / 2) * 0.6, s1y - hoverGap - 50, 0.14),
          scale: shrinkStep2, filter: "none",
          duration: 0.07, ease: "none",
        });

        // 1c (0.14→0.20): Arrive above stat 1
        sortWanderTl.to(primary, {
          ...xy(s1x, s1y - hoverGap, 0.20),
          scale: statScale, filter: "none",
          duration: 0.06, ease: "power1.out",
        });

        // ═══ Stats flow — continuous undulating wave ═══
        // Scalloped arcs between stats: the orb lifts gently between each,
        // with subtle drift during visits. No straight lines anywhere.

        // Stat 1 (0.20→0.24): Settle with subtle rightward drift
        sortWanderTl.to(primary, {
          ...xy(statDocs[0].x + 10, statDocs[0].y - hoverGap, 0.24),
          scale: statScale, filter: "none",
          duration: 0.04, ease: "none",
        });

        // Arc 1→2 (0.24→0.30): Scallop up through midpoint, descend to stat 2
        const mid12x = (statDocs[0].x + statDocs[1].x) / 2;
        const mid12y = Math.min(statDocs[0].y, statDocs[1].y) - hoverGap * 2.5;
        sortWanderTl.to(primary, {
          ...xy(mid12x, mid12y, 0.27),
          scale: statScale, filter: "none",
          duration: 0.03, ease: "none",
        });
        sortWanderTl.to(primary, {
          ...xy(statDocs[1].x - 8, statDocs[1].y - hoverGap, 0.30),
          scale: statScale, filter: "none",
          duration: 0.03, ease: "none",
        });

        // Stat 2 (0.30→0.35): Settle with subtle rightward drift
        sortWanderTl.to(primary, {
          ...xy(statDocs[1].x + 10, statDocs[1].y - hoverGap, 0.35),
          scale: statScale, filter: "none",
          duration: 0.05, ease: "none",
        });

        // Arc 2→3 (0.35→0.42): Scallop up through midpoint, descend to stat 3
        const mid23x = (statDocs[1].x + statDocs[2].x) / 2;
        const mid23y = Math.min(statDocs[1].y, statDocs[2].y) - hoverGap * 2.5;
        sortWanderTl.to(primary, {
          ...xy(mid23x, mid23y, 0.38),
          scale: statScale, filter: "none",
          duration: 0.03, ease: "none",
        });
        sortWanderTl.to(primary, {
          ...xy(statDocs[2].x - 8, statDocs[2].y - hoverGap, 0.42),
          scale: statScale, filter: "none",
          duration: 0.04, ease: "none",
        });

        // Stat 3 (0.42→0.47): Settle with subtle rightward drift
        sortWanderTl.to(primary, {
          ...xy(statDocs[2].x + 10, statDocs[2].y - hoverGap, 0.47),
          scale: statScale, filter: "none",
          duration: 0.05, ease: "none",
        });

        // Arc 3→4 (0.47→0.53): Scallop up through midpoint, descend to stat 4
        const mid34x = (statDocs[2].x + statDocs[3].x) / 2;
        const mid34y = Math.min(statDocs[2].y, statDocs[3].y) - hoverGap * 2.5;
        sortWanderTl.to(primary, {
          ...xy(mid34x, mid34y, 0.50),
          scale: statScale, filter: "none",
          duration: 0.03, ease: "none",
        });
        sortWanderTl.to(primary, {
          ...xy(statDocs[3].x - 8, statDocs[3].y - hoverGap, 0.53),
          scale: statScale, filter: "none",
          duration: 0.03, ease: "none",
        });

        // Stat 4 (0.53→0.56): Brief settle with drift
        sortWanderTl.to(primary, {
          ...xy(statDocs[3].x + 10, statDocs[3].y - hoverGap, 0.56),
          scale: statScale, filter: "none",
          duration: 0.03, ease: "none",
        });

        // ═══ Exit arc — quadratic Bezier from stat 4 to "Launching 2026" ═══
        // Smooth parabolic curve: drift right + slight up → sweep down to CTA.
        // 7 Bezier-sampled waypoints — each directional change <15°.
        const bzStart = { x: statDocs[3].x + 10, y: statDocs[3].y - hoverGap };
        const bzControl = {
          x: Math.min(statDocs[3].x + vw * 0.18, vw * 0.82),
          y: statDocs[3].y - hoverGap * 2.8,
        };
        const bzEnd = { x: launchDoc.x, y: launchDoc.y };

        const arcSteps = 7;
        for (let i = 1; i <= arcSteps; i++) {
          const t = i / arcSteps;
          const p = 0.56 + 0.44 * t;
          const bx = (1 - t) * (1 - t) * bzStart.x + 2 * (1 - t) * t * bzControl.x + t * t * bzEnd.x;
          const by = (1 - t) * (1 - t) * bzStart.y + 2 * (1 - t) * t * bzControl.y + t * t * bzEnd.y;
          sortWanderTl.to(primary, {
            ...xy(bx, by, p), scale: statScale, filter: "none",
            duration: 0.44 / arcSteps,
            ease: i === arcSteps ? "power1.out" : "none",
          });
        }
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
