import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Newsreader } from "next/font/google";

import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-newsreader",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

const TITLE = "Nazarii Tsubera — Software engineer, San Antonio";
const DESCRIPTION =
  "Backend and infrastructure engineer in San Antonio. I build production software, and I help local businesses replace the work they still do by hand.";

export const metadata: Metadata = {
  metadataBase: new URL("https://nazariitsubera.com"),
  title: { default: TITLE, template: "%s — Nazarii Tsubera" },
  description: DESCRIPTION,
  authors: [{ name: "Nazarii Tsubera", url: "https://nazariitsubera.com" }],
  creator: "Nazarii Tsubera",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  // No title or description here: each page's own flows into its social card. The root only
  // sets what is the same everywhere.
  openGraph: { type: "website", siteName: "Nazarii Tsubera", locale: "en_US" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#f3f4f3" };

const person = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Nazarii Tsubera",
  url: "https://nazariitsubera.com/",
  jobTitle: "Backend and infrastructure engineer",
  image: "https://nazariitsubera.com/portrait.png",
  email: "hello@nazariitsubera.com",
  telephone: "+1-210-980-6600",
  address: { "@type": "PostalAddress", addressLocality: "San Antonio", addressRegion: "TX", addressCountry: "US" },
  sameAs: ["https://github.com/NazariiTsubera", "https://www.linkedin.com/in/nazarii-tsubera-b4198b240/"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${newsreader.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body>
        <link rel="alternate" type="application/rss+xml" title="Nazarii Tsubera — Writing" href="/feed.xml" />
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
      </body>
    </html>
  );
}
