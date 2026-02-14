"use client";

export default function JoyLogoV2({ width = 121, height = 63, color = "#FFFFFF" }: { width?: number; height?: number; color?: string }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 110 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Joy logo"
    >
      {/* j — dot + stem with hook */}
      <circle cx="12" cy="4" r="3.5" fill={color} />
      <path
        d="M12 15 V43 Q12 56 3 58"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* o — perfect circle */}
      <circle cx="44" cy="31" r="14" stroke={color} strokeWidth="3" fill="none" />

      {/* y — two arms meeting + descender */}
      <path
        d="M72 15 L87 43"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M102 15 L87 43 Q83 53 78 58"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
