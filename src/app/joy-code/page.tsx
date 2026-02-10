"use client";

import JoyLogo from "../components/JoyLogo";

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

const navItems = [
  { label: "home", href: "/" },
  { label: "glow", href: "/#glow" },
  { label: "how it works", href: "/#how" },
  { label: "about", href: "/#about" },
  { label: "contact", href: "/#contact" },
];

const footerItems = [
  { label: "privacy policy", href: "/privacy-policy.pdf", external: true },
  { label: "linkedin", href: "https://www.linkedin.com/company/feeljoy/", external: true },
  { label: "joy code", href: "/joy-code", external: false },
];

export default function JoyCode() {
  return (
    <div className="relative min-h-screen">
      <div className="noise-overlay fixed inset-0 z-[2]" />

      {/* Page content */}
      <div className="relative z-[3]">

        {/* ═══ TOP NAV — glass morphism ═══ */}
        <nav
          className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 h-16 flex items-center justify-between"
          style={{
            background: "rgba(8,11,20,0.6)",
            backdropFilter: "blur(40px) saturate(1.8)",
            WebkitBackdropFilter: "blur(40px) saturate(1.8)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <a href="/" className="relative">
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

          <div className="flex items-center gap-6 md:gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="nav-link text-xs md:text-sm tracking-wide transition-colors duration-300 text-[var(--text-secondary)] hover:text-[var(--text)]"
                style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        {/* ═══ CONTENT ═══ */}
        <main className="max-w-[600px] mx-auto px-6 pt-32 pb-32">
          {/* Joy logo */}
          <div className="mb-10 md:mb-14 relative inline-flex">
            <JoyLogo width={120} height={63} color="#FFFFFF" />
            <span className="absolute -top-2 -right-5 w-4 h-4 section-orb" />
          </div>

          {/* H1 */}
          <h1
            className="mb-8"
            style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(1.4rem, 3.5vw, 2.4rem)", letterSpacing: "-0.02em", color: "var(--text)" }}
          >
            the joy code
          </h1>

          {/* Intro */}
          <div
            className="leading-[1.75] tracking-wide mb-16"
            style={{ fontFamily: "var(--font-body)", fontWeight: 300, color: "var(--text-secondary)", fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)" }}
          >
            <p className="mb-6">
              Joy is being built in a time of real change in how humans live and work. Humans are adaptable, social, creative, and capable of great things. But the systems around us don&apos;t always support this. Too often, they treat people like resources to be managed rather than humans to be supported.
            </p>
            <p>
              The Joy Code exists to make clear what Joy is for, what it protects, and what it will not do. It applies to customers, community members, and anyone passing through. Anyone can hold us accountable to it.
            </p>
          </div>

          {/* Principles */}
          {principles.map((principle, index) => (
            <div key={index} className="mb-14 md:mb-18">
              <h2
                className="mb-4 md:mb-6"
                style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(1rem, 2.5vw, 1.6rem)", letterSpacing: "-0.01em", color: "var(--text)" }}
              >
                {principle.heading}
              </h2>
              <p
                className="leading-[1.75] tracking-wide"
                style={{ fontFamily: "var(--font-body)", fontWeight: 300, color: "var(--text-secondary)", fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)" }}
              >
                {principle.body}
              </p>
            </div>
          ))}

          {/* Closing statement */}
          <p
            className="mb-24"
            style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(1rem, 2.5vw, 1.6rem)", letterSpacing: "-0.01em", color: "var(--text)" }}
          >
            The Joy Code exists to protect what makes us human, even as the world around us changes.
          </p>
        </main>

      </div>

      {/* ═══ FOOTER ═══ */}
      <footer
        className="fixed bottom-0 left-0 right-0 z-[4] px-6 py-4 md:px-12"
        style={{ borderTop: "1px solid var(--border)", background: "rgba(8,11,20,0.6)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-center gap-6 md:gap-10 lg:justify-between">
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
      </footer>
    </div>
  );
}
