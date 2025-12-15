/**
 * Real Estate Viewing Calendar Page
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { de } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const locales = {
  "de": de,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface ViewingEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: string;
  property_type: string;
  participant_count: number;
}

type CalendarView = "month" | "week" | "day" | "agenda";

export default function ViewingCalendarPage() {
  const [events, setEvents] = useState<ViewingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [tenantId] = useState("demo-tenant"); // TODO: Get from auth
  const [view, setView] = useState<CalendarView>("week");
  const [date, setDate] = useState(new Date());

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
        <CardContent className="p-6 h-[700px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            culture="de"
            messages={{
              next: "Weiter",
              previous: "Zurück",
              today: "Heute",
              month: "Monat",
              week: "Woche",
              day: "Tag",
              agenda: "Agenda",
              date: "Datum",
              time: "Uhrzeit",
              event: "Termin",
            }}
            eventPropGetter={(event) => ({
              className: `bg-primary text-primary-foreground rounded-md border-none ${
                event.status === 'completed' ? 'opacity-50' : ''
              }`,
            })}
          />
        </CardContent>
      </Card>
    </div>
  );
}


