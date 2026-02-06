"use client";

import { useState } from "react";
import JoyLogo from "../components/JoyLogo";
import ScaffoldLine from "../components/ScaffoldLine";

const principles = [
  {
    heading: "Humans do their best work when they have space and meaning",
    body: "People are capable of focus, creativity, and care when they are not buried in admin and coordination. Joy takes on background work that pulls attention away from being and doing, making space for energy to go where it actually matters.",
  },
  {
    heading: "Humans think and work in many different ways",
    body: "There is no single right way to focus, plan, or make progress. Joy adapts to people rather than asking people to adapt to software. It supports different brains, rhythms, and ways of working without ranking, labelling, or judgement.",
  },
  {
    heading: "Humans thrive through connection",
    body: "Belonging, shared purpose, and mutual support are fundamental to human wellbeing. Joy is built with Ubuntu at its core: I am because we are. We design for connection and interdependence without forcing sameness or performance.",
  },
  {
    heading: "Humans grow through honest reflection",
    body: "People learn and adapt when they can be truthful without fear. Joy is a safe place to reflect on what is happening and how you are doing. Insight should support people, not expose them.",
  },
  {
    heading: "Humans share more freely when trust is clear",
    body: "Trust grows when people understand how their information is used and protected. Joy treats privacy as infrastructure, not a policy. What is shared is clear. With whom it is shared is clear. Why it is shared is clear. If trust is unclear, the system needs fixing.",
  },
  {
    heading: "Humans function better with clarity than complexity",
    body: "Simplicity supports attention, understanding, and follow-through. Joy follows YAGNI. We build what is genuinely useful and avoid features that create noise instead of value.",
  },
  {
    heading: "Humans deserve access to support",
    body: "Support should not be limited to those who can afford it. Core Live with Joy features remain free so people can access basic support without financial barriers. We charge for added security, coordination, and complexity when it is fair to do so, and we are clear about what is paid and why.",
  },
  {
    heading: "Humans are shaped by the systems around them",
    body: "People succeed when structures, expectations, and tools reflect reality. Joy looks first at systems, context, and load. We improve environments rather than blaming individuals.",
  },
  {
    heading: "We are all in this together",
    body: "Our actions affect more than just ourselves. Joy takes responsibility for environmental, social, and governance impact seriously through the choices we make, focusing on reducing harm and contributing positively where we can.",
  },
];

export default function JoyCode() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative mx-auto max-w-[1440px] min-h-screen snap-container">
      {/* Background layers - fixed behind everything */}
      <div className="fixed inset-0 z-0 max-w-[1440px] mx-auto">
        <div className="sunset-gradient absolute inset-0" />
        <div className="noise-overlay" />
        {/* Background artwork - mobile */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden" style={{ height: '30%' }}>
          <div className="absolute left-[-15%] right-[-15%]" style={{ width: '130%', top: '0' }}>
            <img
              src="/images/background-artwork.png"
              alt=""
              className="w-full h-auto opacity-50"
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
            <div className="noise-overlay !z-0" />
            <div className="relative z-[1] flex flex-wrap items-center gap-y-9 md:flex-nowrap md:justify-between pb-4">
              <a href="/">
                <JoyLogo width={121} height={63} />
              </a>
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
                  <a href="/" className="lowercase font-[400] text-[18px] text-[var(--color-primary-60)] flex items-center gap-3 relative pl-[25px]" onClick={() => setMenuOpen(false)}>
                    <span className="w-[8px] h-[8px] rounded-full border border-[var(--color-primary-60)] inline-block absolute left-0" />
                    home
                  </a>
                  <a href="/#about" className="lowercase font-[400] text-[18px] text-[var(--color-primary-60)] flex items-center gap-3 relative pl-[25px]" onClick={() => setMenuOpen(false)}>
                    <span className="w-[8px] h-[8px] rounded-full border border-[var(--color-primary-60)] inline-block absolute left-0" />
                    about
                  </a>
                  <a href="/#contact" className="lowercase font-[400] text-[18px] text-[var(--color-primary-60)] flex items-center gap-3 relative pl-[25px]" onClick={() => setMenuOpen(false)}>
                    <span className="w-[8px] h-[8px] rounded-full border border-[var(--color-primary-60)] inline-block absolute left-0" />
                    contact
                  </a>
                </nav>
              )}

              {/* Desktop early access CTA */}
              <a
                href="/#hero"
                className="btn-shimmer hidden md:inline-block lowercase md:w-auto md:px-8 md:py-3 md:bg-white md:rounded-[15px] text-[var(--color-primary)] font-[600] md:text-[18px] md:leading-normal md:tracking-normal md:shadow-[0px_4px_20px_rgba(0,0,0,0.25)] hover:opacity-90 transition-opacity"
              >
                early access
              </a>
            </div>
            <div className="relative z-[1] w-full h-px bg-[rgba(39,38,130,0.15)]" />
          </header>
          {/* Mobile early access CTA - outside header so shadow isn't clipped */}
          <a
            href="/#hero"
            className="btn-shimmer md:hidden block lowercase w-full py-3 bg-[#DFE0E7] text-[var(--color-primary)] font-[800] text-[20px] leading-[30px] tracking-[1px] text-center shadow-[0px_4px_20px_rgba(0,0,0,0.5)] hover:opacity-90 transition-opacity"
            style={{ clipPath: 'inset(0px -50px -50px -50px)' }}
          >
            early access
          </a>
        </div>

        {/* Page Content: Sidebar + Main */}
        <div className="flex flex-row md:gap-16 md:px-10">
          {/* Left Sidebar Navigation - desktop only */}
          <nav className="hidden md:flex w-[200px] flex-col gap-[37px] pt-[90px] pl-[30px] sticky top-[120px] self-start h-fit" style={{ fontFamily: 'var(--font-literata)' }}>
            <a
              href="/"
              className="lowercase font-[400] text-[24px] leading-[30px] tracking-[0.8px] text-[rgba(30,30,30,0.6)] flex items-center gap-3 hover:text-black/80 transition-colors relative"
            >
              <span className="w-[10px] h-[10px] rounded-full border border-[rgba(30,30,30,0.6)] inline-block absolute -left-[25px]" />
              home
            </a>
            <a
              href="/#about"
              className="lowercase font-[400] text-[24px] leading-[30px] tracking-[0.8px] text-[rgba(30,30,30,0.6)] flex items-center gap-3 hover:text-black/80 transition-colors relative"
            >
              <span className="w-[10px] h-[10px] rounded-full border border-[rgba(30,30,30,0.6)] inline-block absolute -left-[25px]" />
              about
            </a>
            <a
              href="/#contact"
              className="lowercase font-[400] text-[24px] leading-[30px] tracking-[0.8px] text-[rgba(30,30,30,0.6)] flex items-center gap-3 hover:text-black/80 transition-colors relative"
            >
              <span className="w-[10px] h-[10px] rounded-full border border-[rgba(30,30,30,0.6)] inline-block absolute -left-[25px]" />
              contact
            </a>
          </nav>

          {/* Main Content */}
          <main className="flex flex-col flex-grow justify-start p-5 md:pt-[60px] md:pl-[40px] md:pr-0 md:pb-20 md:max-w-[1128px]">
            {/* H1 - The Joy Code */}
            <div className="px-5 pt-5 md:px-0 md:pt-0">
              <h1 className="font-[800] text-[40px] leading-[40px] tracking-[0.8px] text-black md:text-[70px] md:leading-[70px]">
                The Joy Code
              </h1>
            </div>

            {/* H1 divider */}
            <ScaffoldLine desktopOnly />

            {/* Intro paragraph */}
            <div className="px-5 py-6 md:px-0 md:max-w-[700px]">
              <p
                className="font-[400] text-[24px] leading-[50px] tracking-[0.8px] text-[#1E1E1E] text-left md:text-justify"
                style={{ fontFamily: 'var(--font-literata)' }}
              >
                Joy is being built in a time of real change in how humans live and work. Humans are adaptable, social, creative, and capable of great things. But the systems around us don&apos;t always support this. Too often, they treat people like resources to be managed rather than humans to be supported.
              </p>
              <p
                className="font-[400] text-[24px] leading-[50px] tracking-[0.8px] text-[#1E1E1E] text-left md:text-justify mt-6"
                style={{ fontFamily: 'var(--font-literata)' }}
              >
                The Joy Code exists to make clear what Joy is for, what it protects, and what it will not do. It applies to customers, community members, and anyone passing through. Anyone can hold us accountable to it.
              </p>
            </div>

            {/* Principles */}
            {principles.map((principle, index) => (
              <div key={index}>
                {/* Scaffold divider */}
                <ScaffoldLine />

                <div className="px-5 py-6 md:px-0 md:max-w-[700px]">
                  <h2 className="font-[800] text-[28px] leading-[36px] tracking-[0.8px] text-[#1E1E1E] mb-4 md:text-[40px] md:leading-[50px] md:mb-6">
                    {principle.heading}
                  </h2>
                  <p
                    className="font-[400] text-[24px] leading-[50px] tracking-[0.8px] text-[#1E1E1E] text-left md:text-justify"
                    style={{ fontFamily: 'var(--font-literata)' }}
                  >
                    {principle.body}
                  </p>
                </div>
              </div>
            ))}

            {/* Final scaffold divider */}
            <ScaffoldLine />

            {/* Closing statement */}
            <div className="px-5 py-6 md:px-0 md:max-w-[700px]">
              <p
                className="font-[800] text-[28px] leading-[36px] tracking-[0.8px] text-[#1E1E1E] md:text-[40px] md:leading-[50px]"
              >
                The Joy Code exists to protect what makes us human, even as the world around us changes.
              </p>
            </div>

            {/* Footer links */}
            <div className="px-5 py-6 md:px-0 md:pt-[30px] md:pb-[40px]">
              <p className="font-[400] text-[16px] leading-[24px] tracking-[1px] text-[#1E1E1E]/60 text-center mb-6">Joy 2026</p>
              <div className="flex flex-col gap-1 font-[400] text-[22px] leading-[36px] tracking-[1px] text-[#1E1E1E]">
                <a href="https://www.linkedin.com/company/feeljoy/" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">LinkedIn</a>
                <a href="/privacy-policy.pdf" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">Privacy Policy</a>
                <a href="/joy-code" className="font-[500] hover:opacity-70 transition-opacity">Joy Code</a>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
