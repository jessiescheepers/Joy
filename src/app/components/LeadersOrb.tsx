"use client";

import { useEffect, useRef } from "react";

/**
 * Standalone orb for the B2B "For Leaders" section.
 * No GSAP — uses requestAnimationFrame for a smooth curve animation.
 *
 * The orb is always position:absolute within #leaders. Animation
 * interpolates section-relative coords from the main orb's position
 * to bottom:3%, left:5%. Because positions are section-relative,
 * scroll doesn't cause drift — the orb naturally moves with the section.
 *
 * Only 1 orb visible at any time.
 */
export default function LeadersOrb() {
  const orbRef = useRef<HTMLDivElement>(null);

  const glowDur = 5.8;
  const heartDur = 5.6;
  const driftDur = 12.4;
  const breatheDur = 5.7;
  const rotateDur = 120;

  useEffect(() => {
    const el = orbRef.current;
    if (!el) return;

    let hasEntered = false;
    let animRafId = 0;
    let scrollRafId = 0;

    const resetToHidden = () => {
      cancelAnimationFrame(animRafId);
      el.classList.remove("leaders-orb-at-rest");
      el.style.left = "5%";
      el.style.top = "";
      el.style.bottom = "3%";
      el.style.zIndex = "0";
      el.style.opacity = "0";
      el.style.transform = "";
    };

    // Easing: cubic ease-in-out
    const ease = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const checkScroll = () => {
      const sortSection = document.querySelector("#sort") as HTMLElement;
      if (!sortSection) return;

      const sortRect = sortSection.getBoundingClientRect();
      const vh = window.innerHeight;
      const shouldBeActive = sortRect.bottom < vh * 0.40;
      const mainOrb = document.querySelector(".orb-primary") as HTMLElement;

      if (shouldBeActive && !hasEntered) {
        hasEntered = true;
        if (!mainOrb) return;

        const section = document.querySelector("#leaders") as HTMLElement;
        if (!section) return;
        const secRect = section.getBoundingClientRect();

        // ── Main orb's position in section-relative coords ──
        const mainRect = mainOrb.getBoundingClientRect();
        const mainCx = mainRect.left + mainRect.width / 2;
        const mainCy = mainRect.top + mainRect.height / 2;
        const startScale = mainRect.width / 260;

        const startLeft = mainCx - 130 - secRect.left;
        const startTop = mainCy - 130 - secRect.top;

        // ── Rest position: left 5%, bottom 3% in section-relative px ──
        const endLeft = secRect.width * 0.05;
        const endTop = secRect.height * 0.97 - 260;

        // ── Hide main orb ──
        mainOrb.classList.add("orb-primary-hidden");

        // ── Set initial position (absolute, matching main orb exactly) ──
        el.style.left = startLeft + "px";
        el.style.top = startTop + "px";
        el.style.bottom = "auto";
        el.style.opacity = "0.6";
        el.style.transform = `scale(${startScale})`;

        // ── Animate via rAF — section-relative, no scroll drift ──
        const duration = 1600;
        const startTime = performance.now();

        // Cubic Bézier: orb swings far left first (clear of centered text),
        // then curves down to rest position at bottom-left.
        // CP1: far left, slightly above start — pulls orb leftward immediately
        const cp1Left = endLeft;
        const cp1Top = startTop - 20;
        // CP2: at rest X, ~40% of the way down — guides the descent
        const cp2Left = endLeft - secRect.width * 0.02;
        const cp2Top = startTop + (endTop - startTop) * 0.55;

        const tick = (now: number) => {
          const rawT = Math.min((now - startTime) / duration, 1);
          const t = ease(rawT);

          // Cubic Bézier: start → cp1 → cp2 → end
          const u = 1 - t;
          const curLeft = u*u*u*startLeft + 3*u*u*t*cp1Left + 3*u*t*t*cp2Left + t*t*t*endLeft;
          const curTop = u*u*u*startTop + 3*u*u*t*cp1Top + 3*u*t*t*cp2Top + t*t*t*endTop;
          const curScale = startScale + (1 - startScale) * t;
          const curOpacity = 0.6 + 0.25 * t;

          el.style.left = curLeft + "px";
          el.style.top = curTop + "px";
          el.style.transform = `scale(${curScale})`;
          el.style.opacity = curOpacity.toString();

          if (rawT < 1) {
            animRafId = requestAnimationFrame(tick);
          } else {
            // Snap to CSS percentage values for responsiveness
            el.style.left = "5%";
            el.style.top = "";
            el.style.bottom = "3%";
            el.style.transform = "scale(1)";
            el.style.opacity = "0.85";
            el.classList.add("leaders-orb-at-rest");
          }
        };

        animRafId = requestAnimationFrame(tick);
      } else if (!shouldBeActive && hasEntered) {
        hasEntered = false;
        resetToHidden();
        if (mainOrb) mainOrb.classList.remove("orb-primary-hidden");
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
      cancelAnimationFrame(animRafId);
    };
  }, []);

  return (
    <div
      ref={orbRef}
      className="absolute pointer-events-none"
      style={{
        bottom: "3%",
        left: "5%",
        width: 260,
        height: 260,
        zIndex: 0,
        opacity: 0,
      }}
    >
      {/* ═══ Heart glow — 140vw, expands AFTER orb reaches rest ═══ */}
      <div
        className="leaders-glow-expand"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "140vw",
          height: "140vw",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(200,110,90,0.50) 0%, rgba(212,140,100,0.35) 10%, rgba(212,165,116,0.22) 22%, rgba(200,150,100,0.12) 38%, rgba(190,140,95,0.05) 55%, rgba(180,130,90,0.02) 70%, transparent 88%)",
            filter: "blur(80px)",
            mixBlendMode: "screen",
            animation: `hero-orb-heart ${heartDur}s ease-in-out infinite`,
          }}
        />
      </div>

      {/* ═══ 5-layer orb stack ═══ */}
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
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
        <div
          style={{
            width: "100%",
            height: "100%",
            animation: `hero-orb-drift ${driftDur}s ease-in-out infinite`,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              animation: `hero-orb-breathe ${breatheDur}s ease-in-out infinite`,
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                animation: `hero-orb-rotate ${rotateDur}s ease-in-out infinite`,
              }}
            >
              <img
                src="/orb-hero.png"
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  opacity: 0.85,
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
      </div>
    </div>
  );
}
