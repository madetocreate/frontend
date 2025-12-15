/**
 * Real Estate Properties Management Page
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Property {
  id: string;
  property_type: string;
  address: {
    street: string;
    city: string;
    zip: string;
  };
  specifications: {
    rooms?: number;
    living_space?: number;
    year_built?: number;
    energy_class?: string;
  };
  pricing: {
    purchase_price?: number;
    rent?: number;
  };
  status: string;
  photos: string[];
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenantId] = useState("demo-tenant"); // TODO: Get from auth

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/real-estate/properties?tenant_id=${tenantId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch properties");
      }
      const data = await response.json();
      setProperties(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const generateExpose = async (propertyId: string, variant: string = "portal") => {
    try {
      const response = await fetch(`/api/real-estate/properties/${propertyId}/expose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: tenantId,
          property_id: propertyId,
          variant,
          language: "de",
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate exposé");
      }
      const data = await response.json();
      alert(`Exposé generiert! GEG §87 Compliant: ${data.geg87_compliant ? "Ja" : "Nein"}`);
    } catch (err) {
      alert(`Fehler: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">Lade Objekte...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12 text-red-500">Fehler: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Immobilien-Verwaltung</h1>
        <p className="text-muted-foreground mt-2">Verwalten Sie Ihre Immobilien-Objekte</p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Alle</TabsTrigger>
          <TabsTrigger value="active">Aktiv</TabsTrigger>
          <TabsTrigger value="draft">Entwurf</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {properties.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Noch keine Objekte vorhanden
              </div>
            ) : (
              properties.map((property) => (
                <Card key={property.id}>
                  <CardHeader>
                    <CardTitle>
                      {property.property_type === "apartment" ? "Wohnung" : "Haus"} in {property.address.city}
                    </CardTitle>
                    <CardDescription>
                      {property.address.street}, {property.address.zip} {property.address.city}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {property.specifications.rooms && (
                        <div className="text-sm">
                          <span className="font-semibold">Zimmer:</span> {property.specifications.rooms}
                        </div>
                      )}
                      {property.specifications.living_space && (
                        <div className="text-sm">
                          <span className="font-semibold">Wohnfläche:</span> {property.specifications.living_space} m²
                        </div>
                      )}
                      {property.pricing.purchase_price && (
                        <div className="text-sm">
                          <span className="font-semibold">Kaufpreis:</span> {property.pricing.purchase_price.toLocaleString("de-DE")} €
                        </div>
                      )}
                      {property.pricing.rent && (
                        <div className="text-sm">
                          <span className="font-semibold">Miete:</span> {property.pricing.rent.toLocaleString("de-DE")} €
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => generateExpose(property.id, "portal")}
                      >
                        Exposé (Portal)
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generateExpose(property.id, "pdf")}
                      >
                        Exposé (PDF)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

