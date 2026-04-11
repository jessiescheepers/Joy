"use client";

/**
 * Sun Circle logo — 7 curved blades + hand-drawn centre disc.
 * Gentle rotation, catches a specular glint. Glacially slow.
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
            filter: drop-shadow(0 0 4px rgba(0,0,0,0.25)) drop-shadow(0 0 8px rgba(0,0,0,0.1)) drop-shadow(0 0 6px rgba(255,250,235,0.7)) drop-shadow(0 0 14px rgba(255,248,220,0.4));
          }
          88% {
            filter: drop-shadow(0 0 4px rgba(0,0,0,0.25)) drop-shadow(0 0 8px rgba(0,0,0,0.1)) drop-shadow(0 0 10px rgba(255,255,255,0.9)) drop-shadow(0 0 24px rgba(255,250,235,0.8)) drop-shadow(0 0 40px rgba(255,248,220,0.5));
          }
          94%, 100% {
            filter: drop-shadow(0 0 4px rgba(0,0,0,0.25)) drop-shadow(0 0 8px rgba(0,0,0,0.1)) drop-shadow(0 0 6px rgba(255,250,235,0.7)) drop-shadow(0 0 14px rgba(255,248,220,0.4));
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
          viewBox="0 0 2360 2460"
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ animation: "sun-rotate 30s linear infinite" }}
        >
          {/* 7 curved blades + centre disc — Sun Circle */}
          <path d="M24.9801 1562.02L460.476 1120.61C446.031 1360.04 481.376 1490.99 624.993 1718.47L24.9801 1562.02Z" fill="white" />
          <path d="M183.004 574.717L801.837 613.943C623.646 766.643 545.099 875.955 458.45 1130.25L183.004 574.717Z" fill="white" />
          <path d="M735.402 2320.01L1203.62 1913.48C959.768 1900.1 831.576 1855.1 617.444 1711.26L735.402 2320.01Z" fill="white" />
          <path d="M2010.98 425.203L1409.72 576.767C1648.88 718.035 1756.4 809.481 1841.61 1021.7L2010.98 425.203Z" fill="white" />
          <path d="M2314.82 1409.2L1839.35 1011.18C1888.68 1259.51 1866.29 1393.35 1732.38 1621.96L2314.82 1409.2Z" fill="white" />
          <path d="M1070.34 62.3166L1414.59 578.053C1167.58 515.995 1032.56 531.678 795.824 618.314L1070.34 62.3166Z" fill="white" />
          <path d="M1724.22 2236.02L1738.05 1616.1C1565.88 1815.88 1446.3 1880.58 1194.27 1914.07L1724.22 2236.02Z" fill="white" />
          <path d="M1821.05 1289.54C1788.65 1630.17 1497.24 1906.63 1123.8 1871.11C704.7 1861.52 461.317 1549.58 493.719 1208.96C526.121 868.331 797.084 532.453 1191.18 588.69C1638.69 612.511 1853.45 948.917 1821.05 1289.54Z" fill="white" />
        </svg>
      </div>
    </>
  );
}
