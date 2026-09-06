import type { Metadata } from "next";
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
  openGraph: {
    type: "website",
    siteName: "Nazarii Tsubera",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
  },
  twitter: { card: "summary_large_image" },
};

const person = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Nazarii Tsubera",
  url: "https://nazariitsubera.com/",
  jobTitle: "Backend and infrastructure engineer",
  email: "nazartsubera@gmail.com",
  telephone: "+1-210-980-6600",
  address: { "@type": "PostalAddress", addressLocality: "San Antonio", addressRegion: "TX", addressCountry: "US" },
  sameAs: ["https://github.com/NazariiTsubera", "https://www.linkedin.com/in/nazarii-tsubera-b4198b240/"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${newsreader.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
      </body>
    </html>
  );
}
