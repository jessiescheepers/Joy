"use client";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

import { useState, useEffect, useRef } from "react";
import JoyLogo from "./components/JoyLogo";

export default function Home() {
  const [activeSection, setActiveSection] = useState<string>("home");
  const [glowExpanded, setGlowExpanded] = useState(false);
  const [glowName, setGlowName] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobile(window.matchMedia("(max-width: 768px)").matches);
  }, []);

  // Waitlist form state
  const [formEmail, setFormEmail] = useState("");
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "joined" | "error">("idle");
  const [formError, setFormError] = useState<string | null>(null);

  // Section refs for intersection observer
  const heroRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLElement>(null);
  const howRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);

  // Experimental interaction refs
  const auroraRef = useRef<HTMLDivElement>(null);
  const scrollBarRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const heroOrbsRef = useRef<HTMLDivElement>(null);
  const glowCardRef = useRef<HTMLDivElement>(null);
  const glowAuraRef = useRef<HTMLDivElement>(null);

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
        else if (visibleSections.has("how")) setActiveSection("how");
        else if (visibleSections.has("glow")) setActiveSection("glow");
        else if (visibleSections.has("hero")) setActiveSection("home");
      },
      { threshold: 0.2 }
    );
    [heroRef, glowRef, howRef, aboutRef, contactRef].forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });
    return () => observer.disconnect();
  }, []);

  // Scroll-triggered reveals
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    document.querySelectorAll(".reveal-section").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
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

  // Cursor aurora + hero orb parallax (desktop only)
  useEffect(() => {
    if (isMobile) return;
    const handleMouse = (e: MouseEvent) => {
      if (auroraRef.current) {
        auroraRef.current.style.transform = `translate(${e.clientX - 300}px, ${e.clientY - 300}px)`;
      }
      if (heroOrbsRef.current) {
        const px = (e.clientX / window.innerWidth - 0.5) * 2;
        const py = (e.clientY / window.innerHeight - 0.5) * 2;
        heroOrbsRef.current.style.transform = `translate(${px * 20}px, ${py * 15}px)`;
      }
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [isMobile]);

  // Scroll progress bar
  useEffect(() => {
    const handleScroll = () => {
      if (scrollBarRef.current) {
        const progress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        scrollBarRef.current.style.transform = `scaleX(${Math.min(progress, 1)})`;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems: { id: string; label: string; href: string }[] = [
    { id: "home", label: "home", href: "#hero" },
    { id: "glow", label: "glow", href: "#glow" },
    { id: "how", label: "how it works", href: "#how" },
    { id: "about", label: "about", href: "#about" },
    { id: "contact", label: "contact", href: "#contact" },
  ];

  const footerItems = [
    { label: "privacy policy", href: "/privacy-policy.pdf", external: true },
    { label: "linkedin", href: "https://www.linkedin.com/company/feeljoy/", external: true },
    { label: "joy code", href: "/joy-code", external: false },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Cursor aurora — ambient glow following mouse (desktop only) */}
      {!isMobile && <div ref={auroraRef} className="cursor-aurora" />}

      {/* Scroll progress indicator */}
      <div ref={scrollBarRef} className="scroll-progress" style={{ transform: "scaleX(0)" }} />

      {/* Noise overlay */}
      <div className="noise-overlay fixed inset-0 z-[2]" />

      {/* Page content */}
      <div className="relative z-[3]">

        {/* ═══ TOP NAV — glass morphism ═══ */}
        <nav
          className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 h-16 flex items-center justify-between transition-opacity duration-300 ${glowExpanded ? "opacity-0 pointer-events-none" : ""}`}
          style={{
            background: "rgba(8,11,20,0.6)",
            backdropFilter: "blur(40px) saturate(1.8)",
            WebkitBackdropFilter: "blur(40px) saturate(1.8)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {/* Logo left */}
          <a href="#hero" className="relative">
            <JoyLogo width={50} height={26} color="#FFFFFF" />
            <span
              className="absolute -top-0.5 -right-2.5 w-[7px] h-[7px] rounded-full"
              style={{
                background: "var(--glow-moon)",
                boxShadow: "0 0 12px var(--glow-moon), 0 0 30px rgba(250,248,232,0.3)",
                animation: "breathe 3s ease-in-out infinite",
              }}
            />
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6 md:gap-8">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={`nav-link text-xs md:text-sm tracking-wide transition-colors duration-300 ${
                    isActive ? "active text-[var(--text)]" : "text-[var(--text-secondary)] hover:text-[var(--text)]"
                  }`}
                  style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
                >
                  {item.label}
                </a>
              );
            })}
            <a
              href="#hero"
              className="px-5 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-300 hover:shadow-[0_0_30px_rgba(224,160,173,0.35)] relative overflow-hidden"
              style={{
                fontFamily: "var(--font-display)",
                background: "var(--text)",
                color: "var(--bg)",
              }}
            >
              early access
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="flex flex-col gap-[5px]">
              <span className={`block w-5 h-[1.5px] bg-white transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
              <span className={`block w-5 h-[1.5px] bg-white transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-[1.5px] bg-white transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
            </div>
          </button>
        </nav>

        {/* ═══ MOBILE MENU OVERLAY ═══ */}
        <div
          className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          style={{ background: "rgba(8,11,20,0.95)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)" }}
        >
          <div className="flex flex-col items-center justify-center h-full gap-8">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg tracking-wide transition-colors duration-300"
                style={{ fontFamily: "var(--font-display)", fontWeight: 300, color: activeSection === item.id ? "var(--text)" : "var(--text-secondary)" }}
              >
                {item.label}
              </a>
            ))}
            <a
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-4 px-7 py-3 rounded-full text-sm font-medium tracking-wide"
              style={{ fontFamily: "var(--font-display)", background: "var(--text)", color: "var(--bg)" }}
            >
              early access
            </a>
          </div>
        </div>

        {/* ═══ HERO SECTION ═══ */}
        <section
          id="hero"
          ref={heroRef}
          className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center relative overflow-hidden"
        >
          {/* Floating glow orbs — parallax wrapper (responds to mouse on desktop) */}
          <div
            ref={heroOrbsRef}
            className="absolute inset-0 pointer-events-none"
            style={{ transition: "transform 0.4s ease-out", willChange: "transform" }}
          >
            <div className="absolute rounded-full" style={{ width: 600, height: 600, background: "radial-gradient(circle, rgba(232,180,106,0.18) 0%, transparent 70%)", top: "10%", left: "-5%", filter: "blur(100px)", animation: "orbit1 20s ease-in-out infinite" }} />
            <div className="absolute rounded-full" style={{ width: 500, height: 500, background: "radial-gradient(circle, rgba(137,180,220,0.14) 0%, transparent 70%)", bottom: "5%", right: "-5%", filter: "blur(100px)", animation: "orbit2 25s ease-in-out infinite" }} />
            <div className="absolute rounded-full" style={{ width: 400, height: 400, background: "radial-gradient(circle, rgba(212,154,72,0.10) 0%, transparent 70%)", top: "40%", left: "50%", transform: "translateX(-50%)", filter: "blur(100px)", animation: "orbit3 18s ease-in-out infinite" }} />
          </div>

          <div className="w-full max-w-[900px] mx-auto flex flex-col items-center relative z-10">
            {/* Joy Logo — with breathing orb */}
            <div className="mb-[42px] md:mb-[54px] animate-hero-1 relative inline-flex">
              <JoyLogo width={80} height={42} color="#FFFFFF" />
              <span className="absolute -top-1.5 -right-3.5 w-3 h-3 section-orb" />
            </div>

            {/* H1 — Instrument Serif with gradient italic */}
            <h1
              className="tracking-[-0.03em] mb-0"
              style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(1.1rem, 2.8vw, 2.2rem)", letterSpacing: "-0.02em", lineHeight: "calc(1.02em + 5px)" }}
            >
              <span className="block animate-hero-1">You don&apos;t need more time.</span>
              <span className="block animate-hero-2">
                You need more <em className="text-gradient" style={{ fontStyle: "italic" }}>breathing space</em>.
              </span>
            </h1>

            {/* Waitlist form */}
            <form
              id="waitlist"
              className="animate-hero-cta flex flex-col sm:flex-row items-center gap-3 mt-[50px] w-full max-w-[420px]"
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
              <div className="w-full sm:flex-1 min-w-0">
                <input
                  type="email"
                  placeholder="your email"
                  value={formEmail}
                  onChange={(e) => { setFormEmail(e.target.value); if (formStatus === "error") setFormStatus("idle"); }}
                  required
                  className="w-full px-5 py-3.5 rounded-full text-sm md:text-base tracking-wide outline-none"
                  style={{
                    fontFamily: "var(--font-display)",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                  }}
                />
              </div>
              <button
                ref={ctaRef}
                type="submit"
                disabled={formStatus === "submitting" || formStatus === "joined"}
                className={`w-full sm:w-auto shrink-0 px-7 py-3.5 rounded-full text-sm md:text-base font-medium tracking-wide btn-magnetic ${
                  formStatus === "joined" ? "opacity-70 cursor-default" : formStatus === "submitting" ? "opacity-70 cursor-wait" : "cursor-pointer"
                }`}
                style={{
                  fontFamily: "var(--font-display)",
                  background: "var(--text)",
                  color: "var(--bg)",
                  border: "none",
                }}
                onMouseMove={(e) => {
                  if (!ctaRef.current || isMobile) return;
                  const rect = ctaRef.current.getBoundingClientRect();
                  const x = e.clientX - rect.left - rect.width / 2;
                  const y = e.clientY - rect.top - rect.height / 2;
                  ctaRef.current.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
                }}
                onMouseLeave={() => {
                  if (ctaRef.current) ctaRef.current.style.transform = '';
                }}
              >
                {formStatus === "submitting" ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </span>
                ) : formStatus === "joined" ? "joined!" : "get early access"}
              </button>
            </form>
            {formError && (
              <p className="text-red-400 text-sm mt-3">{formError}</p>
            )}

          </div>

          {/* Scroll cue */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10" style={{ opacity: 0, animation: "fade-in 1s ease forwards 1.8s" }}>
            <span className="text-[0.7rem] tracking-[0.15em] uppercase" style={{ color: "var(--text-tertiary)" }}>scroll</span>
            <div className="w-px h-8" style={{ background: "linear-gradient(to bottom, var(--text-tertiary), transparent)", animation: "scroll-pulse 2s ease-in-out infinite" }} />
          </div>
        </section>

        {/* ═══ GLOW SECTION ═══ */}
        <section
          id="glow"
          ref={glowRef}
          className="min-h-screen flex flex-col items-center justify-center px-6 py-24 md:px-12 lg:px-20 text-center"
          style={{ borderTop: "1px solid var(--border)" }}
          onMouseMove={(e) => {
            if (isMobile || glowExpanded || !glowCardRef.current || !glowAuraRef.current) return;
            const rect = glowCardRef.current.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
            const intensity = Math.max(0, 1 - dist / 500);
            glowAuraRef.current.style.opacity = (intensity * 0.5).toString();
          }}
        >
          {/* Centered text — invites you into the card */}
          <div className="max-w-[520px] mx-auto mb-12 md:mb-16 reveal-section">
            <h2
              className="leading-[1.1] tracking-[-0.025em] mb-6"
              style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(1rem, 2.5vw, 1.8rem)" }}
            >
              Check in with <em className="text-gradient-warm" style={{ fontStyle: "italic" }}>yourself</em>
            </h2>
            <p
              className="text-sm md:text-base leading-[1.75] tracking-wide"
              style={{ color: "var(--text-secondary)", fontWeight: 300 }}
            >
              When was the last time you actually checked in with yourself? Your Daily Glow takes ten seconds. Energy, stress, mood, capacity. A colour, not a score. See where you&apos;re really at, and let Joy sort your day around it.
              <br /><br />
              Share your Glow with the people who matter. Let your colleagues or loved ones know what kind of day you&apos;re having.
            </p>
          </div>

          {/* Fortune Teller Card — centered below text */}
          {glowExpanded ? (
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center" style={{ background: "var(--bg)" }}>
              <div className="flex flex-col items-center py-1 shrink-0">
                <JoyLogo width={70} height={37} color="#FFFFFF" />
                <p className="text-base md:text-lg tracking-wide" style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>
                  daily glow
                </p>
              </div>
              <iframe
                src={`/glow/index.html${glowName ? `?name=${encodeURIComponent(glowName)}` : ""}`}
                scrolling="no"
                title="Daily Glow interactive experience"
                className="border-0 mx-auto block"
                style={{ overflow: "hidden", background: "transparent", width: "min(90vw, 480px)", height: "min(calc(100dvh - 100px), 680px)", display: "block", borderRadius: 24 }}
              />
              <button
                onClick={() => {
                  setGlowExpanded(false);
                  // Re-trigger reveal animations on glow section after exiting fullscreen
                  setTimeout(() => {
                    document.querySelectorAll("#glow .reveal-section").forEach((el) => el.classList.add("visible"));
                  }, 50);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full transition-colors cursor-pointer"
                style={{ position: "absolute", top: 12, right: 12, zIndex: 101, background: "rgba(255,255,255,0.1)", border: "1px solid var(--border)" }}
                title="Close fullscreen"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5L5 15M5 5l10 10" stroke="#F5F0EA" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          ) : (
            <div className="relative reveal-section flex items-center justify-center">
              {/* Proximity aura */}
              <div
                ref={glowAuraRef}
                className="absolute pointer-events-none"
                style={{
                  inset: -80,
                  borderRadius: 60,
                  background: "radial-gradient(circle, rgba(232,180,106,0.2) 0%, rgba(212,160,168,0.08) 40%, transparent 70%)",
                  opacity: 0,
                  transition: "opacity 0.3s ease-out",
                }}
              />

              {/* Levitation wrapper */}
              <div style={{ animation: "levitate 6s ease-in-out infinite" }}>
                <div
                  ref={glowCardRef}
                  className="w-[280px] h-[480px] md:w-[340px] lg:w-[380px] rounded-[24px] holo-border"
                  onClick={isMobile ? () => setGlowExpanded(true) : undefined}
                  onMouseMove={(e) => {
                    if (isMobile || !glowCardRef.current) return;
                    const rect = glowCardRef.current.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width - 0.5;
                    const y = (e.clientY - rect.top) / rect.height - 0.5;
                    glowCardRef.current.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
                  }}
                  onMouseLeave={() => {
                    if (glowCardRef.current) glowCardRef.current.style.transform = "";
                  }}
                  style={{
                    padding: 3,
                    cursor: isMobile ? "pointer" : undefined,
                    transition: "transform 0.2s ease-out",
                    animation: "radiant-pulse 4s ease-in-out infinite",
                  }}
                >
                  <iframe
                    src="/glow/index.html"
                    scrolling="no"
                    title="Daily Glow interactive experience"
                    className="w-[320px] h-[500px] md:w-[380px] lg:w-[420px] border-0 rounded-[22px]"
                    style={{ overflow: "hidden", display: "block", marginLeft: -23, marginTop: -13, pointerEvents: isMobile ? "none" : undefined }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Nudge below card */}
          {!glowExpanded && (
            <p
              className="mt-10 text-xs md:text-sm tracking-wide reveal-section"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-tertiary)" }}
            >
              {isMobile ? "tap the card to begin" : "enter your name to begin"}
            </p>
          )}
        </section>

        {/* ═══ PROBLEM SECTION ═══ */}
        <section
          id="how"
          ref={howRef}
          className="py-24 md:py-32 px-6 md:px-12 lg:px-20"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div className="max-w-[700px] mx-auto text-center">
            <h2
              className="reveal-section leading-[1.1] tracking-[-0.025em] mb-8"
              style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(1rem, 2.5vw, 1.8rem)" }}
            >
              The problem isn&apos;t time. It&apos;s <em className="text-gradient" style={{ fontStyle: "italic" }}>capacity</em>.
            </h2>
            <div className="reveal-section text-sm md:text-base leading-[1.85] tracking-wide" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>
              <p className="mb-6">
                52% of the workforce reports feeling burnt out, yet 82% have no system for managing their day at all. Not at work. Not in life. Nowhere.
              </p>
              <p className="mb-6">
                And the tools that do exist only make it worse. Your calendar knows your meetings but not your energy. Your to-do list knows your tasks but not your limits. Nothing connects the two lives you&apos;re already living in one brain, one body, one day.
              </p>
              <p className="mb-6">
                So you overcommit. You context-switch. You push through. And the cost isn&apos;t just productivity. It&apos;s the things that actually matter: the side project that never starts, the workout that keeps slipping, the dinner you&apos;re at but not really present for.
              </p>
              <p>
                Joy is one system for work and life that builds around your capacity. It learns when you&apos;re stretched, adapts when you&apos;re not, and sorts your day so that what matters most gets your best energy. Not more planning. More breathing space.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ STATS SECTION ═══ */}
        <section
          className="py-24 md:py-32 px-6 md:px-12 lg:px-20"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div className="max-w-[900px] mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
              {[
                { stat: "82%", label: "of people have no system for managing their day at all" },
                { stat: "2.5h", label: "lost every day to context-switching between work and life" },
                { stat: "151h", label: "of focus lost every year to personal admin during work" },
                { stat: "52%", label: "of the workforce now reports feeling burnt out" },
              ].map((item, i) => (
                <div key={i} className="text-center reveal-section">
                  <p
                    className="text-gradient-warm mb-3"
                    style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.03em" }}
                  >
                    {item.stat}
                  </p>
                  <p
                    className="text-sm leading-[1.6] tracking-wide max-w-[240px] mx-auto"
                    style={{ color: "var(--text-secondary)", fontWeight: 300 }}
                  >
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS SECTION ═══ */}
        <section
          className="py-24 md:py-32 px-6 md:px-12 lg:px-20"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div className="max-w-[800px] mx-auto">
            <h2
              className="reveal-section text-center leading-[1.1] tracking-[-0.025em] mb-16"
              style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(1rem, 2.5vw, 1.8rem)" }}
            >
              How <em className="text-gradient-cool" style={{ fontStyle: "italic" }}>Joy</em> works
            </h2>
            <p
              className="reveal-section text-center text-sm md:text-base leading-[1.75] tracking-wide mb-16"
              style={{ color: "var(--text-secondary)", fontWeight: 300 }}
            >
              Joy doesn&apos;t add to your workload. It makes space for it.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-10">
              {[
                { step: "01 · Glow", heading: "Check in", body: "Each morning, Joy asks four quick questions: energy, load, mood, and stress. Ten seconds, and you have your Glow. Not a score, a colour. It shows you where you\u2019re at today, and sorts your day around your actual capacity." },
                { step: "02 · Sort", heading: "Sort your day", body: "Joy organises your day across work and life. In the flow? Joy leans you into it. Rough night? Joy lightens your day. One day, one system, sorted." },
                { step: "03 · Remind", heading: "Free up your mind", body: "Joy holds everything you need to remember so you don\u2019t have to. Tasks, deadlines, birthdays, all the things you carry around in your head. Less mental load, more breathing space." },
              ].map((item, i) => (
                <div key={i} className="reveal-section">
                  <span
                    className="block mb-4 text-gradient-warm"
                    style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "0.85rem", letterSpacing: "0.08em" }}
                  >
                    {item.step}
                  </span>
                  <h3
                    className="mb-3"
                    style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(0.95rem, 1.8vw, 1.15rem)", color: "var(--text)" }}
                  >
                    {item.heading}
                  </h3>
                  <p
                    className="text-sm leading-[1.75] tracking-wide"
                    style={{ color: "var(--text-secondary)", fontWeight: 300, whiteSpace: "pre-line" }}
                  >
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FOR WHO SECTION ═══ */}
        <section
          id="about"
          ref={aboutRef}
          className="py-24 md:py-32 px-6 md:px-12 lg:px-20"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div className="max-w-[800px] mx-auto">
            <h2
              className="reveal-section text-center leading-[1.1] tracking-[-0.025em] mb-16"
              style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(1rem, 2.5vw, 1.8rem)" }}
            >
              Built for <em className="text-gradient" style={{ fontStyle: "italic" }}>you</em>. Useful for everyone.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-12">
              <div className="reveal-section">
                <h3
                  className="mb-2"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(0.95rem, 1.8vw, 1.15rem)", color: "var(--text)" }}
                >
                  For you
                </h3>
                <p
                  className="text-gradient-warm mb-4"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(0.85rem, 1.5vw, 1rem)" }}
                >
                  Get your energy back
                </p>
                <p
                  className="text-sm leading-[1.85] tracking-wide"
                  style={{ color: "var(--text-secondary)", fontWeight: 300 }}
                >
                  One place for everything on your plate, work and life. Joy sorts your day around your capacity, so you build towards flow on good days and get supported on harder ones. Over time, you start to see your patterns and understand what helps you thrive.
                </p>
              </div>
              <div className="reveal-section">
                <h3
                  className="mb-2"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(0.95rem, 1.8vw, 1.15rem)", color: "var(--text)" }}
                >
                  For companies
                </h3>
                <p
                  className="text-gradient-warm mb-4"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(0.85rem, 1.5vw, 1rem)" }}
                >
                  Energised people. Real-time signal.
                </p>
                <p
                  className="text-sm leading-[1.85] tracking-wide"
                  style={{ color: "var(--text-secondary)", fontWeight: 300 }}
                >
                  When your people use Joy, they get their energy back. That means more creativity, sharper problem-solving, and higher engagement at work. And with Glow, you get an aggregated, anonymous daily signal on how your organisation is actually doing. Real-time, quantifiable data that shows you when you&apos;re thriving, and honest signal when things hit a speed wobble.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ ABOUT / VISION SECTION ═══ */}
        <section
          className="py-24 md:py-32 px-6 md:px-12 lg:px-20 relative"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {/* Subtle background glow */}
          <div className="absolute pointer-events-none" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 700, height: 400, background: "radial-gradient(ellipse, rgba(137,180,220,0.06) 0%, transparent 60%)" }} />
          <div className="max-w-[600px] mx-auto text-center relative z-10">
            <h2
              className="reveal-section leading-[1.1] tracking-[-0.025em] mb-8"
              style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(1rem, 2.5vw, 1.8rem)" }}
            >
              Joy&apos;s <em className="text-gradient-cool" style={{ fontStyle: "italic" }}>vision</em>
            </h2>
            <div className="reveal-section text-sm md:text-base leading-[1.85] tracking-wide" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>
              <p className="mb-6">
                Joy is here to end the stalemate between tired employees and under-pressure businesses. Not by asking people to do more, but by building a system around people that mirrors their daily capacity.
              </p>
              <p>
                A person is one being. Work and life happen in the same brain, the same body, the same 24 hours. It&apos;s time our tools reflected that.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ FINAL CTA SECTION ═══ */}
        <section
          className="py-24 md:py-32 px-6 md:px-12 lg:px-20 text-center relative"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div className="absolute pointer-events-none" style={{ top: 0, left: "50%", transform: "translateX(-50%)", width: 900, height: 500, background: "radial-gradient(ellipse, rgba(232,180,106,0.06) 0%, transparent 55%)" }} />
          <div className="max-w-[500px] mx-auto relative z-10">
            <h2
              className="reveal-section leading-[1.1] tracking-[-0.025em] mb-6"
              style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(1.1rem, 2.8vw, 2rem)" }}
            >
              Ready to build <em className="text-gradient-warm" style={{ fontStyle: "italic" }}>better days</em>?
            </h2>

            {/* Secondary waitlist form */}
            <form
              className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-[420px] mx-auto"
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
              <div className="w-full sm:flex-1 min-w-0">
                <input
                  type="email"
                  placeholder="your email"
                  value={formEmail}
                  onChange={(e) => { setFormEmail(e.target.value); if (formStatus === "error") setFormStatus("idle"); }}
                  required
                  className="w-full px-5 py-3.5 rounded-full text-sm md:text-base tracking-wide outline-none"
                  style={{
                    fontFamily: "var(--font-display)",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={formStatus === "submitting" || formStatus === "joined"}
                className={`w-full sm:w-auto shrink-0 px-7 py-3.5 rounded-full text-sm md:text-base font-medium tracking-wide ${
                  formStatus === "joined" ? "opacity-70 cursor-default" : formStatus === "submitting" ? "opacity-70 cursor-wait" : "cursor-pointer"
                }`}
                style={{
                  fontFamily: "var(--font-display)",
                  background: "var(--text)",
                  color: "var(--bg)",
                  border: "none",
                  transition: "all 0.3s ease",
                }}
              >
                {formStatus === "submitting" ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </span>
                ) : formStatus === "joined" ? "joined!" : "get early access"}
              </button>
            </form>
            {formError && (
              <p className="text-red-400 text-sm mt-3">{formError}</p>
            )}
          </div>
        </section>

        {/* ═══ CONTACT SECTION ═══ */}
        <section
          id="contact"
          ref={contactRef}
          className="flex flex-col items-center justify-center px-6 py-24 pb-32 md:px-12 lg:px-20 text-center relative"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {/* Glow behind heading */}
          <div className="absolute pointer-events-none" style={{ bottom: 0, left: "50%", transform: "translateX(-50%)", width: 800, height: 400, background: "radial-gradient(ellipse, rgba(232,180,106,0.08) 0%, transparent 60%)" }} />

          {/* Joy logo with breathing orb */}
          <div className="mb-8 md:mb-12 reveal-section relative inline-flex">
            <JoyLogo width={120} height={63} color="#FFFFFF" />
            <span className="absolute -top-2 -right-5 w-4 h-4 section-orb" />
          </div>
          <h2
            className="reveal-section leading-[1.08] tracking-[-0.03em] mb-8 md:mb-12"
            style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(1.1rem, 2.8vw, 2rem)" }}
          >
            get in <em className="text-gradient" style={{ fontStyle: "italic" }}>touch</em>
          </h2>
          <p
            className="reveal-section text-sm md:text-base leading-[1.75] tracking-wide max-w-[500px] relative z-10"
            style={{ color: "var(--text-secondary)", fontWeight: 300 }}
          >
            Joy is early and being built in the open. If you have thoughts, questions, or feedback, we&apos;d love to hear from you.
            <br />
            <a
              href="mailto:hello@feeljoy.ai"
              className="inline-block mt-4 px-6 py-2.5 rounded-full text-sm font-medium tracking-wide btn-ghost"
              style={{ fontFamily: "var(--font-display)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              hello@feeljoy.ai
            </a>
          </p>
        </section>

      </div>

      {/* ═══ FOOTER ═══ */}
      <footer
        className={`fixed bottom-0 left-0 right-0 z-[4] px-6 py-4 md:px-12 transition-opacity duration-300 ${glowExpanded ? "opacity-0 pointer-events-none" : ""}`}
        style={{ borderTop: "1px solid var(--border)", background: "rgba(8,11,20,0.6)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <div className="max-w-[1400px] mx-auto">
          {/* Mobile: links centered */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:hidden">
            {footerItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="text-xs tracking-wide transition-colors duration-300"
                style={{ fontFamily: "var(--font-display)", color: "var(--text-tertiary)" }}
              >
                {item.label}
              </a>
            ))}
            <span className="text-xs" style={{ fontFamily: "var(--font-display)", color: "var(--text-tertiary)" }}>
              &copy; 2026 Joy
            </span>
          </div>

          {/* Desktop: single row */}
          <div className="hidden md:flex items-center justify-between gap-10">
            {footerItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="text-xs md:text-sm tracking-wide transition-colors duration-300"
                style={{ fontFamily: "var(--font-display)", color: "var(--text-tertiary)" }}
              >
                {item.label}
              </a>
            ))}

            <span className="text-xs" style={{ fontFamily: "var(--font-display)", color: "var(--text-tertiary)" }}>
              &copy; 2026 Joy
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
