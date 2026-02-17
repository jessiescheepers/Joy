"use client";

import { useEffect, useRef } from "react";

/**
 * ContactOrb — the merged orb leaves "you" in #closer, curves left while
 * shrinking, and lands on the Joy logo dot in #contact, replacing the
 * simple breathing dot with the full multi-layer orb.
 *
 * Scroll-driven. All positions in viewport coords each frame.
 */
export default function ContactOrb() {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);

  const SIZE = 52;
  const TARGET_SIZE = 16;
  const timings = { glow: 5.8, heart: 5.4, breathe: 5.5, rotate: 100 };

  useEffect(() => {
    const container = containerRef.current;
    const orb = orbRef.current;
    if (!container || !orb) return;

    let scrollRafId = 0;
    let hasEntered = false;
    const half = SIZE / 2;

    const bezier = (t: number, p0: number, p1: number, p2: number, p3: number) => {
      const u = 1 - t;
      return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
    };

    const resetToHidden = () => {
      hasEntered = false;
      orb.style.opacity = "0";
      orb.style.transform = "";

      // Restore original section-orb, hide replacement
      document.querySelectorAll(".contact-section-orb").forEach(el => {
        (el as HTMLElement).style.opacity = "";
      });
      document.querySelectorAll(".contact-orb-replacement").forEach(el => {
        (el as HTMLElement).style.opacity = "0";
      });

      // Reveal CloserOrb merged orb — remove class AND clear forced inline opacity
      document.querySelectorAll(".closer-merged-orb").forEach(el => {
        const htmlEl = el as HTMLElement;
        htmlEl.classList.remove("closer-orb-hidden-for-contact");
        htmlEl.style.opacity = "";
      });
    };

    const checkScroll = () => {
      const contactSection = document.querySelector("#contact") as HTMLElement;
      if (!contactSection) return;

      const vh = window.innerHeight;

      // Scroll-from-bottom: guarantees animation completes at page bottom
      const scrollable = document.documentElement.scrollHeight - vh;
      const scrollFromBottom = Math.max(0, scrollable - window.scrollY);
      const START_DIST = 350; // px from bottom when animation begins
      const END_DIST = 30;    // px from bottom when animation completes
      const progress = Math.max(0, Math.min(1,
        (START_DIST - scrollFromBottom) / (START_DIST - END_DIST)
      ));

      // Activate once CloserOrb has landed at "you", OR closer section scrolled past
      const closerLanded = !!document.querySelector(".closer-orb-at-rest");
      const closerEl = document.querySelector("#closer") as HTMLElement;
      const closerPast = closerEl ? closerEl.getBoundingClientRect().top < vh * 0.2 : false;
      const isActive = progress > 0 && (closerLanded || closerPast);

      if (isActive) {
        if (!hasEntered) {
          hasEntered = true;
        }

        // Force-hide CloserOrb merged every frame (belt-and-suspenders)
        document.querySelectorAll(".closer-merged-orb").forEach(el => {
          const htmlEl = el as HTMLElement;
          htmlEl.classList.add("closer-orb-hidden-for-contact");
          htmlEl.style.opacity = "0";
        });

        const secRect = contactSection.getBoundingClientRect();

        // Start: "you" word in #closer
        const closerSection = document.querySelector("#closer") as HTMLElement;
        const youSpan = closerSection?.querySelector(".closer-orb-target") as HTMLElement;
        let startVpX = secRect.left + secRect.width * 0.5;
        let startVpY = secRect.top - 50;
        if (youSpan) {
          const youRect = youSpan.getBoundingClientRect();
          startVpX = youRect.left + youRect.width / 2;
          startVpY = youRect.top + youRect.height / 2;
        }

        // End: section-orb dot above Joy logo
        const sectionOrb = contactSection.querySelector(".contact-section-orb") as HTMLElement;
        let endVpX = secRect.left + secRect.width / 2 + 50;
        let endVpY = secRect.top + 80;
        if (sectionOrb) {
          const dotRect = sectionOrb.getBoundingClientRect();
          endVpX = dotRect.left + dotRect.width / 2;
          endVpY = dotRect.top + dotRect.height / 2;
        }

        // Bézier path curving LEFT
        const cp1X = Math.min(startVpX, endVpX) - 120;
        const cp1Y = startVpY + (endVpY - startVpY) * 0.35;
        const cp2X = endVpX - 50;
        const cp2Y = startVpY + (endVpY - startVpY) * 0.75;

        const vpX = bezier(progress, startVpX, cp1X, cp2X, endVpX);
        const vpY = bezier(progress, startVpY, cp1Y, cp2Y, endVpY);

        // Scale: shrink from 1.0 → TARGET_SIZE/SIZE
        const curScale = 1 + (TARGET_SIZE / SIZE - 1) * progress;

        // Hide section-orb immediately — only one orb visible at a time
        if (sectionOrb) sectionOrb.style.opacity = "0";

        if (progress >= 0.92) {
          // Arrived: hide traveling orb, show replacement
          orb.style.opacity = "0";
          const replacement = document.querySelector(".contact-orb-replacement") as HTMLElement;
          if (replacement) replacement.style.opacity = "1";
        } else {
          // Traveling: show orb, hide replacement
          orb.style.left = (vpX - secRect.left - half) + "px";
          orb.style.top = (vpY - secRect.top - half) + "px";
          orb.style.transform = `scale(${curScale})`;
          orb.style.opacity = "0.85";
          const replacement = document.querySelector(".contact-orb-replacement") as HTMLElement;
          if (replacement) replacement.style.opacity = "0";
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

  const renderOrb = () => (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div className="absolute" style={{
        inset: "-120%",
        background: "radial-gradient(circle, rgba(212,165,116,0.40) 0%, rgba(212,165,116,0.12) 40%, transparent 65%)",
        filter: "blur(20px)",
        animation: `hero-orb-glow-swell ${timings.glow}s ease-in-out infinite`,
      }} />
      <div className="absolute" style={{
        inset: "-20%",
        background: "radial-gradient(circle at 50% 40%, rgba(224,140,120,1) 0%, rgba(200,110,90,0.5) 35%, transparent 70%)",
        filter: "blur(10px) brightness(1.4)",
        animation: `hero-orb-heart ${timings.heart}s ease-in-out infinite`,
        mixBlendMode: "screen",
      }} />
      <div style={{ width: "100%", height: "100%", animation: `hero-orb-breathe ${timings.breathe}s ease-in-out infinite` }}>
        <div style={{ width: "100%", height: "100%", animation: `hero-orb-rotate ${timings.rotate}s ease-in-out infinite` }}>
          <img src="/orb-hero.png" alt="" style={{
            width: "100%", height: "100%", objectFit: "contain",
            opacity: 0.85, mixBlendMode: "screen",
            WebkitMaskImage: "radial-gradient(circle, black 30%, transparent 68%)",
            maskImage: "radial-gradient(circle, black 30%, transparent 68%)",
          }} />
        </div>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
      <div ref={orbRef} className="absolute" style={{ width: SIZE, height: SIZE, opacity: 0 }}>
        {renderOrb()}
      </div>
    </div>
  );
}
