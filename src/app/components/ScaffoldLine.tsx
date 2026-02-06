"use client";

import { useEffect, useRef, useState } from "react";

export default function ScaffoldLine({ desktopOnly = false }: { desktopOnly?: boolean }) {
  const lineRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const calculate = () => {
      if (!lineRef.current) return;
      // Find the vertical scaffold line by its position (left: 230px inside the max-w container)
      const verticalLine = document.querySelector('[data-scaffold-vertical]') as HTMLElement;
      if (!verticalLine) return;

      const verticalRect = verticalLine.getBoundingClientRect();
      const lineRect = lineRef.current.getBoundingClientRect();

      // The offset is how far left the line needs to extend to reach the vertical line's right edge
      const needed = lineRect.left - (verticalRect.left + verticalRect.width);
      setOffset(needed);
    };

    calculate();
    window.addEventListener("resize", calculate);
    return () => window.removeEventListener("resize", calculate);
  }, []);

  return (
    <>
      {/* Mobile line */}
      {!desktopOnly && (
        <div
          className="md:hidden"
          style={{
            height: '1px',
            background: 'rgba(39, 38, 130, 0.15)',
            marginTop: '24px',
            marginBottom: '24px',
          }}
        />
      )}
      {/* Desktop line — dynamically extends left to meet vertical scaffold */}
      <div
        ref={lineRef}
        className="hidden md:block"
        style={{
          height: '1px',
          background: 'rgba(39, 38, 130, 0.15)',
          marginTop: '24px',
          marginBottom: '24px',
          marginLeft: offset ? `-${offset}px` : undefined,
          width: offset ? `calc(100% + ${offset}px)` : '100%',
        }}
      />
    </>
  );
}
