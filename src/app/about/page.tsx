"use client";

import Image from "next/image";
import { useState } from "react";
import JoyLogo from "../components/JoyLogo";
import ScaffoldLine from "../components/ScaffoldLine";

export default function About() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative mx-auto max-w-[1440px] min-h-screen snap-container">
      {/* Background layers - fixed behind everything */}
      <div className="fixed inset-0 z-0 max-w-[1440px] mx-auto">
        {/* Green-tinted background with watercolor */}
        <div className="absolute inset-0 bg-white" />
        <div className="absolute inset-0" style={{ background: 'rgba(120, 123, 108, 0.7)' }} />
        {/* Watercolor texture - mobile uses background-artwork, desktop uses watercolour */}
        <div
          className="md:hidden absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'url(/images/background-artwork.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        <div
          className="hidden md:block absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'url(/images/watercolour.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        <div className="noise-overlay" />
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
                  <a href="/about" className="lowercase font-[705] text-[18px] text-[var(--color-primary)] flex items-center gap-3 relative pl-[25px]" onClick={() => setMenuOpen(false)}>
                    <span className="w-[8px] h-[8px] rounded-full bg-[var(--color-primary)] inline-block absolute left-0" />
                    about
                  </a>
                  <a href="#contact" className="lowercase font-[400] text-[18px] text-[var(--color-primary-60)] flex items-center gap-3 relative pl-[25px]" onClick={() => setMenuOpen(false)}>
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
              href="/about"
              className="lowercase font-[500] text-[24px] leading-[30px] tracking-[0.8px] text-black/80 flex items-center gap-3 relative"
            >
              <span className="w-[10px] h-[10px] rounded-full bg-black/80 inline-block absolute -left-[25px]" />
              about
            </a>
            <a
              href="#contact"
              className="lowercase font-[400] text-[24px] leading-[30px] tracking-[0.8px] text-[rgba(30,30,30,0.6)] flex items-center gap-3 hover:text-black/80 transition-colors relative"
            >
              <span className="w-[10px] h-[10px] rounded-full border border-[rgba(30,30,30,0.6)] inline-block absolute -left-[25px]" />
              contact
            </a>
          </nav>

          {/* Main Content */}
          <main className="flex flex-col flex-grow justify-start p-5 md:pt-[120px] md:pl-[40px] md:pr-0 md:pb-20 md:max-w-[1128px]">
            {/* H1 - About Joy */}
            <div className="p-5 md:p-0">
              <h1 className="font-[800] text-[40px] leading-[40px] tracking-[0.8px] text-black md:text-[120px] md:leading-[120px]">
                About Joy
              </h1>
            </div>

            {/* H1 divider - extends left to meet vertical scaffold */}
            <ScaffoldLine desktopOnly />

            {/* Founder image - mobile only, below H1 */}
            <div className="md:hidden px-5 py-[10px]">
              <Image
                src="/images/about-artwork.png"
                alt=""
                width={335}
                height={335}
                className="w-full h-auto rounded-[20px] object-cover"
              />
            </div>

            {/* Section 1: Body text + artwork (desktop: side by side) */}
            <div className="relative snap-section">
              {/* Body text */}
              <div className="px-5 py-6 md:px-0 md:w-[500px]">
                <p
                  className="font-[400] text-[24px] leading-[50px] tracking-[0.8px] text-[#1E1E1E] text-justify"
                  style={{ fontFamily: 'var(--font-literata)' }}
                >
                  When work and life are managed separately, the human in between carries the weight. Space meant for creativity, care, and focus slowly fills with admin and the mental load of constant context-switching. Joy brings work and life into one space, designed to hold the complexity and help you sort it. With less mental load, there&apos;s more room to live and work in a way that works.
                </p>
              </div>

              {/* Artwork - desktop only, positioned right */}
              <div className="hidden md:block absolute right-0 top-[50px] w-[600px] h-[600px]">
                <Image
                  src="/images/about-artwork.png"
                  alt=""
                  width={600}
                  height={600}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Section divider - extends left to meet vertical scaffold */}
            <ScaffoldLine desktopOnly />

            {/* Section 2: About the founders */}
            <section className="mt-10 md:mt-[60px] snap-section">
              {/* H2 - desktop only */}
              <h2 className="hidden md:block font-[800] text-[60px] leading-[60px] tracking-[0.8px] text-[#1E1E1E] mb-6">
                About the founders
              </h2>

              {/* H2 divider - desktop only */}
              <ScaffoldLine desktopOnly />

              {/* Desktop: Three columns */}
              <div className="hidden md:flex flex-row gap-[64px] mt-10">
                <div className="w-[322px]">
                  <p className="font-[800] text-[28px] leading-[50px] tracking-[0.8px] text-[#1E1E1E] text-justify">
                    Calvin is a product builder with a strong instinct for usefulness and design. He&apos;s founded before and spent years building people technology at scale. At Joy, he leads product and engineering, focused on clarity, craft, and tools that quietly do their job well.
                  </p>
                </div>
                <div className="w-[322px]">
                  <p className="font-[800] text-[28px] leading-[50px] tracking-[0.8px] text-[#1E1E1E] text-justify">
                    Jessie is an operator with experience across sales, market expansion, and people leadership in high-growth Nordic companies. She&apos;s spent a decade building teams and systems with a people-first lens. At Joy, she shapes vision, strategy, and how Joy feels to use.
                  </p>
                </div>
                <div className="w-[322px]">
                  <p className="font-[800] text-[28px] leading-[50px] tracking-[0.8px] text-[#1E1E1E] text-justify">
                    Together, we&apos;ve spent years working on the same problem from different angles: helping humans thrive while doing great work. Joy is the product we wished existed earlier.
                  </p>
                </div>
              </div>

              {/* Mobile: Single flowing text block */}
              <div className="md:hidden px-5 py-6">
                <p
                  className="font-[700] text-[24px] leading-[50px] tracking-[0.8px] text-[#1E1E1E] text-justify"
                  style={{ fontFamily: 'var(--font-literata)' }}
                >
                  Calvin is a product builder with a strong instinct for usefulness and design. He&apos;s founded before and spent years building people technology at scale. At Joy, he leads product and engineering, focused on clarity, craft, and tools that quietly do their job well. Jessie is an operator with experience across sales, market expansion, and people leadership in high-growth Nordic companies. She&apos;s spent a decade building teams and systems with a people-first lens. At Joy, she shapes vision, strategy, and how Joy feels to use. Together, we&apos;ve spent years working on the same problem from different angles: helping humans thrive while doing great work. Joy is the product we wished existed earlier.
                </p>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
