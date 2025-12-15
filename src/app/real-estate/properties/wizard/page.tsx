/**
 * Property Wizard Page - Step-by-step property onboarding
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

interface Checklist {
  required_fields: string[];
  recommended_fields: string[];
  missing_documents: string[];
  geg87_compliant: boolean;
  completion_percentage: number;
}

export default function PropertyWizardPage() {
  const [step, setStep] = useState("basic_info");
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(false);
  const [tenantId] = useState("demo-tenant"); // TODO: Get from auth

  const [formData, setFormData] = useState({
    property_type: "apartment",
    address: {
      street: "",
      city: "",
      zip: "",
    },
    specifications: {
      rooms: "",
      living_space: "",
      year_built: "",
      energy_class: "",
      energy_carrier: "",
      energy_value: "",
      energy_certificate_type: "",
    },
    pricing: {
      purchase_price: "",
      rent: "",
    },
  });

  const handleStepSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/real-estate/properties/wizard/step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: tenantId,
          step,
          data: formData,
          property_id: propertyId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save step");
      }

      const result = await response.json();
      setPropertyId(result.property_id);
      setChecklist(result.checklist);

      // Move to next step
      const nextSteps = result.next_steps;
      if (nextSteps && nextSteps.length > 0) {
        setStep(nextSteps[0]);
      }
    } catch (err) {
      alert(`Fehler: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: "basic_info", label: "Grunddaten" },
    { id: "address", label: "Adresse" },
    { id: "specifications", label: "Spezifikationen" },
    { id: "pricing", label: "Preise" },
    { id: "documents", label: "Dokumente" },
    { id: "photos", label: "Fotos" },
    { id: "review", label: "Überprüfung" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Objektaufnahme-Wizard</h1>
        <p className="text-muted-foreground mt-2">
          Schritt-für-Schritt Objektaufnahme mit Checkliste
        </p>
      </div>

      {checklist && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Fortschritt</CardTitle>
            <CardDescription>
              {checklist.completion_percentage}% abgeschlossen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={checklist.completion_percentage} className="mb-4" />
            {checklist.required_fields.length > 0 && (
              <div className="text-sm text-red-500 mb-2">
                Fehlend: {checklist.required_fields.join(", ")}
              </div>
            )}
            {checklist.missing_documents.length > 0 && (
              <div className="text-sm text-yellow-500 mb-2">
                Dokumente fehlen: {checklist.missing_documents.join(", ")}
              </div>
            )}
            {checklist.geg87_compliant ? (
              <div className="text-sm text-green-500">GEG §87 konform ✅</div>
            ) : (
              <div className="text-sm text-red-500">GEG §87 nicht konform ❌</div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            Schritt {currentStepIndex + 1} von {steps.length}: {steps[currentStepIndex]?.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === "basic_info" && (
            <div className="space-y-4">
              <div>
                <Label>Objekttyp</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={formData.property_type}
                  onChange={(e) =>
                    setFormData({ ...formData, property_type: e.target.value })
                  }
                >
                  <option value="apartment">Wohnung</option>
                  <option value="house">Haus</option>
                  <option value="commercial">Gewerbe</option>
                  <option value="land">Grundstück</option>
                </select>
              </div>
            </div>
          )}

          {step === "address" && (
            <div className="space-y-4">
              <div>
                <Label>Straße</Label>
                <Input
                  value={formData.address.street}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, street: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label>PLZ</Label>
                <Input
                  value={formData.address.zip}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, zip: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label>Stadt</Label>
                <Input
                  value={formData.address.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          )}

          {step === "specifications" && (
            <div className="space-y-4">
              <div>
                <Label>Zimmer</Label>
                <Input
                  type="number"
                  value={formData.specifications.rooms}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specifications: {
                        ...formData.specifications,
                        rooms: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label>Wohnfläche (m²)</Label>
                <Input
                  type="number"
                  value={formData.specifications.living_space}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specifications: {
                        ...formData.specifications,
                        living_space: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label>Baujahr</Label>
                <Input
                  type="number"
                  value={formData.specifications.year_built}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specifications: {
                        ...formData.specifications,
                        year_built: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label>Energieeffizienzklasse</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={formData.specifications.energy_class}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specifications: {
                        ...formData.specifications,
                        energy_class: e.target.value,
                      },
                    })
                  }
                >
                  <option value="">Bitte wählen</option>
                  <option value="A+">A+</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                  <option value="F">F</option>
                  <option value="G">G</option>
                  <option value="H">H</option>
                </select>
              </div>
              <div>
                <Label>Energieträger</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={formData.specifications.energy_carrier}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specifications: {
                        ...formData.specifications,
                        energy_carrier: e.target.value,
                      },
                    })
                  }
                >
                  <option value="">Bitte wählen</option>
                  <option value="gas">Gas</option>
                  <option value="oil">Heizöl</option>
                  <option value="electric">Strom</option>
                  <option value="heat_pump">Wärmepumpe</option>
                  <option value="solar">Solar</option>
                </select>
              </div>
              <div>
                <Label>Energieverbrauch (kWh/(m²·a))</Label>
                <Input
                  type="number"
                  value={formData.specifications.energy_value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specifications: {
                        ...formData.specifications,
                        energy_value: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label>Art des Energieausweises</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={formData.specifications.energy_certificate_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specifications: {
                        ...formData.specifications,
                        energy_certificate_type: e.target.value,
                      },
                    })
                  }
                >
                  <option value="">Bitte wählen</option>
                  <option value="consumption">Verbrauchsausweis</option>
                  <option value="demand">Bedarfsausweis</option>
                </select>
              </div>
            </div>
          )}

          {step === "pricing" && (
            <div className="space-y-4">
              <div>
                <Label>Kaufpreis (€)</Label>
                <Input
                  type="number"
                  value={formData.pricing.purchase_price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricing: {
                        ...formData.pricing,
                        purchase_price: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label>Miete (€/Monat)</Label>
                <Input
                  type="number"
                  value={formData.pricing.rent}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricing: {
                        ...formData.pricing,
                        rent: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => {
                const prevIndex = Math.max(0, currentStepIndex - 1);
                setStep(steps[prevIndex].id);
              }}
              disabled={currentStepIndex === 0}
            >
              Zurück
            </Button>
            <Button onClick={handleStepSubmit} disabled={loading}>
              {loading ? "Speichern..." : "Weiter"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

