import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "./components/GoogleAnalytics";
import CookieConsent from "./components/CookieConsent";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://feeljoy.ai"),
  title: {
    default: "Joy — AI productivity built for human success",
    template: "%s | Joy",
  },
  description:
    "Joy is AI-powered productivity designed for human success, not constant strain. Work smarter, feel better, and achieve more — without burnout.",
  keywords: [
    "AI productivity",
    "burnout prevention",
    "human-centered AI",
    "work-life balance",
    "Joy AI",
  ],
  authors: [{ name: "Joy", url: "https://feeljoy.ai" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://feeljoy.ai",
    siteName: "Joy",
    title: "Joy — AI productivity built for human success",
    description:
      "AI-powered productivity designed for human success, not constant strain.",
    images: [{ url: "/images/joy-logo.png", alt: "Joy logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Joy — AI productivity built for human success",
    description:
      "AI-powered productivity designed for human success, not constant strain.",
    images: ["/images/joy-logo.png"],
  },
  icons: { icon: "/favicon.svg" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  other: {
    "theme-color": "#080B14",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Joy",
  url: "https://feeljoy.ai",
  logo: "https://feeljoy.ai/images/joy-logo.png",
  description:
    "AI-powered productivity designed for human success, not constant strain.",
  contactPoint: {
    "@type": "ContactPoint",
    url: "https://feeljoy.ai",
    contactType: "customer support",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ backgroundColor: "#080B14" }}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,200;1,300;1,400;1,500&family=Source+Serif+4:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${outfit.variable} antialiased`} style={{ backgroundColor: "#080B14" }}>
        <GoogleAnalytics />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
