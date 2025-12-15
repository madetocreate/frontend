/**
 * Real Estate Exposé Editor Page
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";

// Mock implementation of a simple WYSIWYG editor using Textarea for now
// In a real implementation, use something like Tiptap or Slate.js

export default function ExposeEditorPage({}: { params: { propertyId: string } }) {
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState({
    headline: "",
    description: "",
    highlights: [] as string[],
    location_desc: "",
    amenities_desc: "",
  });

  useEffect(() => {
    // Mock fetch
    const loadData = async () => {
      setLoading(true);
      // Simulate network delay
      setTimeout(() => {
        setContent({
          headline: "Traumhafte 3-Zimmer-Wohnung mit Balkon",
          description: "Diese helle Wohnung befindet sich in...",
          highlights: ["Südbalkon", "Einbauküche", "Parkett"],
          location_desc: "Zentrale Lage in Berlin-Mitte...",
          amenities_desc: "Gehobene Ausstattung mit...",
        });
        setLoading(false);
      }, 500);
    };
    loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    setTimeout(() => {
      setSaving(false);
      alert("Exposé gespeichert!");
    }, 500);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Exposé Editor</h1>
          <p className="text-muted-foreground">Bearbeiten Sie die Texte für Ihr Exposé</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Speichern
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Texte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Überschrift</Label>
                <Input 
                  value={content.headline} 
                  onChange={(e) => setContent({...content, headline: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Beschreibung</Label>
                <Textarea 
                  value={content.description} 
                  onChange={(e) => setContent({...content, description: e.target.value})}
                  className="min-h-[150px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Lagebeschreibung</Label>
                <Textarea 
                  value={content.location_desc} 
                  onChange={(e) => setContent({...content, location_desc: e.target.value})}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Ausstattungsbeschreibung</Label>
                <Textarea 
                  value={content.amenities_desc} 
                  onChange={(e) => setContent({...content, amenities_desc: e.target.value})}
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Column (Mock) */}
        <div className="space-y-6">
          <Card className="bg-slate-50 border-dashed">
            <CardHeader>
              <CardTitle>Vorschau (Portal)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white p-6 shadow-sm rounded-lg">
                <h2 className="text-xl font-bold mb-4">{content.headline || "Titel..."}</h2>
                <div className="flex gap-2 mb-4">
                  {content.highlights.map((h, i) => (
                    <span key={i} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{h}</span>
                  ))}
                </div>
                <div className="prose text-sm text-slate-600">
                  <p>{content.description || "Beschreibung..."}</p>
                  <h4 className="font-semibold mt-4">Lage</h4>
                  <p>{content.location_desc}</p>
                  <h4 className="font-semibold mt-4">Ausstattung</h4>
                  <p>{content.amenities_desc}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


