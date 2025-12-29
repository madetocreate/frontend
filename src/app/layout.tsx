import type { Metadata } from "next";
import type { Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
// Apple Design CSS files are now scoped to .ak-apple-demo class only
// Import them conditionally or add the class to demo/showcase routes
// import "../styles/apple-design-tokens.css";
// import "../styles/visual-enhancements.css";
// import "../styles/apple-refinements.css";
import { RealtimeVoiceClientScript } from "../components/RealtimeVoiceClientScript";
import { I18nProvider } from "../components/I18nProvider";
import { KeyboardShortcutsProvider } from "../components/KeyboardShortcutsProvider";
import { QueryProvider } from "../lib/queryClient";
import { AuthProvider } from "../contexts/AuthContext";
import { AppSettingsProvider } from "../contexts/AppSettingsContext";
import { ThemeProvider } from "../components/ui/ThemeProvider";
import { ActionRegistryValidator } from "../components/actions/ActionRegistryValidator";
import { OnboardingOverlayProvider } from "../components/onboarding/OnboardingOverlayProvider";
import { ToastProvider } from "../components/ui/ToastProvider";
import { Toaster } from "../components/ui/Toaster";
import { ServiceWorkerRegister } from "../components/pwa/ServiceWorkerRegister";
import { NetworkStatus } from "../components/pwa/NetworkStatus";
import { PWAInstallationTracker } from "../components/pwa/PWAInstallationTracker";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  applicationName: "AKLOW",
  title: "Aklow | Enterprise Workspace",
  description: "Die intelligente Plattform für Kommunikation, Marketing und Management.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AKLOW",
  },
  formatDetection: {
    telephone: false, // Verhindert automatische Telefonnummern-Links auf iOS
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "AKLOW",
    // Splash Screen für iOS (wird automatisch aus apple-touch-icon generiert)
    "apple-touch-startup-image": "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover", // Für Edge-to-Edge auf Geräten mit Notch
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfb" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1c1e" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="de" className={inter.variable} suppressHydrationWarning>
      <body className="ak-app-bg ak-text-primary antialiased font-sans">
        <ServiceWorkerRegister />
        <NetworkStatus />
        <PWAInstallationTracker />
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <AppSettingsProvider>
                <I18nProvider>
                  {/* AuthTokenRefresh temporarily disabled */}
                  <RealtimeVoiceClientScript />
                  <ActionRegistryValidator />
                  <KeyboardShortcutsProvider>
                    <ToastProvider>
                      <Toaster />
                      <OnboardingOverlayProvider>
                        {children}
                      </OnboardingOverlayProvider>
                    </ToastProvider>
                  </KeyboardShortcutsProvider>
                </I18nProvider>
              </AppSettingsProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
