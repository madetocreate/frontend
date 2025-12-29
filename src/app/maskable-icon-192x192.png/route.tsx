import { ImageResponse } from "next/og";

export const runtime = "edge";

function iconMarkup(size: number) {
  const bg = "#1F2937";
  const panel = "#111827";
  const fg = "#FFFFFF";

  const padding = Math.round(size * 0.18); // safe zone for maskable
  const inner = size - padding * 2;
  const radius = Math.round(inner * 0.26);
  const fontSize = Math.round(inner * 0.44);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: bg,
      }}
    >
      <div
        style={{
          width: inner,
          height: inner,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: panel,
          borderRadius: radius,
          color: fg,
          fontSize,
          fontWeight: 800,
          letterSpacing: -2,
          lineHeight: 1,
        }}
      >
        AK
      </div>
    </div>
  );
}

export function GET() {
  const size = 192;
  return new ImageResponse(iconMarkup(size), { width: size, height: size });
}

