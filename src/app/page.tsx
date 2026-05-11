import Image from "next/image";

export default function Home() {
  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#F9F8F4" }}
    >
      <div className="flex items-end gap-6">
        <Image
          src="/images/joy-logo-black.png"
          alt="Joy"
          width={120}
          height={120}
          priority
          style={{ objectFit: "contain" }}
        />
        <p
          style={{
            fontFamily: "'Atkinson Hyperlegible Next', sans-serif",
            fontWeight: 800,
            fontSize: "20px",
            color: "#1a1a1a",
            letterSpacing: "0.03em",
            textTransform: "lowercase",
            position: "relative",
            bottom: "6px",
          }}
        >
          working together, again. soon.
        </p>
      </div>
    </main>
  );
}
