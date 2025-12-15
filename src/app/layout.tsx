import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/apple-design-tokens.css";
import "../styles/visual-enhancements.css";
import "../styles/apple-refinements.css";
import { RealtimeVoiceClientScript } from "../components/RealtimeVoiceClientScript";
import { I18nProvider } from "../components/I18nProvider";
import { KeyboardShortcutsProvider } from "../components/KeyboardShortcutsProvider";
import { QueryProvider } from "../lib/queryClient";
import { PWARegister } from "../components/PWARegister";
import { AuthProvider } from "../contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Aklow Workspace",
  description: "Chat-zentrierte AppShell für deinen Workspace.",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AI Shield",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="de" className={inter.variable}>
      <body className="bg-transparent text-[var(--ak-color-text-primary)] antialiased font-sans">
        <QueryProvider>
          <AuthProvider>
            <I18nProvider>
              {/* AuthTokenRefresh temporarily disabled */}
              <PWARegister />
              <RealtimeVoiceClientScript />
              <KeyboardShortcutsProvider>
                {children}
              </KeyboardShortcutsProvider>
            </I18nProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
