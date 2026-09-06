import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

export const alt = "Nazarii Tsubera — Software engineer, San Antonio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** One social card for every page, in the Mineral palette. */
export default async function Image() {
  const portrait = await readFile(path.join(process.cwd(), "public", "portrait.png"));
  const src = `data:image/png;base64,${portrait.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: "#f3f4f3",
        color: "#171a1a",
        fontFamily: "Georgia, serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 700 }}>
        <div style={{ fontSize: 22, letterSpacing: "0.14em", textTransform: "uppercase", color: "#636866", fontFamily: "monospace" }}>
          San Antonio, Texas
        </div>
        <div style={{ fontSize: 64, lineHeight: 1.05, letterSpacing: "-0.02em", marginTop: 28 }}>
          I automate the work your business still does by hand.
        </div>
        <div style={{ display: "flex", alignItems: "baseline", marginTop: 40, fontSize: 30 }}>
          nt<span style={{ color: "#1a5490" }}>.</span>
          <span style={{ marginLeft: 16, fontSize: 26, color: "#4a4f4e" }}>Nazarii Tsubera</span>
        </div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={300} height={300} style={{ borderRadius: 150, objectFit: "cover" }} />
    </div>,
    size,
  );
}
