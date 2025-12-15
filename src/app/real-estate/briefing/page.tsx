/**
 * Morning Briefing Dashboard Page
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sun, Calendar, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Viewing {
  time: string;
  title: string;
  contact: string;
}

interface UrgentTask {
  title: string;
  type: string;
}

interface BriefingData {
  date: string;
  greeting: string;
  weather: string;
  metrics: {
    new_leads: number;
    emails: number;
    tasks: number;
  };
  viewings: Viewing[];
  urgent_tasks: UrgentTask[];
  alerts: string[];
}

export default function MorningBriefingPage() {
  const [data, setData] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In real implementation, this would fetch from /api/real-estate/briefing/daily
    // Mock data for immediate visual
    setTimeout(() => {
      setData({
        date: new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        greeting: "Guten Morgen, Alex!",
        weather: "Sonnig, 18°C",
        metrics: {
          new_leads: 5,
          emails: 12,
          tasks: 3
        },
        viewings: [
          { time: "10:00", title: "Besichtigung: Musterstr. 123", contact: "Max Mustermann" },
          { time: "14:30", title: "Besichtigung: Hauptstr. 45", contact: "Erika Musterfrau" }
        ],
        urgent_tasks: [
          { title: "Exposé für Objekt 456 freigeben", type: "approval" },
          { title: "Rückruf Herr Müller (Notar)", type: "call" }
        ],
        alerts: [
          "Energieausweis für Objekt 789 läuft bald ab"
        ]
      });
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="bg-yellow-100 p-3 rounded-full">
          <Sun className="h-8 w-8 text-yellow-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{data.greeting}</h1>
          <p className="text-slate-500">{data.date} • {data.weather}</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-4xl font-bold text-blue-700">{data.metrics.new_leads}</CardTitle>
            <CardDescription className="text-blue-600 font-medium">Neue Leads</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="link" className="px-0 text-blue-700 h-auto">Zur Inbox &rarr;</Button>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-4xl font-bold text-purple-700">{data.metrics.emails}</CardTitle>
            <CardDescription className="text-purple-600 font-medium">Ungelesene E-Mails</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="link" className="px-0 text-purple-700 h-auto">Zu den E-Mails &rarr;</Button>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-4xl font-bold text-green-700">{data.metrics.tasks}</CardTitle>
            <CardDescription className="text-green-600 font-medium">Offene Aufgaben</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="link" className="px-0 text-green-700 h-auto">Zur Aufgabenliste &rarr;</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-slate-500" />
              <CardTitle>Heute anstehend</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.viewings.map((viewing: Viewing, i: number) => (
                <div key={i} className="flex items-start gap-4 p-3 rounded-lg border bg-white hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col items-center min-w-[60px] bg-slate-100 rounded p-2">
                    <Clock className="h-4 w-4 text-slate-500 mb-1" />
                    <span className="font-bold text-slate-700">{viewing.time}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{viewing.title}</h4>
                    <p className="text-sm text-slate-500">{viewing.contact}</p>
                  </div>
                </div>
              ))}
              {data.viewings.length === 0 && (
                <p className="text-slate-500 italic">Keine Termine für heute.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <CardTitle>Dringend & Wichtig</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.urgent_tasks.map((task: UrgentTask, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border-l-4 border-l-amber-500 bg-amber-50/50">
                  <div className="flex items-center gap-3">
                    {task.type === 'approval' ? (
                      <CheckCircle2 className="h-5 w-5 text-amber-600" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                    )}
                    <span className="font-medium text-slate-800">{task.title}</span>
                  </div>
                  <Button size="sm" variant="ghost">Erledigen</Button>
                </div>
              ))}
              
              {data.alerts.map((alert: string, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {alert}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


