"use client";

import { useEffect, useState } from "react";

type GreetingCard = {
  id: string;
  type: string;
  title: string;
  subtitle?: string | null;
  body?: string | null;
};

type FeedResponse = {
  context: {
    userId: string;
    locale: string;
    now: string;
  };
  cards: GreetingCard[];
};

export function NewsGreetingWidget() {
  const [data, setData] = useState<FeedResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const resp = await fetch("/api/newsmanager/feed");
        if (!resp.ok) {
          throw new Error("feed error");
        }
        const json = (await resp.json()) as FeedResponse;
        setData(json);
      } catch (err) {
        console.error("NewsGreetingWidget error", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">News werden geladen…</div>;
  }

  if (!data || !data.cards || data.cards.length === 0) {
    return <div className="p-6 text-sm text-slate-500">Keine Empfehlungen gefunden.</div>;
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Guten Morgen!
        </h2>
        <p className="text-sm text-slate-600">
          Hier sind aktuelle News und Themen für dich.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.cards.slice(0, 6).map((card) => (
          <article
            key={card.id}
            className="flex flex-col rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur"
          >
            <h3 className="text-base font-semibold text-slate-900">
              {card.title}
            </h3>
            {card.subtitle && (
              <p className="mt-1 text-xs text-slate-500">{card.subtitle}</p>
            )}
            {card.body && (
              <p className="mt-2 line-clamp-3 text-sm text-slate-700">
                {card.body}
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
