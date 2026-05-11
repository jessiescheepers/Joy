import type { Metadata } from "next";
import "./globals.css";
import GoogleAnalytics from "./components/GoogleAnalytics";
import CookieConsent from "./components/CookieConsent";

export const metadata: Metadata = {
  metadataBase: new URL("https://feeljoy.ai"),
  title: "Joy — Coming Soon",
  description: "Joy is coming soon.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://feeljoy.ai",
    siteName: "Joy",
    title: "Joy — Coming Soon",
    description: "Joy is coming soon.",
    images: [{ url: "/images/joy-logo-black.png", alt: "Joy logo" }],
  },
  other: {
    "theme-color": "#F9F8F4",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ backgroundColor: "#F9F8F4" }}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" style={{ backgroundColor: "#F9F8F4" }}>
        <GoogleAnalytics />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
