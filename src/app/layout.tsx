import type { Metadata } from "next";
import { Literata } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "./components/GoogleAnalytics";

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Joy",
  description: "Designed for human success, not constant strain",
  icons: {
    icon: "/favicon.svg",
  },
  other: {
    "theme-color": "#DFE0E7",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ backgroundColor: "#DFE0E7" }}>
      <body className={`${literata.variable} antialiased`} style={{ backgroundColor: "#DFE0E7" }}>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
