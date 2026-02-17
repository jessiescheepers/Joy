"use client";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

import { useState, useEffect, useRef } from "react";
import JoyLogo from "./components/JoyLogo";
import OrbSystem from "./components/OrbSystem";
import LeadersOrb from "./components/LeadersOrb";
import FoundersOrb from "./components/FoundersOrb";
import CloserOrb from "./components/CloserOrb";
import ContactOrb from "./components/ContactOrb";

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
        else if (visibleSections.has("vision")) setActiveSection("about");
        else if (visibleSections.has("sort")) setActiveSection("how");
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
    { id: "how", label: "sort", href: "#sort" },
    { id: "about", label: "about", href: "#vision" },
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

      {/* Ambient side glows — warm left, cool right */}
      <div className="fixed inset-0 pointer-events-none z-[1]" style={{ overflow: "hidden" }}>
        <div style={{
          position: "absolute",
          top: "20%",
          left: "-15%",
          width: "50vw",
          height: "60vh",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(232,180,106,0.06) 0%, rgba(212,160,168,0.02) 40%, transparent 70%)",
          filter: "blur(80px)",
        }} />
        <div style={{
          position: "absolute",
          top: "30%",
          right: "-15%",
          width: "50vw",
          height: "60vh",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(137,180,220,0.06) 0%, rgba(168,196,224,0.02) 40%, transparent 70%)",
          filter: "blur(80px)",
        }} />
      </div>

      {/* Orb narrative system — scroll-driven transforms */}
      <OrbSystem glowExpanded={glowExpanded} />

      {/* Page content */}
      <div className="relative z-[5]">

        {/* ═══ TOP NAV — glass morphism ═══ */}
        <nav
          className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 h-16 flex items-center justify-between transition-opacity duration-300 ${glowExpanded ? "opacity-0 pointer-events-none" : ""}`}
          style={{
            opacity: glowExpanded ? undefined : 0.7,
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
              className="holo-border-pill px-5 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-300 hover:shadow-[0_0_30px_rgba(224,160,173,0.35)]"
              style={{
                fontFamily: "var(--font-display)",
                background: "#171E33",
                color: "#FFFFFF",
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
              className="holo-border-pill mt-4 px-7 py-3 rounded-full text-sm font-medium tracking-wide"
              style={{ fontFamily: "var(--font-display)", background: "#171E33", color: "#FFFFFF" }}
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
          <div className="w-full max-w-[900px] mx-auto flex flex-col items-center relative z-10">
            {/* Joy Logo */}
            <div className="mb-[42px] md:mb-[54px] animate-hero-1 relative inline-flex">
              <JoyLogo width={80} height={42} color="#FFFFFF" />
            </div>

            {/* H1 — with prismatic gradient + ambient glow */}
            <h1
              className="tracking-[-0.03em] mb-[10px] animate-hero-1"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 300,
                fontSize: "clamp(1.1rem, 2.8vw, 2.2rem)",
                letterSpacing: "-0.02em",
                lineHeight: "calc(1.02em + 5px)",
                textShadow: "0 0 44px rgba(212,165,116,0.3), 0 0 84px rgba(212,165,116,0.1)",
              }}
            >
              OS for{" "}
              <em className="hero-accent" data-text="human success" style={{ fontStyle: "italic" }}>human success</em>
            </h1>
            <p
              className="animate-hero-2 tracking-wide"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 300,
                fontSize: "clamp(0.85rem, 1.5vw, 1.05rem)",
                color: "var(--text-secondary)",
                textShadow: "0 0 34px rgba(212,165,116,0.2)",
              }}
            >
              Your work, your life, your one OS
            </p>

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

        {/* ═══ BRIDGE ═══ */}
        <section
          id="bridge"
          className="py-20 md:py-28 px-6 md:px-12 lg:px-20 text-center"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <p
            className="reveal-section max-w-[600px] mx-auto"
            style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(0.95rem, 2vw, 1.4rem)", color: "var(--text-secondary)", letterSpacing: "-0.01em", lineHeight: "calc(1.4em + 4px)" }}
          >
            Every productivity tool starts with output.<br />We start somewhere else:<br /><em className="text-gradient-pulse" data-text="if humans succeed, productivity follows." style={{ fontStyle: "italic" }}>if humans succeed, productivity follows.</em><br />Here&apos;s how we&apos;ll make that happen.
          </p>
        </section>

        {/* ═══ INTERACTIVE / GLOW SECTION ═══ */}
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
          {/* Framing text */}
          <div className="max-w-[600px] mx-auto mb-12 md:mb-16 reveal-section">
            <h1
              className="leading-[1.3] tracking-[-0.02em] mb-4"
              style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(1rem, 2.5vw, 1.6rem)", color: "var(--text-secondary)" }}
            >
              An urgent barrier to human success<br />is work:life energy lost.<br /><br />We want to <em className="text-gradient-warm" style={{ fontStyle: "italic" }}>reclaim it</em>.
            </h1>
            <p
              className="mt-4 text-xs md:text-sm tracking-wide"
              style={{ fontFamily: "var(--font-body)", fontStyle: "italic", color: "var(--text-tertiary)" }}
            >
              Check in (energy, mood, stress, load) &rarr; brain dump your day<br />&rarr; Joy builds a day with the energy you&apos;ve got
            </p>
          </div>

          {/* Fortune Teller Card */}
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
                    boxShadow: "0 20px 80px rgba(0,0,0,0.5), 0 0 40px rgba(232,180,106,0.12), 0 0 80px rgba(232,180,106,0.06)",
                  }}
                >
                  {/* Card background — matches iframe dark theme */}
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 22,
                    background: "#0E1221",
                    zIndex: 0,
                  }} />
                  {/* Warm orb — z-1: above bg, below iframe text */}
                  <div
                    className="card-orb-overlay"
                    style={{
                      position: "absolute",
                      top: "-50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 340,
                      height: 340,
                      zIndex: 1,
                      opacity: 0,
                      pointerEvents: "none",
                    }}
                  >
                    {/* Warm glow bleed */}
                    <div style={{
                      position: "absolute",
                      inset: "-50%",
                      background: "radial-gradient(circle, rgba(232,180,106,0.35) 0%, rgba(212,165,116,0.12) 45%, transparent 70%)",
                      filter: "blur(40px)",
                      animation: "hero-orb-glow-swell 5s ease-in-out infinite",
                    }} />
                    {/* Heart glow */}
                    <div style={{
                      position: "absolute",
                      inset: "0%",
                      background: "radial-gradient(circle at 50% 40%, rgba(232,180,106,1) 0%, rgba(220,160,80,0.5) 35%, transparent 70%)",
                      filter: "blur(25px) brightness(1.3)",
                      animation: "hero-orb-heart 5s ease-in-out infinite",
                      mixBlendMode: "screen",
                    }} />
                    {/* Breathe → Rotate → Image */}
                    <div style={{ width: "100%", height: "100%", animation: "hero-orb-breathe 5s ease-in-out infinite" }}>
                      <div style={{ width: "100%", height: "100%", animation: "hero-orb-rotate 90s ease-in-out infinite" }}>
                        <img
                          src="/orb-hero.png"
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            opacity: 0.9,
                            mixBlendMode: "screen",
                            WebkitMaskImage: "radial-gradient(circle, black 30%, transparent 68%)",
                            maskImage: "radial-gradient(circle, black 30%, transparent 68%)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <iframe
                    src="/glow/index.html"
                    scrolling="no"
                    title="Daily Glow interactive experience"
                    className="w-[320px] h-[500px] md:w-[380px] lg:w-[420px] border-0 rounded-[22px]"
                    onLoad={(e) => {
                      try {
                        const doc = (e.target as HTMLIFrameElement).contentDocument;
                        if (doc) {
                          const s = doc.createElement("style");
                          s.textContent = "html, body { background: transparent !important; } .card, .opening-card { background: transparent !important; } .opening-orb-wrapper { display: none !important; } .card-bg { display: none !important; } .card::before { display: none !important; } .header h1 { color: #202532 !important; } .opening-card .opening-title { color: #202532 !important; } .opening-tap { color: #202532 !important; } .opening-card .opening-input { color: rgba(40,41,56,0.70) !important; } .opening-card .opening-input::placeholder { color: rgba(40,41,56,0.70) !important; }";
                          doc.head.appendChild(s);
                        }
                      } catch { /* cross-origin guard */ }
                    }}
                    style={{ overflow: "hidden", display: "block", marginLeft: -23, marginTop: -13, pointerEvents: isMobile ? "none" : undefined, background: "transparent", position: "relative", zIndex: 2 }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* CTA below card */}
          {!glowExpanded && (
            <p
              className="mt-10 text-xs md:text-sm tracking-wide reveal-section"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-tertiary)" }}
            >
              {isMobile ? "tap the card to begin" : "enter your name to begin"}
            </p>
          )}
        </section>

        {/* ═══ VISION SECTION ═══ */}
        <section
          id="vision"
          ref={aboutRef}
          className="py-24 md:py-32 px-6 md:px-12 lg:px-20 relative"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {/* Subtle background glow */}
          <div className="absolute pointer-events-none" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 700, height: 400, background: "radial-gradient(ellipse, rgba(232,180,106,0.06) 0%, transparent 60%)" }} />
          <div className="max-w-[660px] mx-auto text-center relative z-10">
            <h2
              className="reveal-section leading-[1.1] tracking-[-0.025em] mb-4"
              style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(1rem, 2.5vw, 1.8rem)" }}
            >
              <em className="text-gradient" style={{ fontStyle: "italic" }}>Human success</em>. That&apos;s the mission.
            </h2>
            <div className="reveal-section text-sm md:text-base leading-[1.85] tracking-wide" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>
              <p className="mb-6">
                To us, human success is simple. It&apos;s being able to do it all, and still have something left for yourself. For the things that make you, you.
              </p>
              <p className="mb-6">
                Today, that&apos;s harder than it should be. Energy leaks across every boundary of modern life. Between work and home. Between tasks and tools. Between what you&apos;re asked to deliver and what you need to stay whole. Billions of hours of human potential, lost to friction that nobody designed a solution for.
              </p>
              <p className="mb-6">
                We&apos;re building that solution. An operating system that reclaims lost energy across work, home, and everything between, so that it can go where it matters. Toward creativity. Innovation. Connection. Toward the things only humans can do, and the life you actually want to live.
              </p>
              <p className="mb-6">
                Hard days, lighter. Great days, better. Less time on the small frustrations. More time on what makes us human.
              </p>
              <p>
                That&apos;s not a product vision. It&apos;s a mission. And we&apos;re just getting started.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ SORT SECTION ═══ */}
        <section
          id="sort"
          ref={howRef}
          className="py-24 md:py-32 px-6 md:px-12 lg:px-20"
          style={{ borderTop: "1px solid var(--border)", position: "relative", zIndex: 1 }}
        >
          <div className="max-w-[660px] mx-auto text-center">
            <h2
              className="reveal-section leading-[1.15] tracking-[-0.025em] mb-8"
              style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(1rem, 2.5vw, 1.8rem)" }}
            >
              The first thing we&apos;re solving?<br />The way we manage <em className="text-gradient-cool" style={{ fontStyle: "italic" }}>work and life</em> today.
            </h2>

            <div className="reveal-section text-sm md:text-base leading-[1.85] tracking-wide mb-12" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>
              <p>
                Every day, you split yourself across calendars, task lists, and a dozen apps that don&apos;t talk to each other. You carry the mental load of work and life as two separate systems, constantly context-switching between them. That&apos;s where the energy goes, and why we end up zoning out on the couch after work instead of taking up pottery.
              </p>
            </div>

            {/* Stats grid — the orb fractures behind these */}
            <div id="sort-stats" className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 mb-16 max-w-[800px] mx-auto">
              {[
                { stat: "82%", label: "of people have no system for managing their day at all" },
                { stat: "2.5h", label: "lost every day to context-switching between work and life" },
                { stat: "151h", label: "of focus lost every year to personal admin during work" },
                { stat: "52%", label: "of the workforce now reports feeling burnt out" },
              ].map((item, i) => (
                <div key={i} className="text-center reveal-section stat-item">
                  <p
                    className="mb-3"
                    style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", letterSpacing: "-0.03em", color: "#FFFFFF" }}
                  >
                    {item.stat}
                  </p>
                  <p
                    className="text-sm leading-[1.6] tracking-wide max-w-[240px] mx-auto"
                    style={{ color: "#FFFFFF", fontWeight: 300 }}
                  >
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <div id="sort-solution" className="reveal-section text-sm md:text-base leading-[1.85] tracking-wide" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>
              <p className="mb-6">
                Sort builds your day around the energy you have today. Not yesterday. Not the version of you that optimistically planned six meetings and a gym session. Work, life, all of it, sorted around what you&apos;ve actually got. It keeps reminders of things you want to get to &mdash; so that you actually get to them.
              </p>
              <p
                className="text-gradient-warm"
                style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(0.85rem, 1.5vw, 1rem)" }}
              >
                Launching 2026. Be first in line.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ FOR LEADERS SECTION ═══ */}
        <section
          id="leaders"
          className="py-24 md:py-32 px-6 md:px-12 lg:px-20"
          style={{ borderTop: "1px solid var(--border)", position: "relative", overflow: "visible" }}
        >
          <LeadersOrb />
          <div className="max-w-[660px] mx-auto text-center" style={{ position: "relative", zIndex: 1 }}>
            <h2
              className="reveal-section leading-[1.15] tracking-[-0.025em] mb-8"
              style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(1rem, 2.5vw, 1.8rem)" }}
            >
              Built for your people. <em className="text-gradient-warm" style={{ fontStyle: "italic" }}>Signal for you</em>.
            </h2>
            <div className="reveal-section text-sm md:text-base leading-[1.85] tracking-wide" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>
              <p className="mb-6">
                What if you could actually see how your people are doing? Not from a quarterly survey. Not from the hard work of asking around. From a tool your team chose to use because it helps them. Real signal on company energy, every day. The company you always said you wanted to build, where people-first and high-performing aren&apos;t a trade-off. Where you finally have the infrastructure to make both true.
              </p>
              <p className="mb-6">
                When your team uses Sort to manage their days, you start to see what&apos;s really happening. Where energy drops. What&apos;s clogging the week. Which ways of working are helping and which are quietly burning people out. Not because you asked. Because the tool they love using told you.
              </p>
              <p>
                No surveys. No surveillance. Just the signal that a great leader has always wished they had.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ FOUNDERS SECTION ═══ */}
        <section
          id="founders"
          className="py-24 md:py-32 px-6 md:px-12 lg:px-20"
          style={{ borderTop: "1px solid var(--border)", position: "relative", overflow: "visible" }}
        >
          <FoundersOrb />
          <div className="max-w-[660px] mx-auto text-center" style={{ position: "relative", zIndex: 1 }}>
            <h2
              className="reveal-section leading-[1.1] tracking-[-0.025em] mb-8"
              style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(1rem, 2.5vw, 1.8rem)" }}
            >
              Who&apos;s <em className="text-gradient-cool" style={{ fontStyle: "italic" }}>building</em> this
            </h2>
            <div className="reveal-section text-sm md:text-base leading-[1.85] tracking-wide" style={{ color: "var(--text-secondary)", fontWeight: 300 }}>
              <p className="mb-6">
                Jessie has always worn the same hat, for different customers. In sales at Meltwater, it was the prospect. Launching new markets at Wolt, it was our restaurant partners, couriers and hungry people. As Head of People at Pleo, it was all about Pleo&apos;ers. Every time, the same focus: understand your customer, remove their pain, and offer them something that delights. Give them more than expected. After 7 years at Pleo, she realised the tools she&apos;d love to use didn&apos;t exist. So she&apos;s building them.
              </p>
              <p className="mb-6">
                Calvin spent 4 years in People Tech at Pleo, designing and building the systems behind the culture. The infrastructure that holds everything together at scale. He saw first-hand how powerful the right tools can be when they&apos;re built around people. Joy is his chance to build that from the ground up.
              </p>
              <p className="mb-6">
                They worked together at Pleo for 4 years, solving this from the inside. Joy is what happens when they decided to solve it for everyone.
              </p>
              <p>
                The tension between people-first and high-performing isn&apos;t inevitable. It&apos;s a design problem. And we&apos;re building the tools to finally solve it.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ FINAL CTA / CLOSER SECTION ═══ */}
        <section
          id="closer"
          className="py-24 md:py-32 px-6 md:px-12 lg:px-20 text-center relative"
          style={{ borderTop: "1px solid var(--border)", overflow: "visible" }}
        >
          <CloserOrb />
          <div className="absolute pointer-events-none" style={{ top: 0, left: "50%", transform: "translateX(-50%)", width: 900, height: 500, background: "radial-gradient(ellipse, rgba(232,180,106,0.06) 0%, transparent 55%)" }} />
          <div className="max-w-[500px] mx-auto relative z-10">
            <h2
              className="reveal-section leading-[1.1] tracking-[-0.025em] mb-4"
              style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(1.1rem, 2.8vw, 2rem)" }}
            >
              What are <span className="closer-orb-target">you</span> best at <em className="text-gradient-warm" style={{ fontStyle: "italic" }}>doing</em>?
            </h2>
            <p
              className="reveal-section text-sm md:text-base tracking-wide mb-8"
              style={{ color: "var(--text-secondary)", fontWeight: 300 }}
            >
              We&apos;re building Joy so you can do more of it.
            </p>

            {/* Waitlist form */}
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
                ) : formStatus === "joined" ? "joined!" : "be first in line"}
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
          style={{ borderTop: "1px solid var(--border)", overflow: "visible" }}
        >
          <ContactOrb />
          {/* Glow behind heading */}
          <div className="absolute pointer-events-none" style={{ bottom: 0, left: "50%", transform: "translateX(-50%)", width: 800, height: 400, background: "radial-gradient(ellipse, rgba(232,180,106,0.08) 0%, transparent 60%)" }} />

          {/* Joy logo with breathing orb */}
          <div className="mb-8 md:mb-12 reveal-section relative inline-flex">
            <JoyLogo width={120} height={63} color="#FFFFFF" />
            <span className="absolute -top-2 -right-5 w-4 h-4 contact-section-orb section-orb" />
            {/* Full orb replacement — shown when ContactOrb arrives */}
            <div
              className="absolute contact-orb-replacement pointer-events-none"
              style={{ top: "-0.5rem", right: "-1.25rem", width: 16, height: 16, opacity: 0, zIndex: 2 }}
            >
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
                {/* Warm ambient glow — wide spread for small orb */}
                <div className="absolute" style={{
                  inset: "-300%",
                  background: "radial-gradient(circle, rgba(232,180,106,0.50) 0%, rgba(212,165,116,0.25) 30%, rgba(212,165,116,0.08) 55%, transparent 70%)",
                  filter: "blur(14px)",
                  animation: "hero-orb-glow-swell 5.8s ease-in-out infinite",
                }} />
                {/* Heart glow — warm core pulse */}
                <div className="absolute" style={{
                  inset: "-80%",
                  background: "radial-gradient(circle at 50% 40%, rgba(224,140,120,1) 0%, rgba(200,110,90,0.6) 35%, transparent 70%)",
                  filter: "blur(6px) brightness(1.5)",
                  animation: "hero-orb-heart 5.4s ease-in-out infinite",
                  mixBlendMode: "screen",
                }} />
                {/* Solid warm core — no image at 16px to avoid ring artifact */}
                <div className="absolute" style={{
                  inset: "-10%",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(250,245,224,0.9) 0%, rgba(232,180,106,0.6) 40%, transparent 70%)",
                  animation: "hero-orb-breathe 5.5s ease-in-out infinite",
                }} />
              </div>
            </div>
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
        className={`fixed bottom-0 left-0 right-0 z-[6] px-6 py-4 md:px-12 transition-opacity duration-300 ${glowExpanded ? "opacity-0 pointer-events-none" : ""}`}
        style={{ opacity: glowExpanded ? undefined : 0.7, borderTop: "1px solid var(--border)", background: "rgba(8,11,20,0.6)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
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


