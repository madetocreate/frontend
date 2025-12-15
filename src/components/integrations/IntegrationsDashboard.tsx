"use client";

import React, { useState, useEffect, useCallback } from "react";

interface Connection {
  tenant_id: string;
  provider: string;
  status: "connected" | "disconnected" | "pending" | "error";
  nango_connection_id?: string;
  scopes: string[];
  auth_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface ProviderInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const PROVIDERS: ProviderInfo[] = [
  {
    id: "google",
    name: "Google Calendar",
    description: "Kalender-Events lesen und erstellen",
    icon: "📅",
    color: "bg-blue-50 border-blue-200",
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Dateien und Dokumente verwalten",
    icon: "📁",
    color: "bg-blue-50 border-blue-200",
  },
  {
    id: "shopify",
    name: "Shopify",
    description: "Bestellungen und Kunden verwalten",
    icon: "🛒",
    color: "bg-green-50 border-green-200",
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    description: "WooCommerce Bestellungen verwalten",
    icon: "🛍️",
    color: "bg-purple-50 border-purple-200",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "CRM und Marketing Automation",
    icon: "🎯",
    color: "bg-orange-50 border-orange-200",
  },
  {
    id: "zendesk",
    name: "Zendesk",
    description: "Customer Support und Tickets",
    icon: "🎫",
    color: "bg-blue-50 border-blue-200",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Notizen und Dokumentation",
    icon: "📝",
    color: "bg-gray-50 border-gray-200",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Team-Kommunikation und Nachrichten",
    icon: "💬",
    color: "bg-purple-50 border-purple-200",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "Nachrichten senden und empfangen",
    icon: "📱",
    color: "bg-green-50 border-green-200",
  },
  // Hotel & Booking Platforms
  {
    id: "booking-com",
    name: "Booking.com",
    description: "Reservierungen und Buchungen verwalten",
    icon: "🏨",
    color: "bg-blue-50 border-blue-200",
  },
  {
    id: "airbnb",
    name: "Airbnb",
    description: "Airbnb Reservierungen verwalten",
    icon: "🏡",
    color: "bg-pink-50 border-pink-200",
  },
  {
    id: "expedia",
    name: "Expedia",
    description: "Expedia Buchungen verwalten",
    icon: "✈️",
    color: "bg-orange-50 border-orange-200",
  },
  {
    id: "hrs",
    name: "HRS",
    description: "HRS Reservierungen verwalten",
    icon: "🌐",
    color: "bg-red-50 border-red-200",
  },
  {
    id: "hotels-com",
    name: "Hotels.com",
    description: "Hotels.com Buchungen verwalten",
    icon: "🏖️",
    color: "bg-yellow-50 border-yellow-200",
  },
  {
    id: "trivago",
    name: "Trivago",
    description: "Trivago Buchungen verwalten",
    icon: "🔍",
    color: "bg-purple-50 border-purple-200",
  },
  {
    id: "agoda",
    name: "Agoda",
    description: "Agoda Reservierungen verwalten",
    icon: "🌏",
    color: "bg-indigo-50 border-indigo-200",
  },
  {
    id: "padel",
    name: "Padel",
    description: "Padel Reservierungen (Spanien)",
    icon: "🇪🇸",
    color: "bg-red-50 border-red-200",
  },
  // Real Estate Platforms
  {
    id: "immobilienscout24",
    name: "Immobilienscout24",
    description: "Immobilien verwalten und veröffentlichen",
    icon: "🏢",
    color: "bg-blue-50 border-blue-200",
  },
  {
    id: "idealista",
    name: "Idealista",
    description: "Immobilien verwalten (Spanien)",
    icon: "🇪🇸",
    color: "bg-orange-50 border-orange-200",
  },
  {
    id: "immowelt",
    name: "ImmoWelt",
    description: "Immobilien verwalten",
    icon: "🌍",
    color: "bg-green-50 border-green-200",
  },
  {
    id: "ebay-kleinanzeigen",
    name: "eBay Kleinanzeigen",
    description: "Immobilien inserieren",
    icon: "📋",
    color: "bg-yellow-50 border-yellow-200",
  },
  {
    id: "wohnung-de",
    name: "Wohnung.de",
    description: "Wohnungen verwalten",
    icon: "🏠",
    color: "bg-blue-50 border-blue-200",
  },
  {
    id: "immonet",
    name: "Immonet",
    description: "Immobilien verwalten",
    icon: "🏘️",
    color: "bg-purple-50 border-purple-200",
  },
  {
    id: "fotocasa",
    name: "Fotocasa",
    description: "Immobilien verwalten (Spanien)",
    icon: "📸",
    color: "bg-red-50 border-red-200",
  },
  {
    id: "habitaclia",
    name: "Habitaclia",
    description: "Immobilien verwalten (Spanien)",
    icon: "🏛️",
    color: "bg-orange-50 border-orange-200",
  },
  // Health & Practice Management Platforms
  {
    id: "microsoft-365",
    name: "Microsoft 365",
    description: "Outlook Kalender und E-Mail",
    icon: "📧",
    color: "bg-blue-50 border-blue-200",
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "Video-Konsultationen und Telemedizin",
    icon: "📹",
    color: "bg-blue-50 border-blue-200",
  },
  {
    id: "calendly",
    name: "Calendly",
    description: "Terminbuchung und Scheduling",
    icon: "📅",
    color: "bg-purple-50 border-purple-200",
  },
  {
    id: "doxy-me",
    name: "Doxy.me",
    description: "Telemedizin-Plattform",
    icon: "🩺",
    color: "bg-green-50 border-green-200",
  },
  {
    id: "simplepractice",
    name: "SimplePractice",
    description: "Practice Management System",
    icon: "💼",
    color: "bg-indigo-50 border-indigo-200",
  },
  {
    id: "jane-app",
    name: "Jane App",
    description: "Practice Management System",
    icon: "🏥",
    color: "bg-pink-50 border-pink-200",
  },
  {
    id: "epic-mychart",
    name: "Epic MyChart",
    description: "EHR Integration (FHIR)",
    icon: "📋",
    color: "bg-orange-50 border-orange-200",
  },
  {
    id: "doctolib",
    name: "Doctolib",
    description: "Terminbuchung (Europa)",
    icon: "🇪🇺",
    color: "bg-blue-50 border-blue-200",
  },
  // Apple Services
  {
    id: "apple-signin",
    name: "Apple Sign In",
    description: "Apple ID Authentifizierung",
    icon: "🍎",
    color: "bg-gray-50 border-gray-200",
  },
  {
    id: "icloud-calendar",
    name: "iCloud Calendar",
    description: "iCloud Kalender verwalten",
    icon: "📅",
    color: "bg-blue-50 border-blue-200",
  },
  {
    id: "icloud-drive",
    name: "iCloud Drive",
    description: "iCloud Drive Dateien verwalten",
    icon: "☁️",
    color: "bg-blue-50 border-blue-200",
  },
  {
    id: "apple-push-notifications",
    name: "Apple Push Notifications",
    description: "Push-Benachrichtigungen senden",
    icon: "🔔",
    color: "bg-gray-50 border-gray-200",
  },
  // Review Platforms
  {
    id: "trustpilot",
    name: "Trustpilot",
    description: "Bewertungen verwalten und Einladungen senden",
    icon: "⭐",
    color: "bg-green-50 border-green-200",
  },
  {
    id: "tripadvisor",
    name: "Tripadvisor",
    description: "Reisebewertungen und Antworten verwalten",
    icon: "🦉",
    color: "bg-emerald-50 border-emerald-200",
  },
  {
    id: "google-reviews",
    name: "Google Reviews",
    description: "Google My Business Bewertungen",
    icon: "🔵",
    color: "bg-blue-50 border-blue-200",
  },
  {
    id: "yelp",
    name: "Yelp",
    description: "Yelp Bewertungen und Antworten",
    icon: "💬",
    color: "bg-red-50 border-red-200",
  },
  {
    id: "facebook-reviews",
    name: "Facebook Reviews",
    description: "Facebook Seitenbewertungen",
    icon: "📘",
    color: "bg-blue-50 border-blue-200",
  },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_CONTROL_PLANE_URL || "http://localhost:4051";

export default function IntegrationsDashboard() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenantId] = useState("default-tenant"); // TODO: Get from context/auth

  const loadConnections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY || "";
      if (!adminKey) {
        throw new Error("NEXT_PUBLIC_ADMIN_KEY nicht gesetzt");
      }
      
      const response = await fetch(`${API_BASE_URL}/v1/integrations/`, {
        method: "GET",
        headers: {
          "x-tenant-id": tenantId,
          "x-ai-shield-admin-key": adminKey,
          "Content-Type": "application/json",
        },
        mode: "cors",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to load connections: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      setConnections(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Failed to load connections:", err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const handleConnect = async (provider: string) => {
    try {
      setError(null);
      
      const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY || "";
      if (!adminKey) {
        throw new Error("NEXT_PUBLIC_ADMIN_KEY nicht gesetzt");
      }
      
      const response = await fetch(`${API_BASE_URL}/v1/integrations/${provider}/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ai-shield-admin-key": adminKey,
        },
        mode: "cors",
        body: JSON.stringify({
          tenant_id: tenantId,
          provider: provider,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to initiate connection: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      // If auth_url is provided, redirect user
      if (data.auth_url) {
        window.location.href = data.auth_url;
      } else {
        // Reload connections
        await loadConnections();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect";
      setError(errorMessage);
      console.error("Failed to connect:", err);
    }
  };

  const handleDisconnect = async (provider: string) => {
    if (!confirm(`Möchten Sie ${provider} wirklich trennen?`)) {
      return;
    }

    try {
      setError(null);
      
      const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY || "";
      if (!adminKey) {
        throw new Error("NEXT_PUBLIC_ADMIN_KEY nicht gesetzt");
      }
      
      const response = await fetch(
        `${API_BASE_URL}/v1/integrations/${provider}/disconnect?tenant_id=${tenantId}`,
        {
          method: "POST",
          headers: {
            "x-ai-shield-admin-key": adminKey,
            "Content-Type": "application/json",
          },
          mode: "cors",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to disconnect: ${response.status} ${response.statusText} - ${errorText}`);
      }

      await loadConnections();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to disconnect";
      setError(errorMessage);
      console.error("Failed to disconnect:", err);
    }
  };

  const getConnectionStatus = (provider: string): Connection | undefined => {
    return connections.find((c) => c.provider === provider);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      connected: "bg-green-100 text-green-800 border-green-200",
      disconnected: "bg-gray-100 text-gray-800 border-gray-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      error: "bg-red-100 text-red-800 border-red-200",
    };

    const labels = {
      connected: "Verbunden",
      disconnected: "Nicht verbunden",
      pending: "Ausstehend",
      error: "Fehler",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded border ${styles[status as keyof typeof styles] || styles.disconnected}`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Integrationen</h1>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Integrationen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Integrationen</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <strong>Fehler:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PROVIDERS.map((provider) => {
          const connection = getConnectionStatus(provider.id);
          const isConnected = connection?.status === "connected";

          return (
            <div
              key={provider.id}
              className={`p-6 rounded-lg border-2 ${provider.color} transition-shadow hover:shadow-lg`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{provider.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold">{provider.name}</h3>
                    <p className="text-sm text-gray-600">{provider.description}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                {getStatusBadge(connection?.status || "disconnected")}
                {connection?.scopes && connection.scopes.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">Berechtigungen:</p>
                    <div className="flex flex-wrap gap-1">
                      {connection.scopes.map((scope, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-xs bg-white rounded border border-gray-200"
                        >
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {isConnected ? (
                  <button
                    onClick={() => handleDisconnect(provider.id)}
                    className="flex-1 px-4 py-2 bg-white text-gray-900 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Trennen
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(provider.id)}
                    className="flex-1 px-4 py-2 bg-white text-gray-900 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Verbinden
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
