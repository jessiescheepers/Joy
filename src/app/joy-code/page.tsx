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
  { label: "home", href: "/", orb: "/images/orbs/orb-home.png" },
  { label: "glow", href: "/#glow", orb: "/images/orbs/orb-glow.png" },
  { label: "about", href: "/#about", orb: "/images/orbs/orb-about.png" },
  { label: "contact", href: "/#contact", orb: "/images/orbs/orb-contact.png" },
];

const footerItems = [
  { label: "privacy policy", href: "/privacy-policy.pdf", orb: "/images/orbs/orb-privacy.png", external: true },
  { label: "linkedin", href: "https://www.linkedin.com/company/feeljoy/", orb: "/images/orbs/orb-linkedin.png", external: true },
  { label: "joy code", href: "/joy-code", orb: "/images/orbs/orb-joycode.png", external: false },
  { label: "waitlist", href: "/#hero", orb: "/images/orbs/orb-waitlist.png", external: false },
];

export default function JoyCode() {
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
      {/* Orb background */}
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
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-2 md:gap-3 transition-all duration-300 hover:opacity-70"
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
        </nav>

        {/* ═══ CONTENT ═══ */}
        <main className="max-w-[500px] mx-auto px-6 py-16 md:py-24">
          {/* Joy logo */}
          <div className="mb-8 md:mb-12">
            <JoyLogo width={160} height={84} />
          </div>

          {/* H1 */}
          <h1
            className="text-[28px] md:text-[50px] lg:text-[60px] leading-[1.12] tracking-[0.8px] mb-[20px] text-black"
            style={{ fontFamily: "var(--font-cooper)", fontWeight: 800 }}
          >
            the joy code
          </h1>

          {/* Intro */}
          <div
            className="text-[12px] md:text-[14px] lg:text-[18px] leading-[1.75] tracking-[1px] text-black mb-12 md:mb-16"
            style={{ fontFamily: "var(--font-literata)", fontWeight: 400 }}
          >
            <p className="mb-6 md:mb-8">
              Joy is being built in a time of real change in how humans live and work. Humans are adaptable, social, creative, and capable of great things. But the systems around us don&apos;t always support this. Too often, they treat people like resources to be managed rather than humans to be supported.
            </p>
            <p>
              The Joy Code exists to make clear what Joy is for, what it protects, and what it will not do. It applies to customers, community members, and anyone passing through. Anyone can hold us accountable to it.
            </p>
          </div>

          {/* Principles */}
          {principles.map((principle, index) => (
            <div key={index} className="mb-12 md:mb-16">
              <h2
                className="text-[20px] md:text-[28px] lg:text-[34px] leading-[1.2] tracking-[0.8px] mb-4 md:mb-6 text-black"
                style={{ fontFamily: "var(--font-cooper)", fontWeight: 800 }}
              >
                {principle.heading}
              </h2>
              <p
                className="text-[12px] md:text-[14px] lg:text-[18px] leading-[1.75] tracking-[1px] text-black"
                style={{ fontFamily: "var(--font-literata)", fontWeight: 400 }}
              >
                {principle.body}
              </p>
            </div>
          ))}

          {/* Closing statement */}
          <p
            className="text-[20px] md:text-[28px] lg:text-[34px] leading-[1.2] tracking-[0.8px] text-black mb-16 md:mb-24"
            style={{ fontFamily: "var(--font-cooper)", fontWeight: 800 }}
          >
            The Joy Code exists to protect what makes us human, even as the world around us changes.
          </p>
        </main>

      </div>

      {/* ═══ FOOTER ═══ */}
      <footer
        className="fixed bottom-0 left-0 right-0 z-[4] px-6 py-4 md:px-12 lg:px-20"
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

          <div>
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
