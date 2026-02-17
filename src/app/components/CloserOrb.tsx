"use client";

import { useEffect, useRef } from "react";

/**
 * CloserOrb — two small orbs swirl together into one (52px),
 * then curve on scroll to glow behind the word "you" in the h2.
 *
 * All positions computed EVERY FRAME in viewport coordinates, then
 * converted to section-relative. Animation anchored to #closer section
 * top, so it stays visible throughout.
 *
 * Scroll-driven. On reverse scroll, everything reverses seamlessly.
 */
export default function CloserOrb() {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbARef = useRef<HTMLDivElement>(null);
  const orbBRef = useRef<HTMLDivElement>(null);
  const mergedRef = useRef<HTMLDivElement>(null);

  const SMALL = 26;
  const MERGED = 52;

  const smallTimingsA = { glow: 5.4, heart: 5.2, breathe: 5.3, rotate: 110 };
  const smallTimingsB = { glow: 6.2, heart: 6.0, breathe: 6.1, rotate: 130 };
  const mergedTimings = { glow: 5.8, heart: 5.4, breathe: 5.5, rotate: 100 };

  useEffect(() => {
    const container = containerRef.current;
    const orbA = orbARef.current;
    const orbB = orbBRef.current;
    const merged = mergedRef.current;
    if (!container || !orbA || !orbB || !merged) return;

    let scrollRafId = 0;
    let hasEntered = false;
    const halfS = SMALL / 2;
    const halfM = MERGED / 2;

    const bezier = (t: number, p0: number, p1: number, p2: number, p3: number) => {
      const u = 1 - t;
      return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
    };

    const resetToHidden = () => {
      hasEntered = false;
      orbA.style.opacity = "0";
      orbB.style.opacity = "0";
      merged.style.opacity = "0";
      orbA.style.transform = "";
      orbB.style.transform = "";
      merged.style.transform = "";
      merged.classList.remove("closer-orb-at-rest");

      document.querySelectorAll(".founders-orb-a, .founders-orb-b").forEach(el => {
        (el as HTMLElement).classList.remove("founders-orb-hidden-for-closer");
      });
    };

    const checkScroll = () => {
      const closerSection = document.querySelector("#closer") as HTMLElement;
      if (!closerSection) return;

      const closerRect = closerSection.getBoundingClientRect();
      const vh = window.innerHeight;

      // progress=0 when closer top at 55% vh, progress=1 when closer top at ~10% vh
      const triggerPoint = vh * 0.55;
      const scrollRange = vh * 0.45;
      const progress = Math.max(0, Math.min(1,
        (triggerPoint - closerRect.top) / scrollRange
      ));

      const isActive = progress > 0;

      if (isActive) {
        if (!hasEntered) {
          hasEntered = true;
          document.querySelectorAll(".founders-orb-a, .founders-orb-b").forEach(el => {
            (el as HTMLElement).classList.add("founders-orb-hidden-for-closer");
          });
        }

        // ── All positions in VIEWPORT coords, recomputed every frame ──
        const secRect = closerSection.getBoundingClientRect();

        // Swirl center: match FoundersOrb end position for seamless handoff
        const foundersSection = document.querySelector("#founders") as HTMLElement;
        const fRect = foundersSection ? foundersSection.getBoundingClientRect() : secRect;
        const swirlVpX = fRect.left + fRect.width * 0.70;
        const swirlVpY = fRect.top + fRect.height * 0.95;

        // Target: the word "you" (or fallback to h2 center)
        const youSpan = closerSection.querySelector(".closer-orb-target") as HTMLElement;
        let targetVpX = secRect.left + secRect.width / 2;
        let targetVpY = secRect.top + 130;
        if (youSpan) {
          const youRect = youSpan.getBoundingClientRect();
          targetVpX = youRect.left + youRect.width / 2;
          targetVpY = youRect.top + youRect.height / 2;
        }

        const SWIRL_END = 0.35;

        if (progress < SWIRL_END) {
          // ── Phase 1: Swirl merge ──
          const swirlT = progress / SWIRL_END;
          const radius = 22 * (1 - swirlT);
          const angle = swirlT * Math.PI * 3 + swirlT * swirlT * Math.PI * 5;

          const aVpX = swirlVpX + radius * Math.cos(angle);
          const aVpY = swirlVpY + radius * Math.sin(angle) * 0.65;
          const bVpX = swirlVpX + radius * Math.cos(angle + Math.PI);
          const bVpY = swirlVpY + radius * Math.sin(angle + Math.PI) * 0.65;

          const smallOpacity = 0.85 * (1 - swirlT * swirlT);
          const smallScale = 1 - swirlT * 0.4;

          orbA.style.left = (aVpX - secRect.left - halfS) + "px";
          orbA.style.top = (aVpY - secRect.top - halfS) + "px";
          orbA.style.opacity = String(smallOpacity);
          orbA.style.transform = `scale(${smallScale})`;

          orbB.style.left = (bVpX - secRect.left - halfS) + "px";
          orbB.style.top = (bVpY - secRect.top - halfS) + "px";
          orbB.style.opacity = String(smallOpacity);
          orbB.style.transform = `scale(${smallScale})`;

          const mergedOnset = Math.max(0, (swirlT - 0.6) / 0.4);
          merged.style.left = (swirlVpX - secRect.left - halfM) + "px";
          merged.style.top = (swirlVpY - secRect.top - halfM) + "px";
          merged.style.opacity = merged.classList.contains("closer-orb-hidden-for-contact")
            ? "0" : String(mergedOnset * 0.85);
          merged.style.transform = `scale(${0.4 + mergedOnset * 0.6})`;
          merged.classList.remove("closer-orb-at-rest");
        } else {
          // ── Phase 2: Merged orb curves down to "you" ──
          orbA.style.opacity = "0";
          orbB.style.opacity = "0";

          const curveT = (progress - SWIRL_END) / (1 - SWIRL_END);
          // Mostly-straight path with slight natural curve via Bézier
          const cp1X = swirlVpX + (targetVpX - swirlVpX) * 0.35;
          const cp1Y = swirlVpY + (targetVpY - swirlVpY) * 0.30;
          const cp2X = swirlVpX + (targetVpX - swirlVpX) * 0.65;
          const cp2Y = swirlVpY + (targetVpY - swirlVpY) * 0.70;

          const vpX = bezier(curveT, swirlVpX, cp1X, cp2X, targetVpX);
          const vpY = bezier(curveT, swirlVpY, cp1Y, cp2Y, targetVpY);

          merged.style.left = (vpX - secRect.left - halfM) + "px";
          merged.style.top = (vpY - secRect.top - halfM) + "px";
          // Force opacity 0 when ContactOrb has taken over
          merged.style.opacity = merged.classList.contains("closer-orb-hidden-for-contact")
            ? "0" : "0.85";
          merged.style.transform = "scale(1)";

          if (progress >= 1) {
            merged.classList.add("closer-orb-at-rest");
          } else {
            merged.classList.remove("closer-orb-at-rest");
          }
        }
      } else if (!isActive && hasEntered) {
        resetToHidden();
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(scrollRafId);
      scrollRafId = requestAnimationFrame(checkScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    checkScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(scrollRafId);
    };
  }, []);

  /** Small orb stack (26px) */
  const renderSmallOrb = (timings: typeof smallTimingsA) => (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        className="absolute"
        style={{
          inset: "-80%",
          background: "radial-gradient(circle, rgba(212,165,116,0.45) 0%, rgba(212,165,116,0.15) 45%, transparent 70%)",
          filter: "blur(10px)",
          animation: `hero-orb-glow-swell ${timings.glow}s ease-in-out infinite`,
        }}
      />
      <div
        className="absolute"
        style={{
          inset: "-10%",
          background: "radial-gradient(circle at 50% 40%, rgba(224,140,120,1) 0%, rgba(200,110,90,0.5) 35%, transparent 70%)",
          filter: "blur(5px) brightness(1.4)",
          animation: `hero-orb-heart ${timings.heart}s ease-in-out infinite`,
          mixBlendMode: "screen",
        }}
      />
      <div style={{ width: "100%", height: "100%", animation: `hero-orb-breathe ${timings.breathe}s ease-in-out infinite` }}>
        <div style={{ width: "100%", height: "100%", animation: `hero-orb-rotate ${timings.rotate}s ease-in-out infinite` }}>
          <img
            src="/orb-hero.png"
            alt=""
            style={{
              width: "100%", height: "100%", objectFit: "contain",
              opacity: 0.9, mixBlendMode: "screen",
              WebkitMaskImage: "radial-gradient(circle, black 30%, transparent 70%)",
              maskImage: "radial-gradient(circle, black 30%, transparent 70%)",
            }}
          />
        </div>
      </div>
    </div>
  );

  /** Merged orb stack (52px) — larger glow for warm backdrop behind text */
  const renderMergedOrb = (timings: typeof mergedTimings) => (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        className="absolute"
        style={{
          inset: "-120%",
          background: "radial-gradient(circle, rgba(212,165,116,0.40) 0%, rgba(212,165,116,0.12) 40%, transparent 65%)",
          filter: "blur(20px)",
          animation: `hero-orb-glow-swell ${timings.glow}s ease-in-out infinite`,
        }}
      />
      <div
        className="absolute"
        style={{
          inset: "-20%",
          background: "radial-gradient(circle at 50% 40%, rgba(224,140,120,1) 0%, rgba(200,110,90,0.5) 35%, transparent 70%)",
          filter: "blur(10px) brightness(1.4)",
          animation: `hero-orb-heart ${timings.heart}s ease-in-out infinite`,
          mixBlendMode: "screen",
        }}
      />
      <div style={{ width: "100%", height: "100%", animation: `hero-orb-breathe ${timings.breathe}s ease-in-out infinite` }}>
        <div style={{ width: "100%", height: "100%", animation: `hero-orb-rotate ${timings.rotate}s ease-in-out infinite` }}>
          <img
            src="/orb-hero.png"
            alt=""
            style={{
              width: "100%", height: "100%", objectFit: "contain",
              opacity: 0.85, mixBlendMode: "screen",
              WebkitMaskImage: "radial-gradient(circle, black 30%, transparent 68%)",
              maskImage: "radial-gradient(circle, black 30%, transparent 68%)",
            }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <div
        ref={orbARef}
        className="absolute"
        style={{ width: SMALL, height: SMALL, opacity: 0 }}
      >
        {renderSmallOrb(smallTimingsA)}
      </div>
      <div
        ref={orbBRef}
        className="absolute"
        style={{ width: SMALL, height: SMALL, opacity: 0 }}
      >
        {renderSmallOrb(smallTimingsB)}
      </div>
      <div
        ref={mergedRef}
        className="absolute closer-merged-orb"
        style={{ width: MERGED, height: MERGED, opacity: 0 }}
      >
        {renderMergedOrb(mergedTimings)}
      </div>
    </div>
  );
}
