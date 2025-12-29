"use client";

import { useEffect, useState } from "react";
import { authedFetch } from "@/lib/api/authedFetch";

export type CalendarEvent = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  source?: string;
};

type UseCalendarEventsOptions = {
  tenantId: string;
  query?: string;
};

export function useCalendarEvents(options: UseCalendarEventsOptions) {
  const { tenantId, query } = options;
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await authedFetch("/api/calendar/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tenantId,
            query: query ?? "",
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          if (!cancelled) {
            setError(text || `Request failed with status ${res.status}`);
          }
          return;
        }

        const data = await res.json();

        if (!cancelled) {
          setEvents(data.events ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [tenantId, query]);

  return { events, loading, error };
}
