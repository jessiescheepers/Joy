import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "./components/GoogleAnalytics";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Joy",
  description: "Designed for human success, not constant strain",
  icons: {
    icon: "/favicon.svg",
  },
  other: {
    "theme-color": "#080B14",
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
      </head>
      <body className={`${outfit.variable} antialiased`} style={{ backgroundColor: "#080B14" }}>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
