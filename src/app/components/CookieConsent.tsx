"use client";

import { useEffect, useState } from "react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("joy-consent");
    if (consent !== "accepted" && consent !== "declined") {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem("joy-consent", "accepted");
    window.dispatchEvent(new Event("joy-consent-change"));
    setVisible(false);
  }

  function decline() {
    localStorage.setItem("joy-consent", "declined");
    setVisible(false);
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.3s ease-out",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto 16px",
          padding: "16px 20px",
          background: "var(--card)",
          color: "var(--text)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontSize: 14,
          boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
        }}
      >
        <p style={{ margin: 0, flex: 1 }}>
          We use cookies for analytics to improve your experience.
        </p>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            onClick={decline}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text)",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Decline
          </button>
          <button
            onClick={accept}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: "var(--text)",
              color: "var(--card)",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
