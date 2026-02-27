"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function GoogleAnalytics() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("joy-consent") === "accepted") {
      setConsented(true);
    }

    function onConsentChange() {
      if (localStorage.getItem("joy-consent") === "accepted") {
        setConsented(true);
      }
    }

    window.addEventListener("joy-consent-change", onConsentChange);
    return () => window.removeEventListener("joy-consent-change", onConsentChange);
  }, []);

  if (!GA_ID || GA_ID === "your-ga-measurement-id-here") return null;
  if (!consented) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
