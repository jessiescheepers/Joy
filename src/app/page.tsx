"use client";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

import React, { useState, useEffect, useRef, useCallback } from "react";
import JoyLogo from "./components/JoyLogo";
import QiTorusField from "./components/QiTorusField";

export type Register = "breathing" | "listening" | "thinking" | "talking" | "settling";

export default function Home() {
  const [activeSection, setActiveSection] = useState<string>("home");
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [register, setRegister] = useState<Register>("breathing");

  useEffect(() => {
    setIsMobile(window.matchMedia("(max-width: 768px)").matches);
  }, []);

  // Waitlist form state
  const [formEmail, setFormEmail] = useState("");
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "joined" | "error">("idle");
  const [formError, setFormError] = useState<string | null>(null);

  // Section refs
  const heroRef = useRef<HTMLElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const whyRef = useRef<HTMLElement>(null);
  const howRef = useRef<HTMLElement>(null);
  const whoRef = useRef<HTMLElement>(null);
  const endRef = useRef<HTMLElement>(null);

  // CTA button ref for magnetic effect
  const ctaRef = useRef<HTMLButtonElement>(null);

  // Hero content fades as you scroll — dissolves before reaching the torus
  const handleScroll = useCallback(() => {
    if (!heroContentRef.current) return;
    const scrollY = window.scrollY;
    const fadeStart = 50;
    const fadeEnd = 350;
    const progress = Math.min(Math.max((scrollY - fadeStart) / (fadeEnd - fadeStart), 0), 1);
    heroContentRef.current.style.opacity = String(1 - progress);
    heroContentRef.current.style.transform = `translateY(${progress * -20}px)`;
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Nav observer — low threshold so nav stays responsive
  useEffect(() => {
    const visibleSections = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visibleSections.add(entry.target.id);
          else visibleSections.delete(entry.target.id);
        });

        if (visibleSections.has("end")) setActiveSection("end");
        else if (visibleSections.has("who")) setActiveSection("who");
        else if (visibleSections.has("how")) setActiveSection("how");
        else if (visibleSections.has("why")) setActiveSection("why");
        else if (visibleSections.has("hero")) setActiveSection("home");
      },
      { threshold: 0.2 }
    );

    const refs = [heroRef, whyRef, howRef, whoRef, endRef];
    refs.forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });
    return () => observer.disconnect();
  }, []);

  // Register — scrolling = thinking, settled = section register.
  // Uses a ref to avoid re-renders on every scroll tick.
  // Long debounce (800ms) so thinking persists after scroll stops.
  useEffect(() => {
    const sectionRefs: { id: string; ref: React.RefObject<HTMLElement | null> }[] = [
      { id: "hero", ref: heroRef },
      { id: "why", ref: whyRef },
      { id: "how", ref: howRef },
      { id: "who", ref: whoRef },
      { id: "end", ref: endRef },
    ];

    const registerMap: Record<string, Register> = {
      hero: "breathing",
      why: "listening",
      how: "talking",
      who: "listening",
      end: "settling",
    };

    let scrollTimer: ReturnType<typeof setTimeout> | null = null;
    let currentReg: Register = "breathing";

    const setReg = (r: Register) => {
      if (r === currentReg) return; // no-op if unchanged — avoids re-renders
      currentReg = r;
      setRegister(r);
    };

    const resolveSectionRegister = () => {
      const centerY = window.innerHeight * 0.5;
      for (const { id, ref } of sectionRefs) {
        if (!ref.current) continue;
        const rect = ref.current.getBoundingClientRect();
        if (rect.top <= centerY && rect.bottom >= centerY) {
          setReg(registerMap[id]);
          return;
        }
      }
    };

    const onScroll = () => {
      setReg("thinking");

      // Long debounce — thinking persists well after scroll stops
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(resolveSectionRegister, 800);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    resolveSectionRegister();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
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

  const navItems = [
    { id: "home", label: "home", href: "#hero" },
    { id: "why", label: "why", href: "#why" },
    { id: "how", label: "how", href: "#how" },
    { id: "who", label: "who", href: "#who" },
    { id: "end", label: "contact", href: "#end" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
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
  };

  // Shared serif italic style for human words in headings
  const serifItalic: React.CSSProperties = {
    fontFamily: "'Source Serif 4', Georgia, serif",
    fontWeight: 400,
    fontStyle: "italic",
    color: "var(--qi-text)",
    letterSpacing: "-0.01em",
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ color: "var(--qi-text)" }}>
      <QiTorusField register={register} />

      <div className="relative z-[5]">

        {/* ═══ NAV ═══ */}
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 h-16 flex items-center justify-between">
          <a href="#hero" className="relative">
            <JoyLogo height={32} color="#2A2E24" />
          </a>

          <div className="nav-glass-rail hidden md:flex items-center gap-1 px-2 py-1.5 relative">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={`relative px-4 py-1.5 rounded-[7px] text-xs tracking-wide transition-all duration-300 ${
                    isActive
                      ? "nav-cutout text-[var(--qi-text)]"
                      : "text-[var(--qi-text-secondary)] hover:text-[var(--qi-text)]"
                  }`}
                  style={{ fontFamily: "var(--font-display)", fontWeight: isActive ? 500 : 400 }}
                >
                  {item.label}
                </a>
              );
            })}
            <a
              href="#hero"
              className="cutout-chip ml-2 text-xs tracking-wide"
              style={{ fontFamily: "var(--font-display)" }}
            >
              early access
            </a>
          </div>

          <button
            className="md:hidden w-10 h-10 flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="flex flex-col gap-[5px]">
              <span className={`block w-5 h-[1.5px] bg-[#2A2E24] transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
              <span className={`block w-5 h-[1.5px] bg-[#2A2E24] transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-[1.5px] bg-[#2A2E24] transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
            </div>
          </button>
        </nav>

        {/* Mobile menu */}
        <div
          className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          style={{ background: "rgba(245,242,232,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
        >
          <div className="flex flex-col items-center justify-center h-full gap-8">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg tracking-wide transition-colors duration-300"
                style={{ fontFamily: "var(--font-display)", fontWeight: 300, color: activeSection === item.id ? "var(--qi-text)" : "var(--qi-text-secondary)" }}
              >
                {item.label}
              </a>
            ))}
            <a
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="cutout-chip mt-4 text-sm tracking-wide"
              style={{ fontFamily: "var(--font-display)", padding: "10px 24px" }}
            >
              early access
            </a>
          </div>
        </div>

        {/* ═══ HERO — breathing ═══
            Full viewport. Torus upper-center. Content below.
            Content fades on scroll so it never reaches Alpher. */}
        <section
          id="hero"
          ref={heroRef}
          className="min-h-screen flex flex-col items-center px-6 text-center relative overflow-visible"
          style={{ paddingTop: "52vh" }}
        >
          <div
            ref={heroContentRef}
            className="w-full max-w-[900px] mx-auto flex flex-col items-center relative z-10"
            style={{ transition: "opacity 0.05s linear, transform 0.05s linear" }}
          >
            <h1
              className="animate-hero-1"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 300,
                fontSize: "clamp(0.95rem, 2vw, 1.5rem)",
                letterSpacing: "0.04em",
                lineHeight: 1.4,
                color: "var(--qi-text-secondary)",
              }}
            >
              the OS for{" "}
              <em className="hero-accent" style={serifItalic}>human success</em>
            </h1>

            <p
              className="animate-hero-2"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontWeight: 300,
                fontStyle: "italic",
                fontSize: "clamp(0.78rem, 1.2vw, 0.92rem)",
                color: "var(--qi-text-secondary)",
                letterSpacing: "0.02em",
                marginTop: "10px",
              }}
            >
              your work, your life, one place for it all
            </p>

            <form
              id="waitlist"
              className="animate-hero-cta relative mt-[28px] flex justify-center"
              onSubmit={handleSubmit}
            >
              <div className="day-card flex items-center gap-3">
                <input
                  type="email"
                  placeholder="your email"
                  value={formEmail}
                  onChange={(e) => { setFormEmail(e.target.value); if (formStatus === "error") setFormStatus("idle"); }}
                  required
                  className="outline-none placeholder:text-[rgba(40,35,30,0.30)]"
                  style={{
                    fontFamily: "'Source Serif 4', Georgia, serif",
                    background: "transparent",
                    border: "none",
                    color: "rgba(40, 35, 30, 0.65)",
                    fontSize: "13px",
                    fontWeight: 400,
                    fontStyle: "italic",
                    letterSpacing: "0.2px",
                    width: "140px",
                  }}
                />
                <button
                  ref={ctaRef}
                  type="submit"
                  disabled={formStatus === "submitting" || formStatus === "joined"}
                  className={`cutout-chip whitespace-nowrap btn-magnetic ${
                    formStatus === "joined" ? "opacity-70 cursor-default" : formStatus === "submitting" ? "opacity-70 cursor-wait" : ""
                  }`}
                  onMouseMove={(e) => {
                    if (!ctaRef.current || isMobile) return;
                    const rect = ctaRef.current.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    ctaRef.current.style.transform = `translate(${x * 0.06}px, ${y * 0.06}px)`;
                  }}
                  onMouseLeave={() => {
                    if (ctaRef.current) ctaRef.current.style.transform = '';
                  }}
                >
                  {formStatus === "submitting" ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </span>
                  ) : formStatus === "joined" ? "joined!" : "get early access"}
                </button>
              </div>
            </form>
            {formError && (
              <p className="text-red-400 text-sm mt-3">{formError}</p>
            )}
          </div>
        </section>

        {/* ═══ CONTENT — the companion layout ═══
            After the hero, content lives in the left column.
            Alpher breathes in the upper-right of the viewport.
            They never overlap. Like Joy Day: schedule left, companion right.

            On mobile: full-width centered, generous top padding. */}

        {/* ═══ WHY — listening ═══ */}
        <section
          id="why"
          ref={whyRef}
          className="pt-[45vh] md:pt-40 pb-20 md:pb-28 px-6"
        >
          <div className="md:grid md:grid-cols-[1fr_1fr] md:gap-[30vw] md:items-start md:px-[4vw]">
            <div className="mb-6 md:mb-0 md:sticky md:top-[50vh] md:-translate-y-1/2 reveal-section">
              <div className="day-card inline-block">
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 300,
                    fontSize: "clamp(0.85rem, 1.4vw, 1.1rem)",
                    letterSpacing: "0.02em",
                    color: "var(--qi-text-secondary)",
                  }}
                >
                  what is <em style={serifItalic}>human success</em>?
                </span>
              </div>
            </div>

            <div
              className="reveal-section leading-[1.9] tracking-wide"
              style={{ color: "var(--qi-text-secondary)", fontWeight: 300, fontSize: "clamp(0.85rem, 1.1vw, 0.95rem)" }}
            >
              <p className="mb-6">
                It&apos;s being able to do it all, and still have something left for yourself. For the things that make you, you.
              </p>
              <p className="mb-6">
                Today, that&apos;s harder than it should be. Energy leaks between work and home. Between tasks and tools. Between what you&apos;re asked to deliver and what you need to stay whole.
              </p>
              <p>
                We think that tension isn&apos;t inevitable. It&apos;s a design problem. And we&apos;re building the tools to solve it.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ HOW — thinking ═══ */}
        <section
          id="how"
          ref={howRef}
          className="pt-[45vh] md:pt-40 pb-20 md:pb-28 px-6"
        >
          <div className="md:grid md:grid-cols-[1fr_1fr] md:gap-[30vw] md:items-start md:px-[4vw]">
            <div className="mb-6 md:mb-0 md:sticky md:top-[50vh] md:-translate-y-1/2 reveal-section">
              <div className="day-card inline-block">
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 300,
                    fontSize: "clamp(0.85rem, 1.4vw, 1.1rem)",
                    letterSpacing: "0.02em",
                    color: "var(--qi-text-secondary)",
                  }}
                >
                  meet <em style={serifItalic}>Alpher</em>
                </span>
              </div>
            </div>

            <div>
              <p
                className="reveal-section leading-[1.9] tracking-wide mb-10"
                style={{ color: "var(--qi-text-secondary)", fontWeight: 300, fontSize: "clamp(0.85rem, 1.1vw, 0.95rem)" }}
              >
                She builds your day around the energy you actually have. Work, life, all of it, in one place. She remembers the things you want to get to, so that you actually get to them.
              </p>

              {/* Stats in day-cards */}
              <div className="flex flex-col gap-3 mb-10">
                {[
                  { stat: "1/4", label: "of work time lost to distraction. The fastest-growing cause? Life.", href: "https://impact.economist.com/new-globalisation/in-search-of-lost-focus-2023/", ref: "1" },
                  { stat: "55%", label: "of people can\u2019t switch off from work when they\u2019re home.", href: "https://www.bitc.org.uk/news/less-than-half-of-workers-feel-able-to-switch-off-from-work-new-research-shows/", ref: "2" },
                  { stat: "13%", label: "more output. The input? Happier people.", href: "https://www.ox.ac.uk/news/2019-10-24-happy-workers-are-13-more-productive", ref: "3" },
                ].map((item, i) => (
                  <div key={i} className="day-card flex items-baseline gap-3 reveal-section">
                    <span className="cutout-chip shrink-0" style={{ fontSize: "11px", fontWeight: 500, padding: "3px 10px" }}>
                      {item.stat}
                    </span>
                    <span className="text-sm leading-[1.5] tracking-wide" style={{ fontWeight: 300, color: "var(--qi-text-secondary)" }}>
                      {item.label}
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gradient"
                        style={{ verticalAlign: "super", fontSize: "0.65em", textDecoration: "none", marginLeft: "2px" }}
                      >
                        {item.ref}
                      </a>
                    </span>
                  </div>
                ))}
              </div>

              <p
                className="reveal-section"
                style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  fontWeight: 300,
                  fontStyle: "italic",
                  fontSize: "clamp(0.82rem, 1.1vw, 0.95rem)",
                  color: "var(--qi-text-secondary)",
                  letterSpacing: "0.02em",
                }}
              >
                launching 2026
              </p>
            </div>
          </div>
        </section>

        {/* ═══ WHO — talking ═══ */}
        <section
          id="who"
          ref={whoRef}
          className="pt-[45vh] md:pt-40 pb-20 md:pb-28 px-6"
        >
          <div className="md:grid md:grid-cols-[1fr_1fr] md:gap-[30vw] md:items-start md:px-[4vw]">
            <div className="mb-6 md:mb-0 md:sticky md:top-[50vh] md:-translate-y-1/2 reveal-section">
              <div className="day-card inline-block">
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 300,
                    fontSize: "clamp(0.85rem, 1.4vw, 1.1rem)",
                    letterSpacing: "0.02em",
                    color: "var(--qi-text-secondary)",
                  }}
                >
                  who&apos;s <em style={serifItalic}>building</em> this
                </span>
              </div>
            </div>

            <div
              className="reveal-section leading-[1.9] tracking-wide"
              style={{ color: "var(--qi-text-secondary)", fontWeight: 300, fontSize: "clamp(0.85rem, 1.1vw, 0.95rem)" }}
            >
              <p className="mb-6">
                <em style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontStyle: "italic", color: "var(--qi-text)" }}>Jessie</em> spent 7 years at Pleo as Head of People, building the culture and tools for a company that scaled from 30 to 1,000. She knows what it takes to hold both high performance and real humanity. She realised the tools she&apos;d love to use didn&apos;t exist. So she&apos;s building them.
              </p>
              <p className="mb-6">
                <em style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontStyle: "italic", color: "var(--qi-text)" }}>Calvin</em> spent 4 years in People Tech at Pleo, designing the systems behind the culture. The infrastructure that holds everything together at scale. Joy is his chance to build that from the ground up.
              </p>
              <p>
                They worked together for 4 years, solving this from the inside. Joy is what happens when they decided to solve it for everyone.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ END — settling ═══ */}
        <section
          id="end"
          ref={endRef}
          className="pt-[45vh] md:pt-40 pb-20 md:pb-28 px-6 text-center"
        >
          <div className="max-w-[400px] mx-auto">
            <p
              className="reveal-section mb-6"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontWeight: 300,
                fontStyle: "italic",
                fontSize: "clamp(0.85rem, 1.2vw, 1rem)",
                color: "var(--qi-text-secondary)",
                letterSpacing: "0.02em",
                lineHeight: 1.7,
              }}
            >
              Joy is early and being built in the open.
              <br />
              We&apos;d love to hear from you.
            </p>
            <a
              href="mailto:hello@feeljoy.ai"
              className="reveal-section cutout-chip inline-flex text-sm tracking-wide"
              style={{ fontFamily: "var(--font-display)" }}
            >
              hello@feeljoy.ai
            </a>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="relative z-[6] px-6 py-8 md:px-12">
        <div className="max-w-[1400px] mx-auto flex items-center justify-center gap-6">
          <a href="/privacy-policy.pdf" target="_blank" rel="noopener noreferrer" className="text-[10px] tracking-widest uppercase" style={{ fontFamily: "var(--font-display)", color: "var(--qi-text-tertiary)" }}>privacy</a>
          <a href="/joy-code" className="text-[10px] tracking-widest uppercase" style={{ fontFamily: "var(--font-display)", color: "var(--qi-text-tertiary)" }}>joy code</a>
          <span className="text-[10px] tracking-widest uppercase" style={{ fontFamily: "var(--font-display)", color: "var(--qi-text-tertiary)" }}>&copy; 2026 Joy</span>
          <a href="https://www.linkedin.com/company/feeljoy/" target="_blank" rel="noopener noreferrer" className="text-[10px] tracking-widest uppercase" style={{ fontFamily: "var(--font-display)", color: "var(--qi-text-tertiary)" }}>linkedin</a>
        </div>
      </footer>
    </div>
  );
}
