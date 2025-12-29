import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AKLOW",
    short_name: "AKLOW",
    description: "Die intelligente Plattform für Kommunikation, Marketing und Management.",
    id: "/aklow",
    start_url: "/inbox?source=pwa",
    scope: "/",
    display: "standalone",
    background_color: "#fbfbfb",
    theme_color: "#1c1c1e",
    lang: "de-DE",
    categories: ["business", "productivity"],
    orientation: "any", // Erlaubt Portrait und Landscape für Tablet-Nutzung
    icons: [
      // Standard Icons (statische Dateien in public/icons/)
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      // Maskable Icons (für Android Adaptive Icons)
      {
        src: "/icons/maskable-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      // Apple Touch Icon
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Inbox",
        short_name: "Inbox",
        description: "Posteingang öffnen",
        url: "/inbox?source=pwa-shortcut",
      },
      {
        name: "Dokumente",
        short_name: "Docs",
        description: "Dokumente öffnen",
        url: "/service-hub?area=docs&source=pwa-shortcut",
      },
      {
        name: "Kunden",
        short_name: "Kunden",
        description: "Kunden öffnen",
        url: "/customers?source=pwa-shortcut",
      },
    ],
    share_target: {
      action: "/inbox",
      method: "GET",
      enctype: "application/x-www-form-urlencoded",
      params: {
        title: "title",
        text: "text",
        url: "url",
      },
    },
  };
}
