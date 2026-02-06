"use client";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import JoyLogo from "./components/JoyLogo";
import ScaffoldLine from "./components/ScaffoldLine";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<"home" | "about" | "contact">("home");

  // Waitlist form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formNewsletter, setFormNewsletter] = useState(false);
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "joined" | "error">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const section2Ref = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);

  // Nav dot animation
  const [dotAnimation, setDotAnimation] = useState<{
    startY: number;
    endY: number;
    dotX: number;
    direction: 'down' | 'up';
    phase: 'start' | 'animate';
  } | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const homeDotRef = useRef<HTMLSpanElement>(null);
  const aboutDotRef = useRef<HTMLSpanElement>(null);
  const contactDotRef = useRef<HTMLSpanElement>(null);
  const dotRefMap = { home: homeDotRef, about: aboutDotRef, contact: contactDotRef };
  const sectionOrder: Array<"home" | "about" | "contact"> = ['home', 'about', 'contact'];

  useEffect(() => {
    const visibleSections = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSections.add(entry.target.id);
          } else {
            visibleSections.delete(entry.target.id);
          }
        });

        if (visibleSections.has("contact")) {
          setActiveSection("contact");
        } else if (visibleSections.has("about")) {
          setActiveSection("about");
        } else if (visibleSections.has("section2")) {
          setActiveSection("home");
        }
      },
      { threshold: 0 }
    );
    if (section2Ref.current) observer.observe(section2Ref.current);
    if (aboutRef.current) observer.observe(aboutRef.current);
    if (contactRef.current) observer.observe(contactRef.current);
    return () => observer.disconnect();
  }, []);

  // Nav dot click handler — triggers drop/float animation
  const handleNavClick = (targetSection: "home" | "about" | "contact") => {
    if (!navRef.current || dotAnimation || activeSection === targetSection) return;
    const currentDot = dotRefMap[activeSection].current;
    const targetDot = dotRefMap[targetSection].current;
    if (!currentDot || !targetDot) return;

    const navRect = navRef.current.getBoundingClientRect();
    const startRect = currentDot.getBoundingClientRect();
    const endRect = targetDot.getBoundingClientRect();
    const direction = sectionOrder.indexOf(targetSection) > sectionOrder.indexOf(activeSection) ? 'down' : 'up';

    setDotAnimation({
      startY: startRect.top - navRect.top,
      endY: endRect.top - navRect.top,
      dotX: startRect.left - navRect.left,
      direction,
      phase: 'start',
    });
  };

  // Progress animation: start → animate (double rAF for browser paint)
  useEffect(() => {
    if (dotAnimation?.phase === 'start') {
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setDotAnimation(prev => prev ? { ...prev, phase: 'animate' } : null);
        });
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [dotAnimation?.phase]);

  // Clear animation after it completes
  useEffect(() => {
    if (dotAnimation?.phase === 'animate') {
      const timer = setTimeout(() => setDotAnimation(null), 500);
      return () => clearTimeout(timer);
    }
  }, [dotAnimation?.phase]);

  // Nav item styles based on active section (all dots empty during animation)
  const navItem = (section: "home" | "about" | "contact") => {
    const isActive = section === activeSection && !dotAnimation;
    return {
      text: isActive
        ? "lowercase font-[500] text-[24px] leading-[30px] tracking-[0.8px] text-black/80 flex items-center gap-3 relative"
        : "lowercase font-[400] text-[24px] leading-[30px] tracking-[0.8px] text-[rgba(30,30,30,0.6)] flex items-center gap-3 hover:text-black/80 transition-colors relative",
      dot: isActive
        ? "w-[10px] h-[10px] rounded-full bg-black/80 inline-block absolute -left-[25px] transition-all duration-300"
        : "w-[10px] h-[10px] rounded-full border border-[rgba(30,30,30,0.6)] inline-block absolute -left-[25px] transition-all duration-300",
    };
  };

  // Mobile nav item styles
  const mobileNavItem = (section: "home" | "about" | "contact") => {
    const isActive = section === activeSection;
    return {
      text: isActive
        ? "lowercase font-[705] text-[18px] text-[var(--color-primary)] flex items-center gap-3 relative pl-[25px]"
        : "lowercase font-[400] text-[18px] text-[var(--color-primary-60)] flex items-center gap-3 relative pl-[25px]",
      dot: isActive
        ? "w-[8px] h-[8px] rounded-full bg-[var(--color-primary)] inline-block absolute left-0"
        : "w-[8px] h-[8px] rounded-full border border-[var(--color-primary-60)] inline-block absolute left-0",
    };
  };

  return (
    <div className="relative mx-auto max-w-[1440px] min-h-screen snap-container">
      {/* Background layers - fixed behind everything */}
      <div className="fixed inset-0 z-0 max-w-[1440px] mx-auto">
        <div className="sunset-gradient absolute inset-0" />
        <div className="noise-overlay" />
        {/* Background artwork - mobile */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden" style={{ height: '30%' }}>
          <div className="absolute left-[-15%] right-[-15%]" style={{ width: '130%', top: '0' }}>
            <Image
              src="/images/background-artwork.png"
              alt=""
              width={1920}
              height={1920}
              className="w-full h-auto opacity-50"
              priority
            />
          </div>
        </div>
        {/* Background artwork - desktop */}
        <div
          className="hidden md:block absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: '80%',
            backgroundImage: 'url(/images/background-artwork.png)',
            backgroundSize: '150% auto',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
            opacity: 0.5,
          }}
        />
      </div>

      {/* Vertical scaffold line - fixed, centered with content container */}
      <div className="fixed inset-0 max-w-[1440px] mx-auto z-[11] pointer-events-none hidden md:block">
        <div data-scaffold-vertical className="absolute top-0 bottom-0 left-[230px] w-px bg-[rgba(39,38,130,0.15)]" />
      </div>

      {/* Page content */}
      <div className="relative z-[2]">
        {/* Sticky Header + Mobile CTA wrapper */}
        <div className="sticky top-0 z-[10]">
          <header className="px-[30px] pt-10 pb-0 md:px-10 md:pt-8 md:pb-0 bg-[#DFE0E7] relative overflow-hidden">
            {/* Header noise overlay */}
            <div className="noise-overlay !z-0" />
            <div className="relative z-[1] flex flex-wrap items-center gap-y-9 md:flex-nowrap md:justify-between pb-4">
            <JoyLogo width={121} height={63} />
            <div className="flex-grow" />

            {/* Hamburger - mobile only, gradient glow when open */}
            <button
              className={`md:hidden relative w-[30px] h-[24px] flex flex-col justify-between cursor-pointer rounded-[6px] p-[3px] transition-all duration-300 ${menuOpen ? 'btn-shimmer bg-white/30 shadow-[0px_2px_10px_rgba(0,0,0,0.1)]' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span className="block w-full h-[3px] bg-[var(--color-primary)] rounded" />
              <span className="block w-full h-[3px] bg-[var(--color-primary)] rounded" />
              <span className="block w-full h-[3px] bg-[var(--color-primary)] rounded" />
            </button>

            {/* Mobile nav dropdown */}
            {menuOpen && (
              <nav className="md:hidden w-full flex flex-col gap-4 pt-4 px-[30px]">
                <a href="#hero" className={mobileNavItem("home").text} onClick={() => setMenuOpen(false)}>
                  <span className={mobileNavItem("home").dot} />
                  home
                </a>
                <a href="#about" className={mobileNavItem("about").text} onClick={() => setMenuOpen(false)}>
                  <span className={mobileNavItem("about").dot} />
                  about
                </a>
                <a href="#contact" className={mobileNavItem("contact").text} onClick={() => setMenuOpen(false)}>
                  <span className={mobileNavItem("contact").dot} />
                  contact
                </a>
              </nav>
            )}

            {/* Desktop early access CTA */}
            <a
              href="#hero"
              className="btn-shimmer hidden md:inline-block lowercase md:w-auto md:px-8 md:py-3 md:bg-white md:rounded-[15px] text-[var(--color-primary)] font-[600] md:text-[18px] md:leading-normal md:tracking-normal md:shadow-[0px_4px_20px_rgba(0,0,0,0.25)] hover:opacity-90 transition-opacity"
            >
              early access
            </a>
            </div>
            {/* Horizontal scaffold line - sticks with header */}
            <div className="relative z-[1] w-full h-px bg-[rgba(39,38,130,0.15)]" />
          </header>
          {/* Mobile early access CTA - outside header so shadow isn't clipped */}
          <a
            href="#hero"
            className="btn-shimmer md:hidden block lowercase w-full py-3 bg-[#DFE0E7] text-[var(--color-primary)] font-[800] text-[20px] leading-[30px] tracking-[1px] text-center shadow-[0px_4px_20px_rgba(0,0,0,0.5)] hover:opacity-90 transition-opacity"
            style={{ clipPath: 'inset(0px -50px -50px -50px)' }}
          >
            early access
          </a>
        </div>

        {/* Page Content: Sidebar + Main */}
        <div className="flex flex-row md:gap-16 md:px-10">
          {/* Left Sidebar Navigation - desktop only, sticky, Literata font */}
          <nav ref={navRef} className="hidden md:flex w-[200px] flex-col gap-[37px] pt-[90px] pl-[30px] sticky top-[120px] self-start h-fit relative" style={{ fontFamily: 'var(--font-literata)' }}>
            {/* Traveling dot — drops down or floats up between nav items */}
            {dotAnimation && (
              <span
                className="absolute w-[10px] h-[10px] rounded-full bg-black/80 pointer-events-none z-10"
                style={{
                  left: dotAnimation.dotX,
                  top: dotAnimation.phase === 'animate' ? dotAnimation.endY : dotAnimation.startY,
                  transition: dotAnimation.phase === 'animate'
                    ? `top 0.5s ${dotAnimation.direction === 'down' ? 'cubic-bezier(0.42, 0, 1, 1)' : 'cubic-bezier(0, 0, 0.58, 1)'}`
                    : 'none',
                }}
              />
            )}
            <a href="#hero" className={navItem("home").text} onClick={() => handleNavClick("home")}>
              <span ref={homeDotRef} className={navItem("home").dot} />
              home
            </a>
            <a href="#about" className={navItem("about").text} onClick={() => handleNavClick("about")}>
              <span ref={aboutDotRef} className={navItem("about").dot} />
              about
            </a>
            <a href="#contact" className={navItem("contact").text} onClick={() => handleNavClick("contact")}>
              <span ref={contactDotRef} className={navItem("contact").dot} />
              contact
            </a>
          </nav>

          {/* Main Content */}
          <main className="flex flex-col flex-grow justify-start p-5 md:pt-[20px] md:pl-[40px] md:pr-0 md:pb-0 md:max-w-[1128px] lg:pt-[46px]">
            {/* Hero Section */}
            <section id="hero" className="min-h-[60vh] md:min-h-[80vh] snap-section scroll-mt-[180px] md:scroll-mt-[130px]">
              {/* H1 */}
              <div className="p-5 md:p-0">
                <h1 className="font-[800] text-[42px] leading-[48px] tracking-[0.8px] text-black mb-0 md:text-[55px] md:leading-[65px] md:tracking-normal md:mb-4 lg:text-[85px] lg:leading-[95px] lg:mb-6">
                  Build your best<br className="md:hidden" />{' '}days,<br className="hidden md:inline" />{' '}at work<br className="md:hidden" />{' '}and in life
                </h1>
              </div>

              {/* Sub-text */}
              <div className="px-5 py-[10px] md:p-0">
                <h2 className="font-[400] text-[20px] leading-[26px] tracking-[0.8px] text-[var(--color-primary)] md:text-[30px] md:leading-[38px] md:tracking-normal md:mb-[20px] lg:text-[45px] lg:leading-[55px] lg:mb-[38px]">
                  Your energy is finite.<br className="hidden md:inline" /> Joy gives your brain one place to think.
                </h2>
              </div>

              {/* Waitlist Form */}
              <form
                id="waitlist"
                className="flex flex-col gap-4 p-[10px] mb-[10px] md:flex-row md:items-center md:gap-4 md:p-0 md:mb-8"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (formStatus === "submitting" || formStatus === "joined") return;
                  setFormStatus("submitting");
                  setFormError(null);
                  try {
                    const res = await fetch("/api/waitlist", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name: formName, email: formEmail, newsletter: formNewsletter }),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      setFormError(data.error || "Something went wrong");
                      setFormStatus("error");
                      return;
                    }
                    setFormStatus("joined");
                    setFormName("");
                    setFormEmail("");
                    setFormNewsletter(false);
                    // Track GA event
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
                <div className="btn-shimmer rounded-[15px] p-[3px] w-full lg:w-[220px] h-[50px] md:h-auto">
                  <input
                    type="text"
                    placeholder="your name"
                    value={formName}
                    onChange={(e) => { setFormName(e.target.value); if (formStatus === "error") setFormStatus("idle"); }}
                    required
                    className="relative z-[3] lowercase font-[400] text-[20px] leading-[30px] tracking-[1px] px-4 py-[10px] bg-[var(--color-bg-base)] rounded-[12px] text-[var(--color-primary)] placeholder:text-black/60 placeholder:font-[400] placeholder:lowercase outline-none w-full h-full md:text-[18px] md:leading-normal md:tracking-normal md:px-6 md:py-3"
                  />
                </div>
                <div className="btn-shimmer rounded-[15px] p-[3px] w-full lg:w-[300px] h-[50px] md:h-auto">
                  <input
                    type="email"
                    placeholder="your email"
                    value={formEmail}
                    onChange={(e) => { setFormEmail(e.target.value); if (formStatus === "error") setFormStatus("idle"); }}
                    required
                    className="relative z-[3] lowercase font-[400] text-[20px] leading-[30px] tracking-[1px] px-4 py-[10px] bg-[var(--color-bg-base)] rounded-[12px] text-[var(--color-primary)] placeholder:text-black/60 placeholder:font-[400] placeholder:lowercase outline-none w-full h-full md:text-[18px] md:leading-normal md:tracking-normal md:px-6 md:py-3"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none px-1 md:px-0">
                  <input
                    type="checkbox"
                    checked={formNewsletter}
                    onChange={(e) => setFormNewsletter(e.target.checked)}
                    className="w-[18px] h-[18px] accent-[var(--color-primary)] cursor-pointer"
                  />
                  <span className="lowercase font-[400] text-[16px] leading-[22px] tracking-[0.8px] text-black/80 whitespace-nowrap md:text-[16px]">newsletter</span>
                </label>
                <button
                  type="submit"
                  disabled={formStatus === "submitting" || formStatus === "joined"}
                  className={`btn-shimmer lowercase font-[800] text-[20px] leading-[30px] tracking-[1px] py-[10px] px-5 md:font-[600] bg-white rounded-[15px] text-[var(--color-primary)] shadow-[0px_4px_20px_rgba(0,0,0,0.25)] transition-opacity w-full h-[50px] md:text-[18px] md:leading-normal md:tracking-normal md:px-8 md:py-3 md:w-auto md:h-auto ${formStatus === "joined" ? "opacity-70 cursor-default" : formStatus === "submitting" ? "opacity-70 cursor-wait" : "hover:opacity-90 cursor-pointer"}`}
                >
                  {formStatus === "submitting" ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </span>
                  ) : formStatus === "joined" ? "joined!" : "join"}
                </button>
              </form>
              {formError && (
                <p className="font-[400] text-[14px] leading-[20px] tracking-[0.5px] text-red-600 px-[10px] md:px-0 -mt-2 mb-2">
                  {formError}
                </p>
              )}

              <p className="font-[400] text-[16px] leading-[22px] tracking-[1px] text-black/80 text-left px-[10px] md:text-[18px] md:leading-[26px] md:tracking-normal md:text-black md:px-0">
                Start building differently
              </p>
            </section>

            {/* Section 2: Video + Scrolling Text */}
            <section id="section2" ref={section2Ref} className="relative mt-10 md:mt-0 min-h-[calc(100vh-120px)] flex flex-col snap-section">
              {/* H1 */}
              <div className="px-5 pt-10 md:px-0 md:pt-10 scroll-reveal-heading">
                <h1 className="font-[800] text-[40px] leading-[40px] tracking-[0.8px] text-black md:text-[60px] md:leading-[60px]">
                  You don&apos;t need two systems<br className="hidden md:inline" />{' '}for one life.
                </h1>
              </div>

              {/* Section divider line */}
              <ScaffoldLine />

              {/* Content: text left, video right on desktop / stacked on mobile */}
              <div className="flex flex-col md:flex-row md:items-center md:gap-8 relative flex-grow">
                {/* Scrollable text container - desktop left */}
                <div
                  className="order-2 md:order-1 px-5 py-6 md:px-0 md:w-full lg:w-[480px] scroll-reveal"
                >
                  <div className="md:py-[82px] md:px-0">
                    <div className="md:p-[40px_10px]">
                      <p
                        className="font-[400] text-[24px] leading-[30px] tracking-[2px] text-[#1E1E1E] md:tracking-[0.8px] md:text-justify"
                        style={{ fontFamily: 'var(--font-literata)' }}
                      >
                        Work and life pull you in opposite directions. When one grows, the other pays the price. You&apos;re stuck in the middle, switching constantly, losing yourself in the shuffle. Joy ends the tug-of-war. One space. Your human capacity. Real clarity about what matters.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Video - desktop right */}
                <div className="order-1 md:order-2 px-5 py-[10px] md:px-0 md:flex-grow flex justify-center scroll-reveal-media">
                  <video
                    className="rounded-[20px] md:rounded-[50px] w-full h-auto md:max-w-[560px] md:h-[315px] object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  >
                    <source src="/images/section2-video.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>
            </section>

            {/* About Section */}
            <section id="about" ref={aboutRef} className="relative mt-10 md:mt-0 snap-section scroll-mt-[180px] md:scroll-mt-[130px]">
              {/* H1 - About Joy */}
              <div className="px-5 pt-10 md:px-0 md:pt-[60px] scroll-reveal">
                <h1 className="font-[800] text-[40px] leading-[40px] tracking-[0.8px] text-black md:text-[55px] md:leading-[65px] lg:text-[85px] lg:leading-[95px]">
                  About Joy
                </h1>
              </div>

              {/* H1 divider */}
              <ScaffoldLine />

              {/* Founder image - mobile only, below H1 */}
              <div className="md:hidden px-5 py-[10px]">
                <img
                  src="/images/about-artwork.png"
                  alt=""
                  className="w-full h-auto rounded-[20px] object-cover"
                />
              </div>

              {/* Section 1: Body text + artwork (desktop: side by side) */}
              <div className="flex flex-col md:flex-row md:items-start md:gap-8 scroll-reveal">
                {/* Body text */}
                <div className="px-5 py-6 md:px-0 md:w-full lg:w-[500px] md:shrink-0">
                  <p
                    className="font-[400] text-[24px] leading-[50px] tracking-[0.8px] text-[#1E1E1E] text-left md:text-justify"
                    style={{ fontFamily: 'var(--font-literata)' }}
                  >
                    When work and life are managed separately, the human in between carries the weight. Space meant for creativity, care, and focus slowly fills with admin and the mental load of constant context-switching. Joy brings work and life into one space, designed to hold the complexity and help you sort it. With less mental load, there&apos;s more room to live and work in a way that works.
                  </p>
                </div>

                {/* Artwork - desktop only */}
                <div className="hidden lg:block lg:w-[600px] lg:h-[600px]">
                  <img
                    src="/images/about-artwork.png"
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Section divider */}
              <ScaffoldLine />

              {/* About the founders */}
              <div className="mt-10 md:mt-[60px] scroll-reveal">
                {/* H2 - desktop only */}
                <h2 className="hidden md:block font-[800] text-[60px] leading-[60px] tracking-[0.8px] text-[#1E1E1E] mb-6">
                  About the founders
                </h2>

                {/* H2 divider - desktop only */}
                <ScaffoldLine desktopOnly />

                {/* Desktop: Three columns — name in Cooper Hewitt Heavy, rest in Literata */}
                <div className="hidden md:flex flex-row flex-wrap gap-[64px] mt-10">
                  <div className="flex-1 min-w-[280px] text-[24px] leading-[50px] tracking-[0.8px] text-[#1E1E1E] text-justify">
                    <span className="font-[800]">Calvin </span>
                    <span style={{ fontFamily: 'var(--font-literata)' }} className="font-[400]">is a product builder with a strong instinct for usefulness and design. He&apos;s founded before and spent years building people technology at scale. At Joy, he leads product and engineering, focused on clarity, craft, and tools that quietly do their job well.</span>
                  </div>
                  <div className="flex-1 min-w-[280px] text-[24px] leading-[50px] tracking-[0.8px] text-[#1E1E1E] text-justify">
                    <span className="font-[800]">Jessie </span>
                    <span style={{ fontFamily: 'var(--font-literata)' }} className="font-[400]">is an operator with experience across sales, market expansion, and people leadership in high-growth Nordic companies. She&apos;s spent a decade building teams and systems with a people-first lens. At Joy, she shapes vision, strategy, and how Joy feels to use.</span>
                  </div>
                  <div className="flex-1 min-w-[280px] text-[24px] leading-[50px] tracking-[0.8px] text-[#1E1E1E] text-justify">
                    <span className="font-[800]">Together, </span>
                    <span style={{ fontFamily: 'var(--font-literata)' }} className="font-[400]">we&apos;ve spent years working on the same problem from different angles: helping humans thrive while doing great work. Joy is the product we wished existed earlier.</span>
                  </div>
                </div>

                {/* Mobile: Single flowing text block — names in Cooper Hewitt Heavy, rest in Literata */}
                <div className="md:hidden px-5 py-6 flex flex-col gap-10 text-[24px] leading-[50px] tracking-[0.8px] text-[#1E1E1E] text-left">
                  <p>
                    <span className="font-[800]">Calvin </span>
                    <span style={{ fontFamily: 'var(--font-literata)' }} className="font-[400]">is a product builder with a strong instinct for usefulness and design. He&apos;s founded before and spent years building people technology at scale. At Joy, he leads product and engineering, focused on clarity, craft, and tools that quietly do their job well.</span>
                  </p>
                  <p>
                    <span className="font-[800]">Jessie </span>
                    <span style={{ fontFamily: 'var(--font-literata)' }} className="font-[400]">is an operator with experience across sales, market expansion, and people leadership in high-growth Nordic companies. She&apos;s spent a decade building teams and systems with a people-first lens. At Joy, she shapes vision, strategy, and how Joy feels to use.</span>
                  </p>
                  <p>
                    <span className="font-[800]">Together, </span>
                    <span style={{ fontFamily: 'var(--font-literata)' }} className="font-[400]">we&apos;ve spent years working on the same problem from different angles: helping humans thrive while doing great work. Joy is the product we wished existed earlier.</span>
                  </p>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section id="contact" ref={contactRef} className="relative mt-10 md:mt-0 snap-section scroll-mt-[180px] md:scroll-mt-[130px]">
              {/* H1 - Get in touch */}
              <div className="px-5 pt-10 md:px-0 md:pt-[60px] scroll-reveal">
                <h1 className="font-[800] text-[40px] leading-[40px] tracking-[0.8px] text-black md:text-[55px] md:leading-[65px] lg:text-[85px] lg:leading-[95px]">
                  Get in touch
                </h1>
              </div>

              {/* H1 divider */}
              <ScaffoldLine />

              {/* Desktop: text positioned right */}
              <div className="flex flex-col scroll-reveal">
                <div className="px-5 py-6 md:px-0 md:max-w-[450px]">
                  <p
                    className="font-[400] text-[24px] leading-[50px] tracking-[0.8px] text-black text-left"
                    style={{ fontFamily: 'var(--font-literata)' }}
                  >
                    Joy is early and being built in the open. If you have thoughts, questions, or feedback, we&apos;d love to hear from you. Email us at{' '}
                    <a href="mailto:hello@feeljoy.ai" className="link-shimmer underline" style={{ fontFamily: 'var(--font-cooper)' }}>hello@feeljoy.ai</a>
                  </p>
                </div>
              </div>

              {/* Section divider */}
              <ScaffoldLine />

              {/* Footer links */}
              <div className="px-5 py-6 md:px-0 md:pt-[30px] md:pb-[40px]">
                <p className="font-[400] text-[16px] leading-[24px] tracking-[1px] text-[#1E1E1E]/60 text-center mb-6"><a href="https://feeljoy.ai" className="link-shimmer hover:opacity-70 transition-opacity">Joy</a> 2026</p>
                <div className="flex flex-col gap-1 font-[400] text-[22px] leading-[36px] tracking-[1px] text-[#1E1E1E]">
                  <a href="https://www.linkedin.com/company/feeljoy/" target="_blank" rel="noopener noreferrer" className="link-shimmer hover:opacity-70 transition-opacity">LinkedIn</a>
                  <a href="/privacy-policy.pdf" target="_blank" rel="noopener noreferrer" className="link-shimmer hover:opacity-70 transition-opacity">Privacy Policy</a>
                  <a href="/joy-code" className="link-shimmer hover:opacity-70 transition-opacity">Joy Code</a>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
