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
  const satellite1Ref = useRef<HTMLDivElement>(null);
  const satellite2Ref = useRef<HTMLDivElement>(null);
  const constellationRef = useRef<HTMLDivElement>(null);
  const fragmentsRef = useRef<HTMLDivElement>(null);
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
      const sat1 = satellite1Ref.current;
      const sat2 = satellite2Ref.current;
      const constellation = constellationRef.current;
      const fragments = fragmentsRef.current;
      if (!primary || !sat1 || !sat2 || !constellation || !fragments) return;

      const miniOrbs = constellation.querySelectorAll<HTMLElement>(".mini-orb");
      const fragmentEls = fragments.querySelectorAll<HTMLElement>(".orb-fragment");

      // Hide secondary orbs until needed
      gsap.set([sat1, sat2], { opacity: 0, scale: 0 });
      gsap.set(miniOrbs, { opacity: 0, scale: 0 });
      gsap.set(fragmentEls, { opacity: 0, scale: 0 });

      const vh = window.innerHeight;
      const vw = window.innerWidth;

      // Helper: force-hide all secondary orbs
      const hideSecondary = () => {
        gsap.set([sat1, sat2], { opacity: 0, scale: 0 });
        gsap.set(miniOrbs, { opacity: 0, scale: 0 });
        gsap.set(fragmentEls, { opacity: 0, scale: 0 });
      };

      // ═══════════════════════════════════════════════════════════════
      // LATER SECTIONS FIRST — hero/bridge created LAST for GSAP
      // priority (last-created wins when multiple timelines conflict
      // at progress 0 during scroll reversal).
      // ═══════════════════════════════════════════════════════════════

      // ═══ GLOW — orb flows into the phone mockup ═══
      gsap.timeline({
        scrollTrigger: {
          trigger: "#glow",
          start: "top top",
          end: "center center",
          scrub: 0.5,
          onLeaveBack: () => {
            hideSecondary();
          },
        },
      }).to(primary, {
        scale: 0.12,
        opacity: 0,
        duration: 1,
        onUpdate: function () {
          const card = document.querySelector(".holo-border") as HTMLElement;
          if (card) {
            card.style.filter = `brightness(${1 + this.progress() * 0.3})`;
          }
        },
      });

      // ═══ VISION — reforms, largest and brightest. The mission is bigger than the product. ═══
      gsap.timeline({
        scrollTrigger: {
          trigger: "#vision",
          start: "top 80%",
          end: "top 30%",
          scrub: 0.5,
        },
      }).to(primary, {
        scale: 1.3,
        opacity: 0.6,
        y: 0,
        filter: "brightness(1.2) hue-rotate(0deg)",
        duration: 1,
      });

      // ═══ SORT — THE FRACTURE ═══
      // The orb compresses then shatters into 4 fragments behind the stats.
      // This is the only moment on the page where the orb breaks.
      const sortFractureTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#sort-stats",
          start: "top 75%",
          end: "top 25%",
          scrub: 0.5,
          onLeaveBack: () => {
            hideSecondary();
          },
        },
      });

      sortFractureTl.to(primary, {
        scale: 0.15,
        opacity: 0,
        filter: "brightness(2) saturate(0.3) hue-rotate(0deg)",
        duration: 0.4,
      });

      sortFractureTl.to(
        fragmentEls,
        {
          opacity: 0.4,
          scale: 1,
          duration: 0.6,
          stagger: 0.06,
          onUpdate: () => {
            const statItems = document.querySelectorAll(".stat-item");
            statItems.forEach((stat, i) => {
              const fragment = fragmentEls[i] as HTMLElement | undefined;
              if (!fragment || !stat) return;
              const rect = stat.getBoundingClientRect();
              fragment.style.left = `${rect.left + rect.width / 2}px`;
              fragment.style.top = `${rect.top + rect.height / 2}px`;
            });
          },
        },
        "-=0.2"
      );

      // Fragments heal — the energy reconsolidates
      const sortHealTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#sort-solution",
          start: "top 80%",
          end: "top 40%",
          scrub: 0.5,
        },
      });

      sortHealTl.to(fragmentEls, {
        opacity: 0,
        scale: 0.3,
        left: "50%",
        top: "50%",
        duration: 0.5,
        stagger: 0.04,
      });

      sortHealTl.to(
        primary,
        {
          scale: 0.5,
          opacity: 0.85,
          filter: "brightness(1) saturate(1) hue-rotate(0deg)",
          duration: 0.6,
        },
        "-=0.3"
      );

      // ═══ LEADERS — primary fades, 7 mini orbs bloom into constellation ═══
      const leadersTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#leaders",
          start: "top 80%",
          end: "top 20%",
          scrub: 0.5,
          onLeaveBack: () => {
            // Scrolling back up past Leaders — kill constellation, restore primary
            gsap.set(miniOrbs, { opacity: 0, scale: 0 });
          },
        },
      });

      leadersTl.to(primary, { opacity: 0, scale: 0.3, duration: 0.4 });
      leadersTl.to(
        miniOrbs,
        { opacity: 1, scale: 1, duration: 0.6, stagger: 0.08 },
        "-=0.2"
      );

      // ═══ FOUNDERS — constellation collapses into two satellites ═══
      const foundersTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#founders",
          start: "top 80%",
          end: "top 30%",
          scrub: 0.5,
          onLeaveBack: () => {
            // Scrolling back up past Founders — kill satellites
            gsap.set([sat1, sat2], { opacity: 0, scale: 0 });
          },
        },
      });

      foundersTl.to(miniOrbs, { opacity: 0, scale: 0, duration: 0.4, stagger: 0.03 });
      foundersTl.to(
        [sat1, sat2],
        { opacity: 0.85, scale: 1, duration: 0.6 },
        "-=0.2"
      );

      // ═══ CLOSER — satellites merge, primary returns. Full circle. ═══
      const closerTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#closer",
          start: "top 80%",
          end: "top 30%",
          scrub: 0.5,
          onLeaveBack: () => {
            // Scrolling back up past Closer — kill primary restoration, keep satellites
            gsap.set(primary, { opacity: 0, scale: 0.3 });
          },
          onEnter: () => {
            // Entering Closer — ensure secondary orbs are clean
            hideSecondary();
          },
        },
      });

      closerTl.to([sat1, sat2], { opacity: 0, scale: 0, duration: 0.5 });
      closerTl.to(
        primary,
        {
          scale: 1,
          opacity: 0.85,
          filter: "brightness(1) saturate(1) hue-rotate(0deg)",
          duration: 0.6,
        },
        "-=0.3"
      );

      // ═══════════════════════════════════════════════════════════════
      // HERO + BRIDGE — created LAST so they win GSAP priority when
      // multiple scrub timelines revert to progress 0 on scroll-up.
      // ═══════════════════════════════════════════════════════════════

      // ═══ HERO — large clockwise Bezier arc to S2 centre ═══
      // MotionPath traces: centre → right edge → down → sweep bottom → rise to bridge text.
      // Compute bridge text centre Y for the moment bridge-top = viewport-top.
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

      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        },
      });

      // Smooth Bezier arc — large clockwise loop matching the reference path
      heroTl.fromTo(primary,
        { x: 0, y: 0 },
        {
          motionPath: {
            path: [
              { x: 0, y: 0 },                         // start: hero centre
              { x: vw * 0.4, y: 0 },                   // right edge, same height
              { x: vw * 0.42, y: vh * 0.35 },          // far right, well below fold
              { x: vw * 0.1, y: vh * 0.45 },           // bottom, drifting left
              { x: -vw * 0.08, y: vh * 0.1 },          // left of centre, rising
              { x: 0, y: targetY },                    // bridge text centre
            ],
            curviness: 2,
          },
          duration: 1,
          ease: "none",
        },
        0
      );

      // Scale shrinks concurrently with its own easing
      heroTl.fromTo(primary,
        { scale: 1, opacity: 1, filter: "none" },
        { scale: 0.2, duration: 1, ease: "power1.in" },
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
    });

    ctxRef.current = ctx;
  }, []);

  useEffect(() => {
    initGSAP();
    return () => {
      ctxRef.current?.revert();
    };
  }, [initGSAP]);

  const constellationPositions = [
    { x: -180, y: -90, size: 0.6 },
    { x: 120, y: -140, size: 0.8 },
    { x: -80, y: 60, size: 0.5 },
    { x: 200, y: 30, size: 0.7 },
    { x: -150, y: 120, size: 0.55 },
    { x: 50, y: 150, size: 0.65 },
    { x: -30, y: -160, size: 0.45 },
  ];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 2,
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

      {/* ═══ FRAGMENT ORBS — Sort fracture (4, one per stat) ═══ */}
      <div ref={fragmentsRef} className="absolute inset-0 pointer-events-none">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="orb-fragment absolute pointer-events-none"
            style={{
              width: "160px",
              height: "160px",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              willChange: "transform, opacity",
            }}
          >
            <FullOrb src="/orb-mini.png" offset={i + 1} />
          </div>
        ))}
      </div>

      {/* ═══ SATELLITE 1 — Jessie (Founders) ═══ */}
      <div
        ref={satellite1Ref}
        className="absolute pointer-events-none orb-satellite"
        style={{
          top: "50%",
          left: "calc(50% - 120px)",
          width: "min(40vh, 50vw)",
          height: "min(40vh, 50vw)",
          transform: "translateY(-50%)",
          willChange: "transform, opacity",
        }}
      >
        <FullOrb src="/orb-hero.png" offset={1} />
      </div>

      {/* ═══ SATELLITE 2 — Calvin (Founders) ═══ */}
      <div
        ref={satellite2Ref}
        className="absolute pointer-events-none orb-satellite"
        style={{
          top: "50%",
          left: "calc(50% + 120px)",
          width: "min(40vh, 50vw)",
          height: "min(40vh, 50vw)",
          transform: "translateY(-50%)",
          willChange: "transform, opacity",
        }}
      >
        <FullOrb src="/orb-hero.png" offset={2} />
      </div>

      {/* ═══ CONSTELLATION — Leaders (7 mini orbs) ═══ */}
      <div
        ref={constellationRef}
        className="absolute pointer-events-none"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "500px",
          height: "400px",
        }}
      >
        {constellationPositions.map((pos, i) => (
          <div
            key={i}
            className="mini-orb absolute"
            style={{
              left: `calc(50% + ${pos.x}px)`,
              top: `calc(50% + ${pos.y}px)`,
              width: `${120 * pos.size}px`,
              height: `${120 * pos.size}px`,
              transform: "translate(-50%, -50%)",
              willChange: "transform, opacity",
            }}
          >
            <FullOrb src="/orb-mini.png" offset={i + 3} />
          </div>
        ))}
      </div>
    </div>
  );
}
