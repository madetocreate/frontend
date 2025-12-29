"use client";

/**
 * Test-Komponente für PWA-Features
 * Kann in Dev-Mode verwendet werden, um Features zu testen
 */

import { usePWAInstall } from "../../hooks/usePWAInstall";
import { usePWAInstallation } from "../../hooks/usePWAInstallation";
import { useWebShare } from "../../hooks/useWebShare";
import { useAppBadge } from "../../hooks/useAppBadge";
import { AkButton } from "../ui/AkButton";
import { toast } from "sonner";

export function PWATestPage() {
  const { isInstallable, install, isInstalled } = usePWAInstall();
  const { isInstalled: isTrackedInstalled, installationDate } = usePWAInstallation();
  const { isSupported: isShareSupported, share } = useWebShare();
  const { setBadge, clearBadge } = useAppBadge();

  const handleShare = async () => {
    await share({
      title: "AKLOW",
      text: "Teste die AKLOW PWA",
      url: window.location.href,
    });
  };

  const handleSetBadge = () => {
    setBadge(5);
    toast.success("App Badge gesetzt", {
      description: "Das Badge sollte jetzt am App-Icon sichtbar sein.",
    });
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">PWA Features Test</h1>

      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Installation</h2>
          <p>Installable: {isInstallable ? "Ja" : "Nein"}</p>
          <p>Installed: {isInstalled ? "Ja" : "Nein"}</p>
          <p>Tracked Installed: {isTrackedInstalled ? "Ja" : "Nein"}</p>
          {installationDate && <p>Installation Date: {installationDate.toLocaleString()}</p>}
          {isInstallable && (
            <AkButton onClick={install} className="mt-2">
              App installieren
            </AkButton>
          )}
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Web Share</h2>
          <p>Supported: {isShareSupported ? "Ja" : "Nein"}</p>
          <AkButton onClick={handleShare} disabled={!isShareSupported} className="mt-2">
            Teilen
          </AkButton>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">App Badge</h2>
          <div className="space-x-2">
            <AkButton onClick={handleSetBadge}>Badge setzen (5)</AkButton>
            <AkButton onClick={() => clearBadge()}>Badge entfernen</AkButton>
          </div>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Feature Flags</h2>
          <p>Background Sync: {process.env.NEXT_PUBLIC_PWA_BACKGROUND_SYNC === "1" ? "Enabled" : "Disabled"}</p>
          <p>Query Persistence: {process.env.NEXT_PUBLIC_PWA_QUERY_PERSISTENCE === "1" ? "Enabled" : "Disabled"}</p>
          <p>PWA Dev Mode: {process.env.NEXT_PUBLIC_PWA_DEV === "1" ? "Enabled" : "Disabled"}</p>
        </div>
      </div>
    </div>
  );
}

