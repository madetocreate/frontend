/**
 * Lead Inbox Page for Real Estate
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Lead {
  id: string;
  source: string;
  lead_type: string;
  contact: {
    name: string;
    email?: string;
    phone?: string;
  };
  requirements?: {
    property_type?: string;
    location?: string;
    budget_min?: number;
    budget_max?: number;
    rooms_min?: number;
    living_space_min?: number;
  };
  urgency: string;
  timeline: string;
  status: string;
  matched_properties: string[];
  created_at: string;
}

export default function LeadInboxPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenantId] = useState("demo-tenant"); // TODO: Get from auth

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/real-estate/leads/inbox?tenant_id=${tenantId}&status=new`);
      if (!response.ok) {
        throw new Error("Failed to fetch leads");
      }
      const data = await response.json();
      setLeads(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchLeads();
    // Refresh every 30 seconds
    const interval = setInterval(fetchLeads, 30000);
    return () => clearInterval(interval);
  }, [fetchLeads]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getLeadTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      buyer: "Käufer",
      seller: "Verkäufer",
      renter: "Mieter",
      investor: "Investor",
    };
    return labels[type] || type;
  };

  if (loading && leads.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Lead-Inbox</h1>
        <div className="text-center py-12">Lade Leads...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Lead-Inbox</h1>
        <div className="text-center py-12 text-red-500">Fehler: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Lead-Inbox</h1>
        <p className="text-muted-foreground mt-2">
          Alle Leads aus E-Mail, Telefon, Portalen und Website
        </p>
      </div>

      <Tabs defaultValue="new" className="space-y-4">
        <TabsList>
          <TabsTrigger value="new">Neu ({leads.filter((l) => l.status === "new").length})</TabsTrigger>
          <TabsTrigger value="contacted">Kontaktiert</TabsTrigger>
          <TabsTrigger value="qualified">Qualifiziert</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4">
          {leads.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Keine neuen Leads
              </CardContent>
            </Card>
          ) : (
            leads.map((lead) => (
              <Card key={lead.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{lead.contact.name}</CardTitle>
                      <CardDescription>
                        {lead.contact.email} {lead.contact.phone && `| ${lead.contact.phone}`}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getUrgencyColor(lead.urgency)}>
                        {lead.urgency}
                      </Badge>
                      <Badge>{getLeadTypeLabel(lead.lead_type)}</Badge>
                      <Badge variant="outline">{lead.source}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {lead.requirements && (
                    <div className="space-y-2 mb-4">
                      {lead.requirements.property_type && (
                        <div className="text-sm">
                          <span className="font-semibold">Objekttyp:</span> {lead.requirements.property_type}
                        </div>
                      )}
                      {lead.requirements.location && (
                        <div className="text-sm">
                          <span className="font-semibold">Lage:</span> {lead.requirements.location}
                        </div>
                      )}
                      {lead.requirements.budget_max && (
                        <div className="text-sm">
                          <span className="font-semibold">Budget:</span> bis {lead.requirements.budget_max.toLocaleString("de-DE")} €
                        </div>
                      )}
                      {lead.requirements.rooms_min && (
                        <div className="text-sm">
                          <span className="font-semibold">Zimmer:</span> min. {lead.requirements.rooms_min}
                        </div>
                      )}
                    </div>
                  )}
                  {lead.matched_properties.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm text-muted-foreground">
                        {lead.matched_properties.length} passende Objekte gefunden
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm">Draft-Antwort anzeigen</Button>
                    <Button size="sm" variant="outline">
                      Objekte zuweisen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

