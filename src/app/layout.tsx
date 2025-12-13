import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { RealtimeVoiceClientScript } from "../components/RealtimeVoiceClientScript";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

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
    <html lang="de" className={inter.variable}>
      <body className="bg-[var(--ak-color-bg-app)] text-[var(--ak-color-text-primary)] antialiased font-sans">
        <RealtimeVoiceClientScript />
        {children}
      </body>
    </html>
  );
}
