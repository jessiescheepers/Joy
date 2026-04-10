"use client";

/**
 * Sun88 logo — gentle rotation, catches a specular glint
 * at one point in the cycle. Glacially slow.
 */
export default function SunGlowLogo({ size = 48 }: { size?: number }) {
  return (
    <>
      <style>{`
        @keyframes sun-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes sun-glint {
          0%, 82% {
            filter: drop-shadow(0 0 3px rgba(0,0,0,0.15)) drop-shadow(0 0 6px rgba(255,250,235,0.7)) drop-shadow(0 0 14px rgba(255,248,220,0.4));
          }
          88% {
            filter: drop-shadow(0 0 3px rgba(0,0,0,0.15)) drop-shadow(0 0 10px rgba(255,255,255,0.9)) drop-shadow(0 0 24px rgba(255,250,235,0.8)) drop-shadow(0 0 40px rgba(255,248,220,0.5));
          }
          94%, 100% {
            filter: drop-shadow(0 0 3px rgba(0,0,0,0.15)) drop-shadow(0 0 6px rgba(255,250,235,0.7)) drop-shadow(0 0 14px rgba(255,248,220,0.4));
          }
        }
      `}</style>
      <div
        style={{
          width: size,
          height: size,
          position: "relative",
          flexShrink: 0,
          animation: "sun-glint 30s ease-in-out infinite",
        }}
      >
        <svg
          viewBox="0 40 2360 2350"
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ animation: "sun-rotate 30s linear infinite" }}
        >
          {/* 7 triangles — filled with light */}
          <path d="M63.8453 1669.88L450.378 1185.02L677.009 1762.2L63.8453 1669.88Z" fill="rgba(255,255,255,0.85)" />
          <path d="M125.621 669.352L745.387 649.8L452.437 1196.31L125.621 669.352Z" fill="rgba(255,255,255,0.85)" />
          <path d="M837.289 2351.12L1267.51 1904.58L665.687 1755.26L837.289 2351.12Z" fill="rgba(255,255,255,0.85)" />
          <path d="M1928.23 349.405L1344.01 557.226L1816.1 959.257L1928.23 349.405Z" fill="rgba(255,255,255,0.85)" />
          <path d="M2326.88 1298.21L1815.85 947.001L1767.21 1565.16L2326.88 1298.21Z" fill="rgba(255,255,255,0.85)" />
          <path d="M966.338 76.7745L1352.61 561.833L739.403 653.83L966.338 76.7745Z" fill="rgba(255,255,255,0.85)" />
          <path d="M1819.25 2169.85L1768.68 1551.85L1258.75 1904.64L1819.25 2169.85Z" fill="rgba(255,255,255,0.85)" />
        </svg>
      </div>
    </>
  );
}
