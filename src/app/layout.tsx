import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { RealtimeVoiceClientScript } from "../components/RealtimeVoiceClientScript";

export const metadata: Metadata = {
  title: "Aklow Workspace",
  description: "Chat-zentrierte AppShell für deinen Workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="bg-[var(--ak-color-bg-app)] text-[var(--ak-color-text-primary)] antialiased">
        <RealtimeVoiceClientScript />
        {children}
      </body>
    </html>
  );
}
