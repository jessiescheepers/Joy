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
    body: "Trust grows when people understand how their information is used and protected. Joy treats privacy as infrastructure, not a policy. What is shared is clear. With whom it is shared is clear. Why it is shared is clear. If trust is unclear, the system needs fixing. If Joy receives a legal demand for user data, we notify the user where we are legally permitted to do so, and we will not share more than is legally required.",
  },
  {
    heading: "Humans function better with clarity than complexity",
    body: "Simplicity supports attention, understanding, and follow-through. Joy follows YAGNI. We build what is genuinely useful and avoid features that create noise instead of value.",
  },
  {
    heading: "Humans deserve access to support",
    body: "Support should not be limited to those who can afford it. Joy is designed to be accessible. When it comes to pricing, we are clear about what is paid and why.",
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
  return (
    <div className="relative min-h-screen" style={{ background: "var(--qi-base)", color: "var(--qi-text)" }}>

      {/* Nav — matches main site */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 h-16 flex items-center justify-between">
        <a href="/" className="relative">
          <JoyLogo width={50} height={26} color="#2A2E24" />
        </a>
        <a
          href="/"
          className="text-xs tracking-wide"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400, color: "var(--qi-text-secondary)" }}
        >
          back to joy
        </a>
      </nav>

      {/* Content */}
      <main className="max-w-[540px] mx-auto px-6 pt-32 pb-32">
        <h1
          className="mb-3"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            fontSize: "clamp(0.95rem, 2vw, 1.5rem)",
            letterSpacing: "0.02em",
            color: "var(--qi-text-secondary)",
          }}
        >
          the joy{" "}
          <em style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontWeight: 400,
            fontStyle: "italic",
            color: "var(--qi-text)",
            letterSpacing: "-0.01em",
          }}>
            code
          </em>
        </h1>

        <p
          className="mb-12"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontWeight: 300,
            fontStyle: "italic",
            fontSize: "clamp(0.75rem, 1vw, 0.85rem)",
            color: "var(--qi-text-tertiary)",
            letterSpacing: "0.02em",
          }}
        >
          v1.0 &middot; March 2026
        </p>

        {/* Intro */}
        <div
          className="leading-[1.9] tracking-wide mb-16"
          style={{ fontWeight: 300, color: "var(--qi-text-secondary)", fontSize: "clamp(0.85rem, 1.1vw, 0.95rem)" }}
        >
          <p className="mb-6">
            Joy is being built in a time of real change in how humans live and work. Humans are adaptable, social, creative, and capable of great things. But the systems around us don&apos;t always support this.
          </p>
          <p>
            The Joy Code exists to make clear what Joy is for, what it protects, and what it will not do. We publish this code publicly and invite anyone to raise concerns directly with us.
          </p>
        </div>

        {/* Principles */}
        {principles.map((principle, index) => (
          <div key={index} className="mb-14">
            <h2
              className="mb-4"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 300,
                fontSize: "clamp(0.9rem, 1.5vw, 1.15rem)",
                letterSpacing: "0.01em",
                color: "var(--qi-text)",
              }}
            >
              {principle.heading}
            </h2>
            <p
              className="leading-[1.9] tracking-wide"
              style={{ fontWeight: 300, color: "var(--qi-text-secondary)", fontSize: "clamp(0.85rem, 1.1vw, 0.95rem)" }}
            >
              {principle.body}
            </p>
          </div>
        ))}

        {/* Closing */}
        <p
          className="mt-8 mb-16"
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
          The Joy Code exists to protect what makes us human, even as the world around us changes.
        </p>
      </main>

      {/* Footer — same whisper as main site */}
      <footer className="relative z-[6] px-6 py-8 md:px-12">
        <div className="max-w-[1400px] mx-auto flex items-center justify-center gap-6">
          <a
            href="/privacy-policy.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] tracking-widest uppercase"
            style={{ fontFamily: "var(--font-display)", color: "var(--qi-text-tertiary)" }}
          >
            privacy
          </a>
          <a
            href="/"
            className="text-[10px] tracking-widest uppercase"
            style={{ fontFamily: "var(--font-display)", color: "var(--qi-text-tertiary)" }}
          >
            home
          </a>
          <span className="text-[10px] tracking-widest uppercase" style={{ fontFamily: "var(--font-display)", color: "var(--qi-text-tertiary)" }}>
            &copy; 2026 Joy
          </span>
        </div>
      </footer>
    </div>
  );
}
