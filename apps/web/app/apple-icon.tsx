import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** The favicon's mark at home-screen size. */
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#17181a",
        color: "#f7f6f3",
        fontFamily: "Georgia, serif",
        fontSize: 104,
        letterSpacing: -6,
        paddingBottom: 8,
      }}
    >
      nt<span style={{ color: "#e0517f" }}>.</span>
    </div>,
    size,
  );
}
