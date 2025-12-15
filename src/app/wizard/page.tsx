"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  MapPin,
  Ruler,
  FileText,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Briefcase,
  User,
  LayoutGrid,
  Target,
  Megaphone,
  Users2,
  Banknote,
  Share2,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// ------------ Types ------------

type Address = {
  street: string;
  zip: string;
  city: string;
  country: string;
};

type Specifications = {
  rooms: string;
  living_space: string;
  plot_size: string;
  year_built: string;
  energy_class: string;
  energy_carrier: string;
  energy_value: string;
  energy_certificate_type: string;
  condition: string;
};

type Pricing = {
  purchase_price: string;
  rent: string;
  additional_costs: string;
  deposit: string;
};

type RealEstateForm = {
  property_type: "apartment" | "house" | "commercial" | "land";
  status: "draft" | "active" | "sold";
  address: Address;
  specifications: Specifications;
  pricing: Pricing;
};

type UserOnboardingForm = {
  role: "agent" | "admin";
  personal: { firstname: string; lastname: string; email: string };
  settings: { notifications: boolean };
};

type CampaignGoal = "awareness" | "leads" | "sales" | "retention";
type Channel = "social" | "email" | "seo" | "ads" | "content";

type MarketingCampaignForm = {
  name: string;
  goal: CampaignGoal;
  audience: {
    age_range: string;
    interests: string;
  };
  channels: Channel[];
  budget: string;
};

type StepComponent<Data> = (props: {
  data: Data;
  update: (section: string, field?: string, value?: unknown) => void;
}) => ReactNode;

type WizardStep<Data> = {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  component: StepComponent<Data>;
};

type WizardScenario<Data> = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  steps: WizardStep<Data>[];
  initialData: Data;
};

// ------------ Step Components (Real Estate) ------------

const StepBasicInfo: StepComponent<RealEstateForm> = ({ data, update }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="space-y-2">
      <h3 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">Grunddaten</h3>
      <p className="text-[#86868B]">Art und Status des Objekts festlegen.</p>
    </div>

    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-xs font-medium uppercase tracking-wider text-[#86868B]">Objekttyp</Label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: "apartment", label: "Wohnung", icon: Building2 },
            { id: "house", label: "Haus", icon: MapPin },
            { id: "commercial", label: "Gewerbe", icon: Briefcase },
            { id: "land", label: "Grundstück", icon: LayoutGrid },
          ].map((type) => {
            const Icon = type.icon;
            const isSelected = data.property_type === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => update("property_type", undefined, type.id)}
                className={cn(
                  "cursor-pointer relative group flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300",
                  isSelected
                    ? "border-[#0066CC] bg-[#0066CC]/5 shadow-sm ring-1 ring-[#0066CC]"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                )}
              >
                <Icon
                  className={cn(
                    "w-8 h-8 mb-3 transition-colors",
                    isSelected ? "text-[#0066CC]" : "text-gray-400 group-hover:text-gray-600"
                  )}
                />
                <span
                  className={cn(
                    "font-medium transition-colors",
                    isSelected ? "text-[#0066CC]" : "text-gray-600 group-hover:text-gray-900"
                  )}
                >
                  {type.label}
                </span>
                {isSelected && (
                  <div className="absolute top-3 right-3 text-[#0066CC]">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-xs font-medium uppercase tracking-wider text-[#86868B]">Status</Label>
        <Select value={data.status} onValueChange={(val) => update("status", undefined, val)}>
          <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:ring-[#0066CC] bg-white text-base">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Entwurf (Privat)</SelectItem>
            <SelectItem value="active">Aktiv (Veröffentlicht)</SelectItem>
            <SelectItem value="sold">Verkauft / Archiviert</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
);

const StepAddress: StepComponent<RealEstateForm> = ({ data, update }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="space-y-2">
      <h3 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">Standort</h3>
      <p className="text-[#86868B]">Wo befindet sich das Objekt?</p>
    </div>

    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-xs font-medium uppercase tracking-wider text-[#86868B]">Straße & Nr.</Label>
        <Input
          value={data.address.street}
          onChange={(e) => update("address", "street", e.target.value)}
          className="h-12 rounded-xl border-gray-200 focus:border-[#0066CC] focus:ring-[#0066CC] bg-white text-base"
          placeholder="Beispielstraße 12"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-3 col-span-1">
          <Label className="text-xs font-medium uppercase tracking-wider text-[#86868B]">PLZ</Label>
          <Input
            value={data.address.zip}
            onChange={(e) => update("address", "zip", e.target.value)}
            className="h-12 rounded-xl border-gray-200 focus:border-[#0066CC] focus:ring-[#0066CC] bg-white text-base"
            placeholder="10115"
          />
        </div>
        <div className="space-y-3 col-span-2">
          <Label className="text-xs font-medium uppercase tracking-wider text-[#86868B]">Stadt</Label>
          <Input
            value={data.address.city}
            onChange={(e) => update("address", "city", e.target.value)}
            className="h-12 rounded-xl border-gray-200 focus:border-[#0066CC] focus:ring-[#0066CC] bg-white text-base"
            placeholder="Berlin"
          />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex gap-4 items-start">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-blue-900">Automatische Erkennung</h4>
          <p className="text-sm text-blue-700 mt-1">Die Adresse wird genutzt, um automatisch Infrastruktur-Daten und Kartenmaterial zu laden.</p>
        </div>
      </div>
    </div>
  </div>
);

const StepDetails: StepComponent<RealEstateForm> = ({ data, update }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="space-y-2">
      <h3 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">Details & Energie</h3>
      <p className="text-[#86868B]">Spezifikationen und energetische Merkmale.</p>
    </div>

    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-3">
        <Label className="text-xs font-medium uppercase tracking-wider text-[#86868B]">Wohnfläche</Label>
        <div className="relative">
          <Input
            type="number"
            value={data.specifications.living_space}
            onChange={(e) => update("specifications", "living_space", e.target.value)}
            className="h-12 rounded-xl border-gray-200 bg-white pr-10 text-base"
            placeholder="0"
          />
          <span className="absolute right-4 top-3.5 text-gray-400 text-sm font-medium">m²</span>
        </div>
      </div>
      <div className="space-y-3">
        <Label className="text-xs font-medium uppercase tracking-wider text-[#86868B]">Zimmer</Label>
        <Input
          type="number"
          value={data.specifications.rooms}
          onChange={(e) => update("specifications", "rooms", e.target.value)}
          className="h-12 rounded-xl border-gray-200 bg-white text-base"
          placeholder="0"
        />
      </div>
      <div className="space-y-3">
        <Label className="text-xs font-medium uppercase tracking-wider text-[#86868B]">Baujahr</Label>
        <Input
          type="number"
          value={data.specifications.year_built}
          onChange={(e) => update("specifications", "year_built", e.target.value)}
          className="h-12 rounded-xl border-gray-200 bg-white text-base"
          placeholder="JJJJ"
        />
      </div>
      <div className="space-y-3">
        <Label className="text-xs font-medium uppercase tracking-wider text-[#86868B]">Grundstück</Label>
        <div className="relative">
          <Input
            type="number"
            value={data.specifications.plot_size}
            onChange={(e) => update("specifications", "plot_size", e.target.value)}
            className="h-12 rounded-xl border-gray-200 bg-white pr-16 text-base"
            placeholder="optional"
          />
          <span className="absolute right-4 top-3.5 text-gray-400 text-xs font-medium">m²</span>
        </div>
      </div>
    </div>

    <div className="h-px bg-gray-100" />

    <div className="space-y-6">
      <h4 className="text-lg font-medium text-[#1D1D1F]">Energieausweis</h4>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label className="text-xs font-medium uppercase tracking-wider text-[#86868B]">Klasse</Label>
          <Select value={data.specifications.energy_class} onValueChange={(val) => update("specifications", "energy_class", val)}>
            <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-white text-base">
              <SelectValue placeholder="Wählen" />
            </SelectTrigger>
            <SelectContent>
              {["A+", "A", "B", "C", "D", "E", "F", "G", "H"].map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <Label className="text-xs font-medium uppercase tracking-wider text-[#86868B]">Kennwert</Label>
          <div className="relative">
            <Input
              type="number"
              value={data.specifications.energy_value}
              onChange={(e) => update("specifications", "energy_value", e.target.value)}
              className="h-12 rounded-xl border-gray-200 bg-white pr-16 text-base"
              placeholder="0"
            />
            <span className="absolute right-4 top-3.5 text-gray-400 text-xs font-medium">kWh/m²</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const StepReview: StepComponent<RealEstateForm> = ({ data }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      <h3 className="text-2xl font-semibold text-[#1D1D1F]">Bereit zum Erstellen</h3>
      <p className="text-[#86868B] mt-2 max-w-md mx-auto">
        Sie haben alle notwendigen Daten erfasst. Überprüfen Sie die Angaben unten und schließen Sie den Vorgang ab.
      </p>
    </div>

    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <h4 className="font-semibold text-gray-900">Zusammenfassung</h4>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
          <span className="text-gray-500">Objekt</span>
          <span className="font-medium text-gray-900 capitalize">
            {data.property_type === "apartment" ? "Wohnung" : data.property_type}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
          <span className="text-gray-500">Adresse</span>
          <span className="font-medium text-gray-900 text-right">
            {data.address.street || "-"}, {data.address.city || "-"}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
          <span className="text-gray-500">Größe</span>
          <span className="font-medium text-gray-900">
            {data.specifications.living_space || "0"} m², {data.specifications.rooms || "0"} Zi.
          </span>
        </div>
      </div>
    </div>
  </div>
);

// ------------ Step Components (Marketing Campaign) ------------

const StepCampaignGoal: StepComponent<MarketingCampaignForm> = ({ data, update }) => {
  const goals = [
    { id: "awareness", label: "Markenbekanntheit", icon: Target, desc: "Reichweite erhöhen" },
    { id: "leads", label: "Lead Generierung", icon: Users2, desc: "Kontakte sammeln" },
    { id: "sales", label: "Verkauf", icon: Banknote, desc: "Umsatz steigern" },
    { id: "retention", label: "Kundenbindung", icon: Share2, desc: "Loyalität stärken" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">Kampagnenziel</h3>
        <p className="text-[#86868B]">Was ist das primäre Ziel dieser Kampagne?</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <Label className="text-xs font-medium uppercase tracking-wider text-[#86868B]">Kampagnenname</Label>
          <Input
            value={data.name}
            onChange={(e) => update("name", undefined, e.target.value)}
            className="h-12 rounded-xl border-gray-200 focus:border-[#0066CC] focus:ring-[#0066CC] bg-white text-base"
            placeholder="z.B. Sommer Sale 2025"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const Icon = goal.icon;
            const isSelected = data.goal === goal.id;
            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => update("goal", undefined, goal.id)}
                className={cn(
                  "cursor-pointer relative group flex flex-col items-start p-6 rounded-2xl border transition-all duration-300 text-left",
                  isSelected
                    ? "border-[#0066CC] bg-[#0066CC]/5 shadow-sm ring-1 ring-[#0066CC]"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg mb-4 transition-colors",
                  isSelected ? "bg-[#0066CC] text-white" : "bg-gray-100 text-gray-500"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className={cn("font-medium text-base", isSelected ? "text-[#0066CC]" : "text-gray-900")}>
                  {goal.label}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{goal.desc}</p>
                {isSelected && (
                  <div className="absolute top-4 right-4 text-[#0066CC]">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StepTargetAudience: StepComponent<MarketingCampaignForm> = ({ data, update }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="space-y-2">
      <h3 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">Zielgruppe</h3>
      <p className="text-[#86868B]">Wen möchten Sie erreichen?</p>
    </div>

    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-xs font-medium uppercase tracking-wider text-[#86868B]">Altersgruppe</Label>
        <Select value={data.audience.age_range} onValueChange={(val) => update("audience", "age_range", val)}>
          <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-white text-base">
            <SelectValue placeholder="Wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="18-24">18 - 24 Jahre</SelectItem>
            <SelectItem value="25-34">25 - 34 Jahre</SelectItem>
            <SelectItem value="35-49">35 - 49 Jahre</SelectItem>
            <SelectItem value="50-64">50 - 64 Jahre</SelectItem>
            <SelectItem value="65+">65+ Jahre</SelectItem>
            <SelectItem value="all">Alle Altersgruppen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label className="text-xs font-medium uppercase tracking-wider text-[#86868B]">Interessen & Merkmale</Label>
        <div className="relative">
          <Input
            value={data.audience.interests}
            onChange={(e) => update("audience", "interests", e.target.value)}
            className="h-12 rounded-xl border-gray-200 bg-white text-base pr-10"
            placeholder="z.B. Technik, Immobilien, Finanzen"
          />
          <Users2 className="absolute right-3 top-3.5 text-gray-400 w-5 h-5" />
        </div>
        <p className="text-xs text-gray-500">Trennen Sie mehrere Interessen durch Komma.</p>
      </div>
    </div>
  </div>
);

const StepChannels: StepComponent<MarketingCampaignForm> = ({ data, update }) => {
  const channels = [
    { id: "social", label: "Social Media", icon: Share2 },
    { id: "email", label: "E-Mail Marketing", icon: FileText },
    { id: "seo", label: "SEO / Blog", icon: LayoutGrid },
    { id: "ads", label: "Paid Ads", icon: Megaphone },
  ];

  const toggleChannel = (id: string) => {
    const current = data.channels || [];
    const updated = current.includes(id as Channel)
      ? current.filter(c => c !== id)
      : [...current, id as Channel];
    update("channels", undefined, updated);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">Kanäle</h3>
        <p className="text-[#86868B]">Wo soll die Kampagne ausgespielt werden?</p>
      </div>

      <div className="space-y-3">
        <Label className="text-xs font-medium uppercase tracking-wider text-[#86868B]">Kanal-Mix wählen</Label>
        {channels.map((channel) => {
          const Icon = channel.icon;
          const isSelected = data.channels.includes(channel.id as Channel);
          return (
            <button
              key={channel.id}
              onClick={() => toggleChannel(channel.id)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200",
                isSelected
                  ? "border-[#0066CC] bg-[#0066CC]/5 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg transition-colors",
                isSelected ? "bg-[#0066CC] text-white" : "bg-gray-100 text-gray-500"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={cn("font-medium flex-1 text-left", isSelected ? "text-[#0066CC]" : "text-gray-700")}>
                {channel.label}
              </span>
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                isSelected ? "border-[#0066CC] bg-[#0066CC] text-white" : "border-gray-300"
              )}>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="space-y-3 mt-6">
        <Label className="text-xs font-medium uppercase tracking-wider text-[#86868B]">Budget (Optional)</Label>
        <div className="relative">
          <Input
            value={data.budget}
            onChange={(e) => update("budget", undefined, e.target.value)}
            className="h-12 rounded-xl border-gray-200 bg-white text-base pl-10"
            placeholder="0.00"
          />
          <span className="absolute left-4 top-3.5 text-gray-500 font-medium">€</span>
        </div>
      </div>
    </div>
  );
};

const StepCampaignReview: StepComponent<MarketingCampaignForm> = ({ data }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-[#0066CC]">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      <h3 className="text-2xl font-semibold text-[#1D1D1F]">Kampagne bereit</h3>
      <p className="text-[#86868B] mt-2 max-w-md mx-auto">
        Wir haben alle Details für <strong>{data.name || "Ihre Kampagne"}</strong> erfasst.
      </p>
    </div>

    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <h4 className="font-semibold text-gray-900">Zusammenfassung</h4>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
          <span className="text-gray-500">Ziel</span>
          <span className="font-medium text-gray-900 capitalize">{data.goal}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
          <span className="text-gray-500">Zielgruppe</span>
          <span className="font-medium text-gray-900 text-right">
            {data.audience.age_range || "Alle"}, {data.audience.interests || "-"}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
          <span className="text-gray-500">Kanäle</span>
          <span className="font-medium text-gray-900 capitalize">
            {data.channels.length > 0 ? data.channels.join(", ") : "Keine gewählt"}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
          <span className="text-gray-500">Budget</span>
          <span className="font-medium text-gray-900">{data.budget ? `${data.budget} €` : "-"}</span>
        </div>
      </div>
    </div>
  </div>
);

// ------------ Scenarios ------------

const REAL_ESTATE_SCENARIO: WizardScenario<RealEstateForm> = {
  id: "real_estate",
  label: "Immobilie erfassen",
  description: "Neues Objekt anlegen",
  icon: Building2,
  initialData: {
    property_type: "apartment",
    status: "draft",
    address: { street: "", zip: "", city: "", country: "DE" },
    specifications: {
      rooms: "",
      living_space: "",
      plot_size: "",
      year_built: "",
      energy_class: "",
      energy_carrier: "",
      energy_value: "",
      energy_certificate_type: "",
      condition: "well_kept",
    },
    pricing: { purchase_price: "", rent: "", additional_costs: "", deposit: "" },
  },
  steps: [
    { id: "basic_info", label: "Basisdaten", icon: Building2, description: "Typ & Status", component: StepBasicInfo },
    { id: "address", label: "Adresse", icon: MapPin, description: "Standort", component: StepAddress },
    { id: "details", label: "Details", icon: Ruler, description: "Fakten", component: StepDetails },
    { id: "review", label: "Abschluss", icon: CheckCircle2, description: "Prüfung", component: StepReview },
  ],
};

const USER_ONBOARDING_SCENARIO: WizardScenario<UserOnboardingForm> = {
  id: "user_onboarding",
  label: "Nutzer anlegen",
  description: "Neuen Benutzer hinzufügen",
  icon: User,
  initialData: {
    role: "agent",
    personal: { firstname: "", lastname: "", email: "" },
    settings: { notifications: true },
  },
  steps: [
    {
      id: "role",
      label: "Rolle",
      icon: User,
      description: "Berechtigung",
      component: ({ data, update }) => (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-[#1D1D1F]">Rolle wählen</h3>
          <Select value={data.role} onValueChange={(val) => update("role", undefined, val)}>
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="agent">Makler</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ),
    },
    {
      id: "personal",
      label: "Personalia",
      icon: FileText,
      description: "Name & Kontakt",
      component: ({ data, update }) => (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-[#1D1D1F]">Persönliche Daten</h3>
          <Input
            className="h-12 rounded-xl"
            placeholder="Vorname"
            value={data.personal.firstname}
            onChange={(e) => update("personal", "firstname", e.target.value)}
          />
          <Input
            className="h-12 rounded-xl"
            placeholder="Nachname"
            value={data.personal.lastname}
            onChange={(e) => update("personal", "lastname", e.target.value)}
          />
          <Input
            className="h-12 rounded-xl"
            placeholder="E-Mail"
            value={data.personal.email}
            onChange={(e) => update("personal", "email", e.target.value)}
          />
        </div>
      ),
    },
    {
      id: "review",
      label: "Abschluss",
      icon: CheckCircle2,
      description: "Prüfen",
      component: ({ data }) => (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-[#1D1D1F]">Zusammenfassung</h3>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3 shadow-sm">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Rolle</span>
              <span className="font-medium text-gray-900">{data.role === "agent" ? "Makler" : "Administrator"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Name</span>
              <span className="font-medium text-gray-900">
                {data.personal.firstname || "-"} {data.personal.lastname || ""}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">E-Mail</span>
              <span className="font-medium text-gray-900">{data.personal.email || "-"}</span>
            </div>
          </div>
        </div>
      ),
    },
  ],
};

const MARKETING_CAMPAIGN_SCENARIO: WizardScenario<MarketingCampaignForm> = {
  id: "marketing_campaign",
  label: "Kampagne",
  description: "Neue Marketing-Kampagne",
  icon: Megaphone,
  initialData: {
    name: "",
    goal: "awareness",
    audience: { age_range: "all", interests: "" },
    channels: [],
    budget: "",
  },
  steps: [
    { id: "goal", label: "Ziel", icon: Target, description: "Ausrichtung", component: StepCampaignGoal },
    { id: "audience", label: "Zielgruppe", icon: Users2, description: "Erreichbarkeit", component: StepTargetAudience },
    { id: "channels", label: "Kanäle", icon: Share2, description: "Distribution", component: StepChannels },
    { id: "review", label: "Review", icon: CheckCircle2, description: "Abschluss", component: StepCampaignReview },
  ],
};

const SCENARIOS: {
  real_estate: WizardScenario<RealEstateForm>;
  user_onboarding: WizardScenario<UserOnboardingForm>;
  marketing_campaign: WizardScenario<MarketingCampaignForm>;
} = {
  real_estate: REAL_ESTATE_SCENARIO,
  user_onboarding: USER_ONBOARDING_SCENARIO,
  marketing_campaign: MARKETING_CAMPAIGN_SCENARIO,
};

type ScenarioKey = keyof typeof SCENARIOS;

// ------------ Main Component ------------

export default function WizardPage() {
  const router = useRouter();
  const [selectedScenario, setSelectedScenario] = useState<ScenarioKey>("real_estate");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<RealEstateForm | UserOnboardingForm | MarketingCampaignForm>(SCENARIOS.real_estate.initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState(0);

  const scenario = SCENARIOS[selectedScenario];
  const currentStep = scenario.steps[currentStepIndex];

  const handleScenarioSelect = (id: ScenarioKey) => {
    const nextScenario = SCENARIOS[id];
    setSelectedScenario(id);
    setFormData(nextScenario.initialData);
    setCurrentStepIndex(0);
  };

  const updateField = (section: string, field?: string, value?: unknown) => {
    setFormData((prev) => {
      if (field === undefined) {
        return { ...(prev as Record<string, unknown>), [section]: value } as typeof prev;
      }
      const prevRecord = prev as Record<string, unknown>;
      const sectionValue = prevRecord[section];
      if (sectionValue && typeof sectionValue === "object") {
        return {
          ...prevRecord,
          [section]: { ...(sectionValue as Record<string, unknown>), [field]: value },
        } as typeof prev;
      }
      return { ...prevRecord, [section]: value } as typeof prev;
    });
  };

  const handleNext = async () => {
    if (currentStepIndex < scenario.steps.length - 1) {
      setDirection(1);
      setCurrentStepIndex((prev) => prev + 1);
      return;
    }
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    router.push("/real-estate/properties");
  };

  const handleBack = () => {
    if (currentStepIndex === 0) return;
    setDirection(-1);
    setCurrentStepIndex((prev) => prev - 1);
  };

  const progress = ((currentStepIndex + 1) / scenario.steps.length) * 100;

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans selection:bg-[#0066CC]/20">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black text-white rounded-lg">
              <scenario.icon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold text-sm leading-tight">{scenario.label}</h1>
              <p className="text-xs text-gray-500">Wizard</p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {(Object.values(SCENARIOS) as WizardScenario<RealEstateForm | UserOnboardingForm | MarketingCampaignForm>[]).map((s) => (
              <button
                key={s.id}
                onClick={() => handleScenarioSelect(s.id as ScenarioKey)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
                  selectedScenario === s.id ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="text-sm font-medium text-gray-500">
            Schritt {currentStepIndex + 1} von {scenario.steps.length}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-3 hidden lg:block space-y-8">
            <nav className="space-y-2 relative">
              <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-100 -z-10" />
              {scenario.steps.map((step, index) => {
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;
                const Icon = step.icon;
                return (
                  <div key={step.id} className="group flex items-center gap-4">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10",
                        isActive
                          ? "border-[#0066CC] bg-white text-[#0066CC] shadow-[0_0_0_4px_rgba(0,102,204,0.1)]"
                          : isCompleted
                            ? "border-[#0066CC] bg-[#0066CC] text-white"
                            : "border-gray-200 bg-white text-gray-300"
                      )}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div
                      className={cn(
                        "transition-opacity duration-300",
                        isActive ? "opacity-100" : isCompleted ? "opacity-70" : "opacity-40"
                      )}
                    >
                      <div className="text-sm font-semibold">{step.label}</div>
                      <div className="text-xs text-gray-500">{step.description}</div>
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="lg:col-span-9">
            <div className="bg-white rounded-[24px] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
              <div className="h-1 bg-gray-50 w-full">
                <motion.div
                  className="h-full bg-[#0066CC]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>

              <div className="flex-1 p-8 md:p-12 relative overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentStepIndex}
                    custom={direction}
                    initial={{ opacity: 0, x: direction > 0 ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction > 0 ? -20 : 20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="h-full"
                  >
                    {currentStep && (
                      <currentStep.component
                        data={formData}
                        update={(section: string, field?: string, value?: unknown) => updateField(section, field, value)}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="p-6 md:p-8 border-t border-gray-50 bg-gray-50/30 backdrop-blur-sm flex justify-between items-center">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStepIndex === 0 || isLoading}
                  className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl h-12 px-6"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Zurück
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={isLoading}
                  className={cn(
                    "bg-[#1D1D1F] hover:bg-black text-white rounded-xl h-12 px-8 shadow-lg shadow-gray-200 transition-all hover:scale-[1.02] active:scale-[0.98]",
                    isLoading && "opacity-80"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : currentStepIndex === scenario.steps.length - 1 ? (
                    "Abschließen"
                  ) : (
                    <span className="flex items-center">Weiter <ChevronRight className="w-4 h-4 ml-2" /></span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
