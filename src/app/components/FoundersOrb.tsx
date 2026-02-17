"use client";

import { useEffect, useRef } from "react";

/**
 * FoundersOrb — the LeadersOrb visually splits into two tiny orbs (26px)
 * that tango-dance rightward above the H1, then curve down-right to rest.
 *
 * Trigger: #founders top < 60% viewport AND `.leaders-orb-at-rest` exists.
 * On reverse scroll, both orbs vanish and LeadersOrb reappears.
 */
export default function FoundersOrb() {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbARef = useRef<HTMLDivElement>(null);
  const orbBRef = useRef<HTMLDivElement>(null);

  const ORB_SIZE = 26;

  // Offset timings per orb so they breathe independently
  const orbATimings = { glow: 5.4, heart: 5.2, breathe: 5.3, rotate: 110 };
  const orbBTimings = { glow: 6.2, heart: 6.0, breathe: 6.1, rotate: 130 };

  useEffect(() => {
    const container = containerRef.current;
    const orbA = orbARef.current;
    const orbB = orbBRef.current;
    if (!container || !orbA || !orbB) return;

    let scrollRafId = 0;
    const half = ORB_SIZE / 2;

    const bezier = (t: number, p0: number, p1: number, p2: number, p3: number) => {
      const u = 1 - t;
      return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
    };

    // Cached geometry — computed once on first activation, cleared on reset
    let geo: {
      startX: number; startY: number;
      cp1X: number; cp1Y: number;
      cp2X: number; cp2Y: number;
      endX: number; endY: number;
      startScale: number;
    } | null = null;

    const resetToHidden = () => {
      orbA.style.opacity = "0";
      orbB.style.opacity = "0";
      orbA.style.transform = "";
      orbB.style.transform = "";
      geo = null;

      const leadersEl = document.querySelector(".leaders-orb-at-rest");
      if (leadersEl) leadersEl.classList.remove("leaders-orb-hidden-for-founders");
    };

    const checkScroll = () => {
      const foundersSection = document.querySelector("#founders") as HTMLElement;
      if (!foundersSection) return;

      const foundersRect = foundersSection.getBoundingClientRect();
      const vh = window.innerHeight;
      const leadersOrbEl = document.querySelector(".leaders-orb-at-rest") as HTMLElement;

      // ── Scroll progress: 0 at trigger, 1 after ~80vh of scroll ──
      const triggerPoint = vh * 0.60;
      const scrollRange = vh * 0.80;
      const progress = Math.max(0, Math.min(1,
        (triggerPoint - foundersRect.top) / scrollRange
      ));

      const isActive = progress > 0 && !!leadersOrbEl;

      if (isActive) {
        // Cache geometry on first activation
        if (!geo) {
          const secRect = foundersSection.getBoundingClientRect();
          const lRect = leadersOrbEl.getBoundingClientRect();
          const startX = lRect.left + lRect.width / 2 - secRect.left;
          const startY = lRect.top + lRect.height / 2 - secRect.top;
          const aboveH1_Y = Math.max(50, startY * 0.3);
          const endY = secRect.height * 0.95;

          geo = {
            startX, startY,
            cp1X: secRect.width * 0.78,
            cp1Y: aboveH1_Y,
            cp2X: secRect.width * 0.70,
            cp2Y: endY * 0.55,
            endX: secRect.width * 0.70,
            endY,
            startScale: 260 / ORB_SIZE,
          };
        }

        // Hide LeadersOrb while active
        leadersOrbEl.classList.add("leaders-orb-hidden-for-founders");

        // ── Center path: single smooth Bézier driven by scroll ──
        const centerX = bezier(progress, geo.startX, geo.cp1X, geo.cp2X, geo.endX);
        const centerY = bezier(progress, geo.startY, geo.cp1Y, geo.cp2Y, geo.endY);

        // ── Scale: shrink from 10 → 1 during first 12.5% of scroll ──
        const splitT = Math.min(1, progress / 0.125);
        const curScale = geo.startScale + (1 - geo.startScale) * splitT;

        // ── Tango dance offset ──
        // Onset: orbs start as one, separate over 2.5–12.5% scroll range
        const danceOnset = Math.min(1, Math.max(0, (progress - 0.025) / 0.1));

        // 2 full rotations over the scroll journey, gentle tempo variation
        const tangoPhase = progress * Math.PI * 4 + 0.3 * Math.sin(progress * Math.PI * 2.5);

        // Radius: min 22px → min distance between centers = 28.6px > 26px orb
        const tangoFadeout = progress > 0.75 ? Math.max(0, 1 - (progress - 0.75) / 0.25) : 1;
        const tangoRadius = (26 + 4 * Math.sin(progress * Math.PI * 2.8)) * danceOnset * tangoFadeout;

        // Resting separation: as tango fades, balls maintain a fixed 32px gap
        const restOffset = 16 * (1 - tangoFadeout);

        // Elliptical: 0.65 Y keeps vertical passes well-separated
        const offX = tangoRadius * Math.cos(tangoPhase) + restOffset;
        const offY = tangoRadius * Math.sin(tangoPhase) * 0.65;

        orbA.style.left = (centerX + offX - half) + "px";
        orbA.style.top = (centerY + offY - half) + "px";
        orbA.style.transform = `scale(${curScale})`;
        orbA.style.opacity = "0.85";

        orbB.style.left = (centerX - offX - half) + "px";
        orbB.style.top = (centerY - offY - half) + "px";
        orbB.style.transform = `scale(${curScale})`;
        orbB.style.opacity = "0.85";

        // At full progress, snap to percentage values for responsiveness
        if (progress >= 1) {
          orbA.style.left = `calc(70% + ${16 - half}px)`;
          orbA.style.top = `calc(95% - ${half}px)`;
          orbA.style.transform = "";

          orbB.style.left = `calc(70% - ${16 + half}px)`;
          orbB.style.top = `calc(95% - ${half}px)`;
          orbB.style.transform = "";
        }
      } else if (!isActive && geo) {
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

  /** 5-layer orb stack scaled for 26px — reduced blur values */
  const renderOrb = (timings: typeof orbATimings) => (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Outer warm glow */}
      <div
        className="absolute"
        style={{
          inset: "-80%",
          background:
            "radial-gradient(circle, rgba(212,165,116,0.45) 0%, rgba(212,165,116,0.15) 45%, transparent 70%)",
          filter: "blur(10px)",
          animation: `hero-orb-glow-swell ${timings.glow}s ease-in-out infinite`,
        }}
      />
      {/* Heart glow */}
      <div
        className="absolute"
        style={{
          inset: "-10%",
          background:
            "radial-gradient(circle at 50% 40%, rgba(224,140,120,1) 0%, rgba(200,110,90,0.5) 35%, transparent 70%)",
          filter: "blur(5px) brightness(1.4)",
          animation: `hero-orb-heart ${timings.heart}s ease-in-out infinite`,
          mixBlendMode: "screen",
        }}
      />
      {/* Breathe > Rotate > Image */}
      <div
        style={{
          width: "100%",
          height: "100%",
          animation: `hero-orb-breathe ${timings.breathe}s ease-in-out infinite`,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            animation: `hero-orb-rotate ${timings.rotate}s ease-in-out infinite`,
          }}
        >
          <img
            src="/orb-hero.png"
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              opacity: 0.9,
              mixBlendMode: "screen",
              WebkitMaskImage:
                "radial-gradient(circle, black 30%, transparent 70%)",
              maskImage:
                "radial-gradient(circle, black 30%, transparent 70%)",
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
        className="absolute founders-orb-a"
        style={{ width: ORB_SIZE, height: ORB_SIZE, opacity: 0 }}
      >
        {renderOrb(orbATimings)}
      </div>
      <div
        ref={orbBRef}
        className="absolute founders-orb-b"
        style={{ width: ORB_SIZE, height: ORB_SIZE, opacity: 0 }}
      >
        {renderOrb(orbBTimings)}
      </div>
    </div>
  );
}
