/**
 * Real Estate Viewing Calendar Page
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ViewingEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: string;
  property_type: string;
  participant_count: number;
}

export default function ViewingCalendarPage() {
  const [events, setEvents] = useState<ViewingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [tenantId] = useState("demo-tenant"); // TODO: Get from auth
  const [date] = useState(new Date());

  const fetchViewings = useCallback(async () => {
    setLoading(true);
    try {
      // Calculate start and end based on view
      const start = new Date(date);
      start.setDate(start.getDate() - 30); // Simple range for now
      const end = new Date(date);
      end.setDate(end.getDate() + 30);

      const response = await fetch(
        `/api/real-estate/calendar/viewings?tenant_id=${tenantId}&start_date=${start.toISOString()}&end_date=${end.toISOString()}`
      );
      if (!response.ok) throw new Error("Failed to fetch viewings");
      
      const data = await response.json();
      const parsedEvents = data.map((event: ViewingEvent) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));
      setEvents(parsedEvents);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [date, tenantId]);

  useEffect(() => {
    fetchViewings();
  }, [fetchViewings]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Besichtigungskalender</h1>
          <p className="text-muted-foreground">Verwalten Sie Ihre Besichtigungstermine</p>
        </div>
        <Button onClick={fetchViewings} variant="outline" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Aktualisieren
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-sm text-muted-foreground">
            Hinweis: Kalender-Grid ist im Minimal-Build deaktiviert (fehlende optionale UI-Packages).
            Termine werden als Liste dargestellt.
          </div>
          <div className="mt-4 space-y-2">
            {events.length === 0 ? (
              <div className="text-sm text-muted-foreground">Keine Termine im Zeitraum.</div>
            ) : (
              events.map((e) => (
                <div key={e.id} className="rounded-lg border p-3">
                  <div className="text-sm font-semibold">{e.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {e.start.toLocaleString()} – {e.end.toLocaleString()} · {e.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


