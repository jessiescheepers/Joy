"use client";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

import { useState, useEffect, useRef } from "react";
import JoyLogo from "./components/JoyLogo";

export default function Home() {
  const [activeSection, setActiveSection] = useState<"home" | "glow" | "about" | "contact">("home");

  const [glowExpanded, setGlowExpanded] = useState(false);
  const [glowName, setGlowName] = useState("");

  // Waitlist form state
  const [formEmail, setFormEmail] = useState("");
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "joined" | "error">("idle");
  const [formError, setFormError] = useState<string | null>(null);

  // Section refs for intersection observer
  const heroRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);

  // Intersection observer for active nav
  useEffect(() => {
    const visibleSections = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visibleSections.add(entry.target.id);
          else visibleSections.delete(entry.target.id);
        });
        if (visibleSections.has("contact")) setActiveSection("contact");
        else if (visibleSections.has("about")) setActiveSection("about");
        else if (visibleSections.has("glow")) setActiveSection("glow");
        else if (visibleSections.has("hero")) setActiveSection("home");
      },
      { threshold: 0.2 }
    );
    [heroRef, glowRef, aboutRef, contactRef].forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });
    return () => observer.disconnect();
  }, []);

  // Listen for glow iframe requesting fullscreen (on name submit)
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "glow-fullscreen") {
        if (e.data.name) setGlowName(e.data.name);
        setGlowExpanded(true);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Nav item: orb image + label
  const navItems: { id: "home" | "glow" | "about" | "contact"; label: string; href: string; orb: string }[] = [
    { id: "home", label: "home", href: "#hero", orb: "/images/orbs/orb-home.png" },
    { id: "glow", label: "glow", href: "#glow", orb: "/images/orbs/orb-glow.png" },
    { id: "about", label: "about", href: "#about", orb: "/images/orbs/orb-about.png" },
    { id: "contact", label: "contact", href: "#contact", orb: "/images/orbs/orb-contact.png" },
  ];

  const footerItems = [
    { label: "privacy policy", href: "/privacy-policy.pdf", orb: "/images/orbs/orb-privacy.png", external: true },
    { label: "linkedin", href: "https://www.linkedin.com/company/feeljoy/", orb: "/images/orbs/orb-linkedin.png", external: true },
    { label: "joy code", href: "/joy-code", orb: "/images/orbs/orb-joycode.png", external: false },
    { label: "waitlist", href: "#hero", orb: "/images/orbs/orb-waitlist.png", external: false },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Full-page watercolour background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url(/images/watercolour-bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Orb background — enlarged, from left, 30% opacity, fills ~85% of page */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: "50%",
          left: "0",
          transform: "translate(-50%, -50%)",
          width: "240vw",
          height: "240vw",
          opacity: 0.3,
          zIndex: 1,
          backgroundImage: "url(/images/orb-bg.png)",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          maskImage: "radial-gradient(circle, black 40%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle, black 40%, transparent 70%)",
        }}
      />
      <div className="noise-overlay fixed inset-0 z-[2]" />

      {/* Page content */}
      <div className="relative z-[3]">

        {/* ═══ TOP NAV ═══ */}
        <nav
          className="sticky top-0 z-50 px-6 py-4 md:px-12 lg:px-20"
          style={{ background: "transparent" }}
        >
          <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className="flex items-center gap-2 md:gap-3 transition-all duration-300 hover:opacity-70"
                  style={{ fontFamily: "var(--font-literata)" }}
                >
                  <img
                    src={item.orb}
                    alt=""
                    className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 rounded-full object-cover orb-spin"
                  />
                  <span
                    className={`text-sm md:text-lg lg:text-xl tracking-[0.8px] text-black ${
                      isActive ? "italic" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                </a>
              );
            })}
          </div>
        </nav>

        {/* ═══ HERO SECTION ═══ */}
        <section
          id="hero"
          ref={heroRef}
          className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center -mt-[100px]"
        >
        <div className="w-full max-w-[500px] mx-auto flex flex-col items-center">
          {/* Joy Logo */}
          <div className="mb-8 md:mb-12">
            <JoyLogo width={160} height={84} />
          </div>

          {/* H1 */}
          <h1
            className="text-[24px] md:text-[38px] lg:text-[50px] leading-[1.12] tracking-[0.8px] mb-6 md:mb-8 text-black"
            style={{ fontFamily: "var(--font-cooper)", fontWeight: 800 }}
          >
            build better days;<br />at work and in life
          </h1>

          {/* Sub-text — Cooper Hewitt Book (400), 28px, black */}
          <p
            className="text-[12px] md:text-[18px] lg:text-[24px] lg:leading-[30px] leading-[1.2] tracking-[1px] mb-5 md:mb-8 text-black"
            style={{ fontFamily: "var(--font-cooper)", fontWeight: 400 }}
          >
            Your energy is finite.<br />Joy gives your brain one place to think.
          </p>

          {/* Waitlist form */}
          <form
            id="waitlist"
            className="flex flex-col sm:flex-row items-center gap-3 mb-[36px]"
            onSubmit={async (e) => {
              e.preventDefault();
              if (formStatus === "submitting" || formStatus === "joined") return;
              setFormStatus("submitting");
              setFormError(null);
              try {
                const res = await fetch("/api/waitlist", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: formEmail }),
                });
                const data = await res.json();
                if (!res.ok) {
                  setFormError(data.error || "Something went wrong");
                  setFormStatus("error");
                  return;
                }
                setFormStatus("joined");
                setFormEmail("");
                if (typeof window !== "undefined" && typeof window.gtag === "function") {
                  window.gtag("event", "waitlist_signup", {
                    email_domain: formEmail.split("@")[1] || "",
                  });
                }
              } catch {
                setFormError("Something went wrong. Please try again.");
                setFormStatus("error");
              }
            }}
          >
            <div className="w-full sm:flex-1 min-w-0 shimmer-border">
              <input
                type="email"
                placeholder="your email"
                value={formEmail}
                onChange={(e) => { setFormEmail(e.target.value); if (formStatus === "error") setFormStatus("idle"); }}
                required
                className="w-full px-4 py-2.5 bg-white/50 rounded-[15px] text-base md:text-lg tracking-wide text-[#272682] placeholder:text-[rgba(39,38,130,0.5)] outline-none"
                style={{ fontFamily: "var(--font-cooper)" }}
              />
            </div>
            <button
              type="submit"
              disabled={formStatus === "submitting" || formStatus === "joined"}
              className={`w-full sm:w-auto shrink-0 px-6 py-2.5 rounded-[15px] text-base md:text-lg tracking-[2px] lowercase transition-opacity btn-shimmer ${
                formStatus === "joined" ? "opacity-70 cursor-default" : formStatus === "submitting" ? "opacity-70 cursor-wait" : "hover:opacity-80 cursor-pointer"
              }`}
              style={{
                fontFamily: "var(--font-cooper)",
                fontWeight: 700,
                backgroundColor: "rgba(255, 255, 255, 0.045)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
                color: "#000000",
              }}
            >
              {formStatus === "submitting" ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </span>
              ) : formStatus === "joined" ? "joined!" : "early access"}
            </button>
          </form>
          {formError && (
            <p className="text-red-600 text-sm mb-2">{formError}</p>
          )}

          {/* CTA sub-text — Cooper Hewitt Book (400), 22px */}
          <p
            className="text-[10px] md:text-[14px] lg:text-[20px] leading-[28px] tracking-[1.5px] lowercase text-black"
            style={{ fontFamily: "var(--font-cooper)", fontWeight: 400 }}
          >
            be the first in line to build better days
          </p>
        </div>
        </section>

        {/* ═══ GLOW SECTION ═══ */}
        <section
          id="glow"
          ref={glowRef}
          className="min-h-screen flex flex-col justify-center px-6 py-16 md:px-12 lg:px-20"
        >
          {/* H2 — full width, top of section */}
          <h2
            className="text-[28px] md:text-[50px] lg:text-[60px] leading-[1.12] tracking-[0.8px] mb-[20px] text-black"
            style={{ fontFamily: "var(--font-cooper)", fontWeight: 800 }}
          >
            check in with yourself
          </h2>

          {/* Two columns — text left, interaction right */}
          <div className="flex flex-col lg:flex-row items-center lg:items-start lg:justify-between gap-10 lg:gap-20 w-full" style={{ paddingRight: "50px" }}>
            {/* Left column — paragraph, same width as H2 */}
            <div className="flex flex-col justify-center" style={{ maxWidth: "500px" }}>
              <div
                className="text-[12px] md:text-[14px] lg:text-[18px] leading-[1.75] tracking-[1px] text-black"
                style={{ fontFamily: "var(--font-literata)", fontWeight: 400 }}
              >
                <p className="mb-6 md:mb-8">
                  When was the last time you checked in with yourself?
                </p>
                <p className="mb-6 md:mb-8">
                  Not your inbox. Not your calendar. You.<br />
                  Your Daily Glow takes 30 seconds and shows you what&apos;s in the tank. Energy, mood, stress, the whole picture.
                </p>
                <p>
                  See how you&apos;re really doing today.
                </p>
              </div>
            </div>

            {/* Right column — single iframe container, CSS toggles inline↔fullscreen */}
            <div
              className={glowExpanded
                ? "fixed inset-0 z-[100]"
                : "flex-shrink-0 relative lg:-mt-[80px] w-[280px] h-[480px] md:w-[340px] lg:w-[380px] rounded-[24px] overflow-hidden shimmer-border"
              }
              style={glowExpanded
                ? { backgroundImage: "url(/images/glow-fullscreen-bg.png)", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }
                : { boxShadow: "0px 4px 60px rgba(0, 0, 0, 0.25)", padding: 3 }
              }
            >
              {/* Fullscreen header */}
              {glowExpanded && (
                <div className="flex flex-col items-center py-1">
                  <JoyLogo width={70} height={37} />
                  <p className="text-[16px] md:text-[20px] tracking-[1px] text-black" style={{ fontFamily: "var(--font-cooper)", fontWeight: 800 }}>
                    daily glow
                  </p>
                </div>
              )}

              {/* Single iframe — same element, CSS resizes it */}
              <iframe
                src="/glow/index.html"
                scrolling="no"
                title="Daily Glow interactive experience"
                className={glowExpanded
                  ? "border-0 mx-auto block"
                  : "w-[320px] h-[500px] md:w-[380px] lg:w-[420px] border-0 rounded-[22px]"
                }
                style={glowExpanded
                  ? { overflow: "hidden", background: "transparent", width: "min(100vw, 480px)", height: "calc(100dvh - 70px)", display: "block" }
                  : { overflow: "hidden", display: "block", marginLeft: -23, marginTop: -13 }
                }
              />

              {/* Close button */}
              {glowExpanded && (
                <button
                  onClick={() => setGlowExpanded(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-white/80 transition-colors cursor-pointer btn-shimmer"
                  style={{ position: "absolute", top: 12, right: 12, zIndex: 101 }}
                  title="Close fullscreen"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 5L5 15M5 5l10 10" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ═══ ABOUT SECTION ═══ */}
        <section
          id="about"
          ref={aboutRef}
          className="min-h-screen flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-start gap-10 lg:gap-20 px-6 py-16 md:px-12 lg:px-20"
        >
          {/* Left column — founder pic + caption */}
          <div className="flex flex-col items-center lg:items-start w-full lg:w-[50%]">
            <img
              src="/images/founder.png"
              alt="Jessie Scheepers, Founder"
              className="w-[80%] h-auto object-contain"
            />
            <p
              className="mt-4 w-[80%] text-center text-[12px] md:text-[14px] lg:text-[16px] tracking-[0.8px] text-black/70"
              style={{ fontFamily: "var(--font-literata)", fontStyle: "italic" }}
            >
              Joy is the product we wish existed earlier.
            </p>
          </div>

          {/* Right column — H1 + body */}
          <div className="flex flex-col justify-center" style={{ maxWidth: "500px" }}>
            <h2
              className="text-[28px] md:text-[50px] lg:text-[60px] leading-[1.12] tracking-[0.8px] mb-[20px] text-black"
              style={{ fontFamily: "var(--font-cooper)", fontWeight: 800 }}
            >
              days designed around you
            </h2>
            <div
              className="text-[12px] md:text-[14px] lg:text-[18px] leading-[1.75] tracking-[1px] text-black"
              style={{ fontFamily: "var(--font-literata)", fontWeight: 400 }}
            >
              <p className="mb-6 md:mb-8">
                At work, your friends message you about dinner. At home, you&apos;re thinking about a deadline while making dinner. You&apos;re one person living both at once, and it costs more energy than you realise.
              </p>
              <p className="mb-6 md:mb-8">
                Joy brings work and life into one space, checks in on how you&apos;re doing, and helps you build a day that matches. The energy you get back is yours. Take up pottery. Dream up a product feature.
              </p>
              <p>
                Or just be present on the couch instead of zoning out on it.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ CONTACT SECTION ═══ */}
        <section
          id="contact"
          ref={contactRef}
          className="min-h-[50vh] flex flex-col items-center justify-center px-6 py-16 pb-[300px] md:px-12 lg:px-20 text-center"
        >
          <div className="mb-8 md:mb-12">
            <JoyLogo width={160} height={84} />
          </div>
          <h2
            className="font-[800] text-3xl md:text-5xl lg:text-6xl leading-tight tracking-wide mb-8 md:mb-12 text-black"
            style={{ fontFamily: "var(--font-cooper)" }}
          >
            get in touch
          </h2>
          <p
            className="text-[12px] md:text-[14px] lg:text-[18px] leading-[1.75] tracking-[1px] text-black max-w-[500px]"
            style={{ fontFamily: "var(--font-literata)", fontWeight: 400 }}
          >
            Joy is early and being built in the open. If you have thoughts, questions, or feedback, we&apos;d love to hear from you.
            <br />
            <a href="mailto:hello@feeljoy.ai" className="underline hover:opacity-70 transition-opacity" style={{ fontFamily: "var(--font-cooper)" }}>
              hello@feeljoy.ai
            </a>
          </p>
        </section>

      </div>

      {/* ═══ FOOTER — fixed at bottom ═══ */}
      <footer
        className={`fixed bottom-0 left-0 right-0 z-[4] px-6 py-4 md:px-12 lg:px-20 transition-opacity duration-300 ${glowExpanded ? "opacity-0 pointer-events-none" : ""}`}
        style={{ background: "transparent" }}
      >
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-center gap-6 md:gap-10 lg:justify-between">
          {footerItems.slice(0, 2).map((item) => (
            <a
              key={item.label}
              href={item.href}
              {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="flex items-center gap-2 md:gap-3 hover:opacity-70 transition-opacity"
              style={{ fontFamily: "var(--font-literata)" }}
            >
              <img
                src={item.orb}
                alt=""
                className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 rounded-full object-cover orb-spin"
              />
              <span className="text-sm md:text-lg lg:text-xl tracking-[0.8px] text-black">
                {item.label}
              </span>
            </a>
          ))}

          {/* Center Joy logo — visible on Glow and About only */}
          <div
            className={`transition-opacity duration-300 ${
              activeSection === "glow" || activeSection === "about" ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <JoyLogo width={60} height={32} />
          </div>

          {footerItems.slice(2).map((item) => (
            <a
              key={item.label}
              href={item.href}
              {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="flex items-center gap-2 md:gap-3 hover:opacity-70 transition-opacity"
              style={{ fontFamily: "var(--font-literata)" }}
            >
              <img
                src={item.orb}
                alt=""
                className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 rounded-full object-cover orb-spin"
              />
              <span className="text-sm md:text-lg lg:text-xl tracking-[0.8px] text-black">
                {item.label}
              </span>
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
