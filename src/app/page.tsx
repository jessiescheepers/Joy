"use client";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

import React, { useState, useEffect, useRef } from "react";
import JoyLogo from "./components/JoyLogo";
import QiField from "./components/QiField";
import TorusRing from "./components/TorusRing";

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

  // Section refs for intersection observer + register detection
  const heroRef = useRef<HTMLElement>(null);
  const bridgeRef = useRef<HTMLElement>(null);
  const visionRef = useRef<HTMLElement>(null);
  const sortRef = useRef<HTMLElement>(null);
  const leadersRef = useRef<HTMLElement>(null);
  const foundersRef = useRef<HTMLElement>(null);
  const closerRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);

  // Scroll progress bar ref
  const scrollBarRef = useRef<HTMLDivElement>(null);

  // CTA button ref for magnetic effect
  const ctaRef = useRef<HTMLButtonElement>(null);

  // Intersection observer for active nav + register
  useEffect(() => {
    const visibleSections = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visibleSections.add(entry.target.id);
          else visibleSections.delete(entry.target.id);
        });

        // Active nav section
        if (visibleSections.has("contact")) setActiveSection("contact");
        else if (visibleSections.has("vision")) setActiveSection("about");
        else if (visibleSections.has("sort")) setActiveSection("how");
        else if (visibleSections.has("hero")) setActiveSection("home");

        // Register detection
        if (visibleSections.has("contact")) setRegister("settling");
        else if (visibleSections.has("closer") || visibleSections.has("founders")) setRegister("talking");
        else if (visibleSections.has("sort") || visibleSections.has("leaders")) setRegister("thinking");
        else if (visibleSections.has("vision") || visibleSections.has("bridge")) setRegister("listening");
        else if (visibleSections.has("hero")) setRegister("breathing");
      },
      { threshold: 0.2 }
    );

    const refs = [heroRef, bridgeRef, visionRef, sortRef, leadersRef, foundersRef, closerRef, contactRef];
    refs.forEach((ref) => {
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
    { id: "how", label: "sort", href: "#sort" },
    { id: "about", label: "about", href: "#vision" },
    { id: "contact", label: "contact", href: "#contact" },
  ];

  const footerItems = [
    { label: "privacy policy", href: "/privacy-policy.pdf", external: true },
    { label: "linkedin", href: "https://www.linkedin.com/company/feeljoy/", external: true },
    { label: "joy code", href: "/joy-code", external: false },
  ];

  // Wood qi palette — single theme, no dark/light branching
  const t = {
    navBg: "rgba(245,242,232,0.7)",
    mobileBg: "rgba(245,242,232,0.95)",
    footerBg: "rgba(245,242,232,0.7)",
    logoColor: "#2A2E24",
    inputBg: "rgba(68,88,72,0.06)",
    heroTextShadow: "0 0 44px rgba(140,165,130,0.2), 0 0 84px rgba(95,120,85,0.08)",
    sectionGlow06: "radial-gradient(ellipse, rgba(140,165,130,0.06) 0%, transparent 60%)",
    sectionGlow08: "radial-gradient(ellipse, rgba(140,165,130,0.08) 0%, transparent 60%)",
    statColor: "#2A2E24",
    hamburgerBg: "bg-[#2A2E24]",
    navDotBg: "var(--qi-mote-glow)",
    navDotShadow: "0 0 12px var(--qi-mote-glow), 0 0 30px rgba(125,142,115,0.3)",
    backdropSaturate: "blur(40px) saturate(1.2)",
    heroSubShadow: "0 0 34px rgba(140,165,130,0.15)",
    earlyAccessBg: "#E8E5DB",
    earlyAccessColor: "#2A2E24",
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ color: "var(--qi-text)" }}>
      {/* Qi field — the living background */}
      <QiField register={register} />

      {/* Scroll progress indicator */}
      <div ref={scrollBarRef} className="scroll-progress" style={{ transform: "scaleX(0)" }} />

      {/* Page content */}
      <div className="relative z-[5]">

        {/* ═══ TOP NAV — floating on the field, no chrome ═══ */}
        <nav
          className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 h-16 flex items-center justify-between"
        >
          {/* Logo left */}
          <a href="#hero" className="relative">
            <JoyLogo width={50} height={26} color={t.logoColor} />
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
                    isActive ? "active text-[var(--qi-text)]" : "text-[var(--qi-text-secondary)] hover:text-[var(--qi-text)]"
                  }`}
                  style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
                >
                  {item.label}
                </a>
              );
            })}
            <a
              href="#hero"
              className="holo-border-pill px-5 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-300"
              style={{
                fontFamily: "var(--font-display)",
                background: t.earlyAccessBg,
                color: t.earlyAccessColor,
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
              <span className={`block w-5 h-[1.5px] ${t.hamburgerBg} transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
              <span className={`block w-5 h-[1.5px] ${t.hamburgerBg} transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-[1.5px] ${t.hamburgerBg} transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
            </div>
          </button>
        </nav>

        {/* ═══ MOBILE MENU OVERLAY ═══ */}
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
              className="holo-border-pill mt-4 px-7 py-3 rounded-full text-sm font-medium tracking-wide"
              style={{ fontFamily: "var(--font-display)", background: t.earlyAccessBg, color: t.earlyAccessColor }}
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
            {/* Torus ring — the heartbeat */}
            <div className="mb-[32px] md:mb-[42px] animate-hero-1 relative inline-flex">
              <TorusRing register={register} size={140} />
            </div>

            {/* H1 */}
            <h1
              className="tracking-[-0.03em] mb-[10px] animate-hero-1"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 300,
                fontSize: "clamp(1.1rem, 2.8vw, 2.2rem)",
                letterSpacing: "-0.02em",
                lineHeight: "calc(1.02em + 5px)",
                textShadow: t.heroTextShadow,
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
                color: "var(--qi-text-secondary)",
                textShadow: t.heroSubShadow,
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
                    background: t.inputBg,
                    border: "1px solid var(--qi-border)",
                    color: "var(--qi-text)",
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
                  background: "var(--qi-text)",
                  color: "var(--qi-base)",
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
            <span className="text-[0.7rem] tracking-[0.15em] uppercase" style={{ color: "var(--qi-text-tertiary)" }}>scroll</span>
            <div className="w-px h-8" style={{ background: "linear-gradient(to bottom, var(--qi-text-tertiary), transparent)", animation: "scroll-pulse 2s ease-in-out infinite" }} />
          </div>
        </section>

        {/* ═══ BRIDGE ═══ */}
        <section
          id="bridge"
          ref={bridgeRef}
          className="py-20 md:py-28 px-6 md:px-12 lg:px-20 text-center"
          style={{ borderTop: "1px solid var(--qi-border)" }}
        >
          <p
            className="reveal-section max-w-[600px] mx-auto"
            style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(0.95rem, 2vw, 1.4rem)", color: "var(--qi-text-secondary)", letterSpacing: "-0.01em", lineHeight: "calc(1.4em + 4px)" }}
          >
            Every productivity tool starts with output.<br />We start somewhere else:<br /><em className="text-gradient-pulse" data-text="if humans succeed, productivity follows." style={{ fontStyle: "italic" }}>if humans succeed, productivity follows.</em><br />Here&apos;s how we&apos;ll make that happen.
          </p>
        </section>

        {/* ═══ VISION SECTION ═══ */}
        <section
          id="vision"
          ref={visionRef}
          className="py-24 md:py-32 px-6 md:px-12 lg:px-20 relative"
          style={{ borderTop: "1px solid var(--qi-border)" }}
        >
          <div className="absolute pointer-events-none" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 700, height: 400, background: t.sectionGlow06 }} />
          <div className="max-w-[660px] mx-auto text-center relative z-10">
            <h2
              className="reveal-section leading-[1.1] tracking-[-0.025em] mb-4"
              style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(1rem, 2.5vw, 1.8rem)" }}
            >
              <em className="text-gradient" style={{ fontStyle: "italic" }}>Human success</em>. That&apos;s the mission.
            </h2>
            <div className="reveal-section text-sm md:text-base leading-[1.85] tracking-wide" style={{ color: "var(--qi-text-secondary)", fontWeight: 300 }}>
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
                That&apos;s the mission. And we&apos;re just getting started.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ SORT SECTION ═══ */}
        <section
          id="sort"
          ref={sortRef}
          className="py-24 md:py-32 px-6 md:px-12 lg:px-20"
          style={{ borderTop: "1px solid var(--qi-border)", position: "relative", zIndex: 1 }}
        >
          <div className="max-w-[660px] mx-auto text-center">
            <h2
              className="reveal-section leading-[1.15] tracking-[-0.025em] mb-8"
              style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(1rem, 2.5vw, 1.8rem)" }}
            >
              The first thing we&apos;re solving?<br />The way we manage <em className="text-gradient-cool" style={{ fontStyle: "italic" }}>work and life</em> today.
            </h2>

            <div className="reveal-section text-sm md:text-base leading-[1.85] tracking-wide mb-12" style={{ color: "var(--qi-text-secondary)", fontWeight: 300 }}>
              <p>
                Every day, you split yourself across calendars, task lists, and a dozen apps that don&apos;t talk to each other. You carry the mental load of work and life as two separate systems, constantly context-switching between them. That&apos;s where the energy goes, and why we end up zoning out on the couch after work instead of taking up pottery.
              </p>
            </div>

            {/* Stats grid */}
            <div id="sort-stats" className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mb-16 max-w-[800px] mx-auto">
              {[
                { stat: "1/4", label: "of work time lost to distraction. The fastest-growing cause? Life.", href: "https://impact.economist.com/new-globalisation/in-search-of-lost-focus-2023/", ref: "1" },
                { stat: "55%", label: "of people can\u2019t switch off from work when they\u2019re home.", href: "https://www.bitc.org.uk/news/less-than-half-of-workers-feel-able-to-switch-off-from-work-new-research-shows/", ref: "2" },
                { stat: "13%", label: "more output. The input? Happier people.", href: "https://www.ox.ac.uk/news/2019-10-24-happy-workers-are-13-more-productive", ref: "3" },
              ].map((item, i) => (
                <div key={i} className="text-center reveal-section stat-item">
                  <p
                    className="mb-3"
                    style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", letterSpacing: "-0.03em", color: t.statColor }}
                  >
                    {item.stat}
                  </p>
                  <p
                    className="text-sm leading-[1.6] tracking-wide max-w-[240px] mx-auto"
                    style={{ color: t.statColor, fontWeight: 300 }}
                  >
                    {item.label}{" "}
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        verticalAlign: "super",
                        fontSize: "0.65em",
                        textDecoration: "none",
                        background: "linear-gradient(135deg, #7D8E73, #8CA582, #5A7850)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {item.ref}
                    </a>
                  </p>
                </div>
              ))}
            </div>

            <div id="sort-solution" className="reveal-section text-sm md:text-base leading-[1.85] tracking-wide" style={{ color: "var(--qi-text-secondary)", fontWeight: 300 }}>
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
          ref={leadersRef}
          className="py-24 md:py-32 px-6 md:px-12 lg:px-20"
          style={{ borderTop: "1px solid var(--qi-border)", position: "relative", overflow: "visible" }}
        >
          <div className="max-w-[660px] mx-auto text-center" style={{ position: "relative", zIndex: 1 }}>
            <h2
              className="reveal-section leading-[1.15] tracking-[-0.025em] mb-8"
              style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(1rem, 2.5vw, 1.8rem)" }}
            >
              Built for your people. <em className="text-gradient-warm" style={{ fontStyle: "italic" }}>Signal for you</em>.
            </h2>
            <div className="reveal-section text-sm md:text-base leading-[1.85] tracking-wide" style={{ color: "var(--qi-text-secondary)", fontWeight: 300 }}>
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
          ref={foundersRef}
          className="py-24 md:py-32 px-6 md:px-12 lg:px-20"
          style={{ borderTop: "1px solid var(--qi-border)", position: "relative", overflow: "visible" }}
        >
          <div className="max-w-[660px] mx-auto text-center" style={{ position: "relative", zIndex: 1 }}>
            <h2
              className="reveal-section leading-[1.1] tracking-[-0.025em] mb-8"
              style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(1rem, 2.5vw, 1.8rem)" }}
            >
              Who&apos;s <em className="text-gradient-cool" style={{ fontStyle: "italic" }}>building</em> this
            </h2>
            <div className="reveal-section text-sm md:text-base leading-[1.85] tracking-wide" style={{ color: "var(--qi-text-secondary)", fontWeight: 300 }}>
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
          ref={closerRef}
          className="py-24 md:py-32 px-6 md:px-12 lg:px-20 text-center relative"
          style={{ borderTop: "1px solid var(--qi-border)", overflow: "visible" }}
        >
          <div className="absolute pointer-events-none" style={{ top: 0, left: "50%", transform: "translateX(-50%)", width: 900, height: 500, background: t.sectionGlow06 }} />
          <div className="max-w-[500px] mx-auto relative z-10">
            <h2
              className="reveal-section leading-[1.1] tracking-[-0.025em] mb-4"
              style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(1.1rem, 2.8vw, 2rem)" }}
            >
              What are you best at <em className="text-gradient-warm" style={{ fontStyle: "italic" }}>doing</em>?
            </h2>
            <p
              className="reveal-section text-sm md:text-base tracking-wide mb-8"
              style={{ color: "var(--qi-text-secondary)", fontWeight: 300 }}
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
                    background: t.inputBg,
                    border: "1px solid var(--qi-border)",
                    color: "var(--qi-text)",
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
                  background: "var(--qi-text)",
                  color: "var(--qi-base)",
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
          style={{ borderTop: "1px solid var(--qi-border)", overflow: "visible" }}
        >
          <div className="absolute pointer-events-none" style={{ bottom: 0, left: "50%", transform: "translateX(-50%)", width: 800, height: 400, background: t.sectionGlow08 }} />

          {/* Joy logo */}
          <div className="mb-8 md:mb-12 reveal-section relative inline-flex">
            <JoyLogo width={120} height={63} color={t.logoColor} />
          </div>
          <h2
            className="reveal-section leading-[1.08] tracking-[-0.03em] mb-8 md:mb-12"
            style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(1.1rem, 2.8vw, 2rem)" }}
          >
            get in <em className="text-gradient" style={{ fontStyle: "italic" }}>touch</em>
          </h2>
          <p
            className="reveal-section text-sm md:text-base leading-[1.75] tracking-wide max-w-[500px] relative z-10"
            style={{ color: "var(--qi-text-secondary)", fontWeight: 300 }}
          >
            Joy is early and being built in the open. If you have thoughts, questions, or feedback, we&apos;d love to hear from you.
            <br />
            <a
              href="mailto:hello@feeljoy.ai"
              className="inline-block mt-4 px-6 py-2.5 rounded-full text-sm font-medium tracking-wide btn-ghost"
              style={{ fontFamily: "var(--font-display)", border: "1px solid var(--qi-border)", color: "var(--qi-text-secondary)" }}
            >
              hello@feeljoy.ai
            </a>
          </p>
        </section>

      </div>

      {/* ═══ FOOTER ═══ */}
      <footer
        className="fixed bottom-0 left-0 right-0 z-[6] px-6 py-4 md:px-12"
        style={{ opacity: 0.7 }}
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
                style={{ fontFamily: "var(--font-display)", color: t.logoColor }}
              >
                {item.label}
              </a>
            ))}
            <span className="text-xs" style={{ fontFamily: "var(--font-display)", color: t.logoColor }}>
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
                style={{ fontFamily: "var(--font-display)", color: t.logoColor }}
              >
                {item.label}
              </a>
            ))}

            <span className="text-xs" style={{ fontFamily: "var(--font-display)", color: t.logoColor }}>
              &copy; 2026 Joy
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
