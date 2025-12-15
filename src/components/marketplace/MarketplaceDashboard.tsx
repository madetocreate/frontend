"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  StarIcon,
  CheckBadgeIcon,
  XMarkIcon,
  SparklesIcon,
  CubeIcon,
  CpuChipIcon,
  BoltIcon,
  BuildingOfficeIcon,
  HeartIcon,
  HomeIcon,
  ChatBubbleLeftRightIcon,
  MegaphoneIcon,
  CakeIcon,
  ShieldCheckIcon,
  PhotoIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import clsx from "clsx";
import type { ComponentType } from "react";
import { AppleButton, AppleBadge } from "../ui/AppleDesignSystem";
import Image from "next/image";
import { useTranslation } from "../../i18n";

// --- Types ---

type ProductType = "app" | "workflow" | "agent" | "plugin" | "dashboard" | "addon";
type IconComponent = ComponentType<{ className?: string }>;

interface Product {
  id: string;
  type: ProductType;
  title: string;
  developer: string;
  description: string;
  longDescription: string;
  price: number;
  priceType?: "monthly" | "one-time";
  rating: number;
  reviewsCount: number;
  icon: IconComponent;
  color: string;
  screenshots?: string[];
  tags: string[];
  installed?: boolean;
  bundle?: boolean;
  bundleItems?: string[];
  category?: string;
}

// --- Screenshots Data ---
// Placeholder for screenshot URLs - can be populated later with actual image URLs
const SCREENSHOTS: Record<string, string[]> = {};

// --- Products Data ---

const PRODUCTS: Product[] = [
  // Dashboard Bundles
  {
    id: "dashboard-hotel",
    type: "dashboard",
    title: "Hotel Dashboard Pro",
    developer: "AI Shield",
    description: "Vollständiges Hotel-Management-Dashboard mit Reservierungen, Zimmerverwaltung, Restaurant, Events und Revenue-Management.",
    longDescription: "Das Hotel Dashboard Pro ist Ihre zentrale Kommandozentrale für das gesamte Hotel-Management. Verwalten Sie Reservierungen von allen Plattformen (Booking.com, Airbnb, Expedia) an einem Ort, überwachen Sie Zimmerbelegung in Echtzeit, steuern Sie Restaurant und Bar, planen Sie Events und Feiern, und optimieren Sie Ihre Revenue-Strategie mit intelligenten Pricing-Empfehlungen. Mit integrierter KI für Gästekommunikation, automatischen Upselling-Vorschlägen und umfassenden Analytics.",
    price: 149,
    priceType: "monthly",
    rating: 4.9,
    reviewsCount: 342,
    icon: BuildingOfficeIcon,
    color: "bg-gradient-to-br from-blue-600 to-blue-500",
    screenshots: SCREENSHOTS['dashboard-hotel'] || [
      "bg-gradient-to-br from-blue-100 to-blue-200",
      "bg-gradient-to-br from-blue-200 to-blue-300",
      "bg-gradient-to-br from-blue-300 to-blue-400"
    ],
    tags: ["Hotel", "Management", "All-in-One"],
    category: "Dashboards",
    bundle: true,
    bundleItems: ["Reservierungen", "Zimmerverwaltung", "Restaurant", "Events", "Revenue", "Marketing", "Analytics"]
  },
  {
    id: "dashboard-practice",
    type: "dashboard",
    title: "Praxis Dashboard Pro",
    developer: "AI Shield",
    description: "Professionelles Praxis-Management-System mit Patientenverwaltung, Terminplanung, Dokumentenmanagement und Compliance.",
    longDescription: "Das Praxis Dashboard Pro wurde speziell für medizinische Praxen entwickelt und bietet alles, was Sie für einen reibungslosen Praxisbetrieb benötigen. Verwalten Sie Patienten, planen Sie Termine intelligent, verwalten Sie Dokumente DSGVO-konform, führen Sie Statistiken und Analysen durch, und stellen Sie sicher, dass alle Compliance-Anforderungen erfüllt sind. Mit integrierter AI-Rezeption für 24/7 Telefon-Support, automatischen Erinnerungen und intelligentem No-Show-Management.",
    price: 149,
    priceType: "monthly",
    rating: 4.8,
    reviewsCount: 287,
    icon: HeartIcon,
    color: "bg-gradient-to-br from-emerald-600 to-emerald-500",
    screenshots: SCREENSHOTS['dashboard-practice'] || [
      "bg-gradient-to-br from-emerald-100 to-emerald-200",
      "bg-gradient-to-br from-emerald-200 to-emerald-300",
      "bg-gradient-to-br from-emerald-300 to-emerald-400"
    ],
    tags: ["Praxis", "Healthcare", "DSGVO"],
    category: "Dashboards",
    bundle: true,
    bundleItems: ["Patienten", "Termine", "Dokumente", "Statistiken", "Compliance", "Telefon-Rezeption"]
  },
  {
    id: "dashboard-realestate",
    type: "dashboard",
    title: "Immobilien Dashboard Pro",
    developer: "AI Shield",
    description: "Umfassendes Immobilien-Management mit Objektverwaltung, Lead-Management, Exposé-Generierung und Kunden-Matching.",
    longDescription: "Das Immobilien Dashboard Pro revolutioniert Ihr Immobilien-Geschäft. Verwalten Sie alle Ihre Objekte zentral, verfolgen Sie Leads von der ersten Anfrage bis zum Abschluss, generieren Sie professionelle Exposés automatisch aus Fotos mit KI, finden Sie passende Kunden für Ihre Immobilien mit intelligentem Matching, planen Sie Besichtigungen effizient, und analysieren Sie Ihre Performance mit detaillierten Analytics. Mit integrierter KI für automatische Exposé-Erstellung, Kunden-Matching und Marketing-Automation.",
    price: 149,
    priceType: "monthly",
    rating: 4.7,
    reviewsCount: 198,
    icon: HomeIcon,
    color: "bg-gradient-to-br from-amber-600 to-amber-500",
    screenshots: SCREENSHOTS['dashboard-realestate'] || [
      "bg-gradient-to-br from-amber-100 to-amber-200",
      "bg-gradient-to-br from-amber-200 to-amber-300",
      "bg-gradient-to-br from-amber-300 to-amber-400"
    ],
    tags: ["Immobilien", "Real Estate", "AI"],
    category: "Dashboards",
    bundle: true,
    bundleItems: ["Objekte", "Leads", "Exposés", "Besichtigungen", "Analytics", "Marketing"]
  },
  {
    id: "dashboard-gastronomie",
    type: "dashboard",
    title: "Gastronomie Dashboard Pro",
    developer: "AI Shield",
    description: "Vollständiges Restaurant & Bar Management mit Reservierungen, Speisekarte, Bestellungen, Inventar, Personal und Analytics.",
    longDescription: "Das Gastronomie Dashboard Pro ist Ihre zentrale Kommandozentrale für Restaurant und Bar. Verwalten Sie Tischreservierungen in Echtzeit, aktualisieren Sie Ihre Speisekarte mit einem Klick, verfolgen Sie Bestellungen vom Eingang bis zur Auslieferung, überwachen Sie Ihr Inventar mit automatischen Low-Stock-Warnungen, planen Sie Schichten für Ihr Personal, verwalten Sie Ihre Bar mit Getränkebeständen, und analysieren Sie Ihre Performance mit detaillierten Reports. Mit integrierter KI für Bestellvorhersagen, automatischen Inventar-Benachrichtigungen, Kunden-CRM und Marketing-Automation.",
    price: 149,
    priceType: "monthly",
    rating: 4.8,
    reviewsCount: 267,
    icon: CakeIcon,
    color: "bg-gradient-to-br from-orange-600 to-red-500",
    screenshots: [
      "bg-gradient-to-br from-orange-100 to-red-200",
      "bg-gradient-to-br from-orange-200 to-red-300",
      "bg-gradient-to-br from-orange-300 to-red-400"
    ],
    tags: ["Gastronomie", "Restaurant", "Bar", "All-in-One"],
    category: "Dashboards",
    bundle: true,
    bundleItems: ["Reservierungen", "Speisekarte", "Bestellungen", "Inventar", "Personal", "Bar", "Analytics", "Marketing"]
  },
  // Add-ons
  {
    id: "addon-review-helper",
    type: "addon",
    title: "Review Helper",
    developer: "AI Shield",
    description: "KI-gestützter Review-Manager für automatische Review-Erkennung, Antwortvorschläge und Reputations-Management.",
    longDescription: "Review Helper überwacht automatisch alle Ihre Bewertungen auf Google, Yelp, TripAdvisor und anderen Plattformen. Er erkennt neue Reviews sofort, analysiert den Sentiment, generiert passende Antwortvorschläge im richtigen Ton (freundlich, deeskalierend, professionell), und warnt Sie bei kritischen Bewertungen. Mit integrierter Reputations-Analyse, Trend-Tracking und automatischen Follow-up-Sequenzen für zufriedene Kunden.",
    price: 14,
    priceType: "monthly",
    rating: 4.6,
    reviewsCount: 156,
    icon: ChatBubbleLeftRightIcon,
    color: "bg-gradient-to-br from-purple-600 to-purple-500",
    screenshots: [
      "bg-gradient-to-br from-purple-100 to-purple-200",
      "bg-gradient-to-br from-purple-200 to-purple-300"
    ],
    tags: ["Reviews", "Reputation", "AI"],
    category: "Add-ons"
  },
  {
    id: "addon-marketing-guru",
    type: "addon",
    title: "Marketing Guru",
    developer: "AI Shield",
    description: "KI-Marketing-Assistent für Content-Generierung, Kampagnen-Optimierung und Performance-Analyse.",
    longDescription: "Marketing Guru ist Ihr persönlicher KI-Marketing-Experte. Er generiert hochwertige Marketing-Inhalte für Social Media, E-Mails und Werbekampagnen, optimiert Ihre Kampagnen basierend auf Performance-Daten, schlägt die besten Posting-Zeiten vor, analysiert Ihre Konkurrenz, und erstellt personalisierte Marketing-Strategien. Mit integrierter A/B-Testing-Funktionalität, automatischer Hashtag-Generierung und ROI-Tracking.",
    price: 14,
    priceType: "monthly",
    rating: 4.5,
    reviewsCount: 234,
    icon: MegaphoneIcon,
    color: "bg-gradient-to-br from-pink-600 to-pink-500",
    screenshots: SCREENSHOTS['addon-marketing-guru'] || [
      "bg-gradient-to-br from-pink-100 to-pink-200",
      "bg-gradient-to-br from-pink-200 to-pink-300"
    ],
    tags: ["Marketing", "Content", "AI"],
    category: "Add-ons"
  },
  {
    id: "addon-ai-shield",
    type: "addon",
    title: "AI Shield",
    developer: "AI Shield",
    description: "Umfassender Schutz für Ihre AI-Systeme mit Sicherheitsüberwachung, Compliance-Checks und Datenschutz.",
    longDescription: "AI Shield schützt Ihre AI-Systeme vor Bedrohungen und stellt sicher, dass alle Compliance-Anforderungen erfüllt sind. Er überwacht alle AI-Interaktionen in Echtzeit, erkennt verdächtige Aktivitäten, blockiert unerwünschte Anfragen, führt automatische Compliance-Checks durch (DSGVO, HIPAA, etc.), und generiert detaillierte Sicherheitsberichte. Mit integrierter Datenschutz-Überwachung, automatischer PII/PHI-Redaction und Audit-Logs.",
    price: 14,
    priceType: "monthly",
    rating: 4.9,
    reviewsCount: 412,
    icon: ShieldCheckIcon,
    color: "bg-gradient-to-br from-indigo-600 to-indigo-500",
    screenshots: [
      "bg-gradient-to-br from-indigo-100 to-indigo-200",
      "bg-gradient-to-br from-indigo-200 to-indigo-300"
    ],
    tags: ["Security", "Compliance", "Protection"],
    category: "Add-ons"
  },
  // Existing products
  {
    id: "1",
    type: "agent",
    title: "Sales Genie Pro",
    developer: "Aklow AI",
    description: "Automatisierter Vertriebsassistent für Kaltakquise und Follow-ups.",
    longDescription: "Sales Genie Pro revolutioniert Ihren Vertrieb. Dieser Agent qualifiziert Leads, vereinbart Termine und führt intelligente Follow-up-Gespräche – völlig autonom. Trainiert auf Millionen von Verkaufsgesprächen.",
    price: 49.99,
    priceType: "monthly",
    rating: 4.8,
    reviewsCount: 1240,
    icon: SparklesIcon,
    color: "bg-purple-500",
    screenshots: ["bg-purple-100", "bg-purple-200", "bg-purple-300"],
    tags: ["Sales", "Automation", "AI"],
  },
  {
    id: "2",
    type: "workflow",
    title: "Document Analyzer",
    developer: "DocuSoft",
    description: "Extrahiert Daten aus Rechnungen und Verträgen in Sekunden.",
    longDescription: "Verabschieden Sie sich von manueller Dateneingabe. Document Analyzer scannt PDF-Dokumente, erkennt relevante Felder (Beträge, Daten, Adressen) und exportiert sie direkt in Ihr CRM oder Buchhaltungssystem.",
    price: 29.00,
    priceType: "monthly",
    rating: 4.6,
    reviewsCount: 850,
    icon: CubeIcon,
    color: "bg-blue-500",
    screenshots: ["bg-blue-100", "bg-blue-200", "bg-blue-300"],
    tags: ["Productivity", "OCR", "Workflow"],
  },
  {
    id: "3",
    type: "app",
    title: "Marketing Suite",
    developer: "Growth Hacking Inc.",
    description: "All-in-One Dashboard für Social Media und Ad-Campaigns.",
    longDescription: "Planen, veröffentlichen und analysieren Sie Ihre Marketing-Kampagnen über alle Kanäle hinweg. Mit integrierter KI für Content-Generierung und Performance-Vorhersagen.",
    price: 0,
    priceType: "one-time",
    rating: 4.2,
    reviewsCount: 3200,
    icon: BoltIcon,
    color: "bg-orange-500",
    screenshots: ["bg-orange-100", "bg-orange-200", "bg-orange-300"],
    tags: ["Marketing", "Social Media", "Free"],
  },
  {
    id: "4",
    type: "plugin",
    title: "Stripe Connector",
    developer: "FinTech Sol.",
    description: "Nahtlose Integration von Zahlungen in Ihre Workflows.",
    longDescription: "Verbinden Sie Stripe mit nur einem Klick. Erstellen Sie Zahlungslinks, verwalten Sie Abonnements und synchronisieren Sie Transaktionsdaten in Echtzeit.",
    price: 19.99,
    priceType: "monthly",
    rating: 4.9,
    reviewsCount: 56,
    icon: CpuChipIcon,
    color: "bg-indigo-500",
    screenshots: ["bg-indigo-100", "bg-indigo-200", "bg-indigo-300"],
    tags: ["Finance", "Payment", "Integration"],
  },
];

// --- Components ---

const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className="text-xs">
          {i <= Math.round(rating) ? (
            <StarIconSolid className="w-3 h-3 text-yellow-400" />
          ) : (
            <StarIcon className="w-3 h-3 text-gray-300" />
          )}
        </span>
      ))}
    </div>
  );
};

const ProductCard = ({ product, onClick, isFavorite, onToggleFavorite }: { product: Product; onClick: () => void; isFavorite: boolean; onToggleFavorite: () => void }) => {
  const { t } = useTranslation();
  const Icon = product.icon;
  return (
    <motion.div
      layoutId={`card-${product.id}`}
      onClick={onClick}
      className="group relative flex flex-col apple-glass rounded-2xl p-5 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer active:scale-[0.98] border border-gray-200/50"
    >
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          aria-label="Favorit"
          className={clsx(
            "p-2 rounded-full shadow-sm transition-all",
            isFavorite ? "bg-rose-500 text-white shadow-rose-300/50" : "bg-white/80 dark:bg-gray-800/80 text-gray-500 hover:text-rose-500"
          )}
        >
          <HeartIcon className="w-4 h-4" />
        </button>
        {product.bundle && (
          <AppleBadge variant="blue" size="sm">{t('marketplace.bundle')}</AppleBadge>
        )}
      </div>
      
      <div className="flex items-start gap-4">
        <div className={clsx("w-16 h-16 rounded-xl flex items-center justify-center text-white shadow-lg", product.color)}>
          <Icon className="w-8 h-8" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate text-base">{product.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{product.developer}</p>
          <div className="flex items-center gap-2 mt-1">
            <RatingStars rating={product.rating} />
            <span className="text-xs text-gray-400 dark:text-gray-500">({product.reviewsCount})</span>
          </div>
        </div>
      </div>
      
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed h-10">
        {product.description}
      </p>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {product.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-gray-100/80 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 text-[10px] uppercase font-semibold tracking-wide rounded-md">
              {tag}
            </span>
          ))}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className={clsx(
            "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm",
            product.installed
              ? "bg-gray-100/80 dark:bg-gray-800/60 text-gray-400 dark:text-gray-500 cursor-default"
              : "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30"
          )}
        >
          {product.installed ? t('marketplace.installed') : product.price === 0 ? t('marketplace.free') : `${product.price}€`}
        </button>
      </div>
    </motion.div>
  );
};

const ProductModal = ({ product, onClose }: { product: Product; onClose: () => void }) => {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPurchased, setIsPurchased] = useState(product.installed || false);
  const Icon = product.icon;

  const handleBuy = async () => {
    if (isProcessing || isPurchased) return;
    setIsProcessing(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          price: product.price,
          recurring: product.priceType === "monthly",
          title: product.title,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.url) {
          window.location.href = data.url;
          return;
        }
      }
      // Fallback: als gekauft markieren, wenn kein Checkout-URL vorhanden ist
      setIsPurchased(true);
    } catch (err) {
      console.error("Checkout fehlgeschlagen", err);
      setIsPurchased(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        layoutId={`card-${product.id}`}
        className="apple-glass w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] border border-gray-200/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 rounded-xl transition-colors backdrop-blur-xl"
        >
          <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>

        {/* Header / Banner */}
        <div className={clsx("h-48 w-full flex items-end p-8 pb-0 relative overflow-hidden", product.color)}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl" />
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl" />
          
          <div className="relative z-10 flex gap-6 translate-y-8">
            <div className="w-32 h-32 bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-2xl flex items-center justify-center border-4 border-white/50">
              <Icon className="w-16 h-16 text-gray-900 dark:text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pt-12 pb-8 overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{product.title}</h2>
                {product.bundle && (
                  <AppleBadge variant="blue" size="md">{t('marketplace.bundle')}</AppleBadge>
                )}
              </div>
              <p className="text-lg text-gray-500 dark:text-gray-400">{product.developer}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <AppleButton
                variant={isPurchased ? "secondary" : "primary"}
                onClick={isPurchased ? undefined : handleBuy}
                disabled={isPurchased || isProcessing}
                size="md"
              >
                {isProcessing ? (
                  <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                ) : isPurchased ? (
                  <>
                    <CheckBadgeIcon className="w-5 h-5" />
                    {t('common.yes')}
                  </>
                ) : (
                  <>
                    {product.price === 0 ? t('common.loading') : `${t('common.yes')} ${product.price}€`}
                    {product.priceType === 'monthly' && '/Monat'}
                  </>
                )}
              </AppleButton>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">{product.priceType === 'monthly' ? 'Monatliches Abo' : 'Einmalig'}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-8 py-4 border-y border-gray-200/50 dark:border-gray-700/50">
            <div className="flex flex-col items-center px-4 border-r border-gray-200/50 dark:border-gray-700/50 last:border-0">
              <div className="text-gray-400 dark:text-gray-500 text-xs font-semibold uppercase mb-1">{t('marketplace.rating')}</div>
              <div className="flex items-center gap-1 font-bold text-gray-900 dark:text-white text-xl">
                {product.rating} <StarIconSolid className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="text-gray-400 dark:text-gray-500 text-xs mt-1">{product.reviewsCount} {t('marketplace.reviews')}</div>
            </div>
            <div className="flex flex-col items-center px-4 border-r border-gray-200/50 dark:border-gray-700/50 last:border-0">
              <div className="text-gray-400 dark:text-gray-500 text-xs font-semibold uppercase mb-1">{t('marketplace.category')}</div>
              <div className="font-bold text-gray-900 dark:text-white text-xl capitalize">{product.category || product.type}</div>
              <div className="text-gray-400 dark:text-gray-500 text-xs mt-1">{product.type}</div>
            </div>
            <div className="flex flex-col items-center px-4">
              <div className="text-gray-400 dark:text-gray-500 text-xs font-semibold uppercase mb-1">{t('marketplace.developer')}</div>
              <div className="font-bold text-gray-900 dark:text-white text-xl truncate max-w-[100px]">{product.developer}</div>
              <div className="text-gray-400 dark:text-gray-500 text-xs mt-1">{t('marketplace.verified')}</div>
            </div>
          </div>

          {/* Bundle Items */}
          {product.bundle && product.bundleItems && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t('marketplace.inBundle')}</h4>
              <div className="grid grid-cols-2 gap-2">
                {product.bundleItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <CheckBadgeIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Screenshots Scroll */}
          {product.screenshots && product.screenshots.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-6 -mx-8 px-8 mb-6 snap-x scrollbar-hide">
              {product.screenshots.map((screenshot, i) => {
                const isUrl = typeof screenshot === 'string' && screenshot.startsWith('/');
                const fallbackGradient = product.id.includes('hotel') ? 'bg-gradient-to-br from-blue-100 to-blue-200' :
                  product.id.includes('practice') ? 'bg-gradient-to-br from-emerald-100 to-emerald-200' :
                  product.id.includes('realestate') ? 'bg-gradient-to-br from-amber-100 to-amber-200' :
                  product.id.includes('review') ? 'bg-gradient-to-br from-purple-100 to-purple-200' :
                  product.id.includes('marketing') ? 'bg-gradient-to-br from-pink-100 to-pink-200' :
                  product.id.includes('shield') ? 'bg-gradient-to-br from-indigo-100 to-indigo-200' :
                  'bg-gradient-to-br from-gray-100 to-gray-200';
                
                return (
                  <div 
                    key={i} 
                    className={clsx(
                      "flex-none w-64 h-40 rounded-xl shadow-lg snap-center relative overflow-hidden group",
                      !isUrl && screenshot,
                      isUrl && fallbackGradient
                    )}
                  >
                    {isUrl ? (
                      <>
                        <Image 
                          src={screenshot} 
                          alt={`${product.title} Screenshot ${i + 1}`}
                          fill
                          unoptimized
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PhotoIcon className="w-12 h-12 text-white/30" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Beschreibung</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
              {product.longDescription}
            </p>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('marketplace.information')}</h3>
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div className="text-gray-500 dark:text-gray-400">{t('marketplace.provider')}</div>
              <div className="text-gray-900 dark:text-white font-medium text-right">{product.developer}</div>
              
              <div className="text-gray-500 dark:text-gray-400">{t('marketplace.price')}</div>
              <div className="text-gray-900 dark:text-white font-medium text-right">
                {product.price === 0 ? t('marketplace.free') : `${product.price}€ ${product.priceType === 'monthly' ? `/${t('marketplace.monthly')}` : ''}`}
              </div>
              
              <div className="text-gray-500 dark:text-gray-400">{t('marketplace.category')}</div>
              <div className="text-gray-900 dark:text-white font-medium text-right capitalize">{product.category || product.type}</div>
              
              <div className="text-gray-500 dark:text-gray-400">{t('marketplace.compatibility')}</div>
              <div className="text-gray-900 dark:text-white font-medium text-right">AI Shield 2.0+</div>
              
              <div className="text-gray-500 dark:text-gray-400">{t('marketplace.languages')}</div>
              <div className="text-gray-900 dark:text-white font-medium text-right">DE, EN, ES, FR, IT</div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

type FilterType = ProductType | "all";
type SortOption = "relevance" | "price-asc" | "price-desc" | "rating-desc";

export default function MarketplaceDashboard() {
  const { t } = useTranslation();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("relevance");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recent, setRecent] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement | null>(null);

  // Debounce Suche
  useEffect(() => {
    const handle = setTimeout(() => setSearch(searchInput), 250);
    return () => clearTimeout(handle);
  }, [searchInput]);

  // Keyboard Shortcut für Suche
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Favoriten toggeln
  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Zuletzt angesehen - verwende useLayoutEffect für synchrones Update
  useEffect(() => {
    if (!selectedProduct) return;
    // Verwende setTimeout um setState außerhalb des synchronen Effekts aufzurufen
    const timeoutId = setTimeout(() => {
      setRecent(prev => {
        const filtered = prev.filter(p => p !== selectedProduct.id);
        return [selectedProduct.id, ...filtered].slice(0, 6);
      });
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [selectedProduct]);

  const filteredProducts = useMemo(() => {
    const base = PRODUCTS.filter((p) => {
      const matchesFilter = filter === "all" || p.type === filter || (filter === "dashboard" && p.type === "dashboard");
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                           p.description.toLowerCase().includes(search.toLowerCase()) ||
                           p.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
      return matchesFilter && matchesSearch;
    });

    const sorted = [...base].sort((a, b) => {
      if (sort === "price-asc") return (a.price ?? 0) - (b.price ?? 0);
      if (sort === "price-desc") return (b.price ?? 0) - (a.price ?? 0);
      if (sort === "rating-desc") return (b.rating ?? 0) - (a.rating ?? 0);
      return 0;
    });

    return sorted;
  }, [filter, search, sort]);

  const recentProducts = useMemo(() => {
    return recent
      .map(id => PRODUCTS.find(p => p.id === id))
      .filter(Boolean) as Product[];
  }, [recent]);

  const dashboardProducts = PRODUCTS.filter(p => p.type === "dashboard");
  const addonProducts = PRODUCTS.filter(p => p.type === "addon");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-white font-sans pb-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-16 w-[420px] h-[420px] bg-blue-300/10 dark:bg-blue-500/5 blur-3xl" />
        <div className="absolute top-10 right-[-10%] w-[520px] h-[520px] bg-purple-300/10 dark:bg-purple-500/5 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[20%] w-[480px] h-[480px] bg-amber-200/10 dark:bg-amber-500/5 blur-3xl" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-20 apple-glass border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{t('marketplace.title')}</h1>
          <div className="relative w-full md:w-96">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder={t('marketplace.searchPlaceholder')}
              ref={searchRef}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-10 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-10 relative z-10">
        
        {/* Featured Dashboards Section */}
        {filter === "all" && !search && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('marketplace.premiumDashboards')}</h2>
              <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
                {t('marketplace.showAll')}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dashboardProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={favorites.has(product.id)}
                  onToggleFavorite={() => toggleFavorite(product.id)}
                  onClick={() => setSelectedProduct(product)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Featured Add-ons Section */}
        {filter === "all" && !search && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('marketplace.popularAddons')}</h2>
              <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
                {t('marketplace.showAll')}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {addonProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={favorites.has(product.id)}
                  onToggleFavorite={() => toggleFavorite(product.id)}
                  onClick={() => setSelectedProduct(product)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Recently Viewed */}
        {recentProducts.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('marketplace.recent')}</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">{recentProducts.length} {t('marketplace.items')}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recentProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={favorites.has(product.id)}
                  onToggleFavorite={() => toggleFavorite(product.id)}
                  onClick={() => setSelectedProduct(product)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Filter Tabs */}
        <section>
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar items-center">
            {[
              { id: "all", label: t('marketplace.filters.all') },
              { id: "dashboard", label: t('marketplace.filters.dashboards') },
              { id: "addon", label: t('marketplace.filters.addons') },
              { id: "app", label: t('marketplace.filters.apps') },
              { id: "agent", label: t('marketplace.filters.agents') },
              { id: "workflow", label: t('marketplace.filters.workflows') },
              { id: "plugin", label: t('marketplace.filters.plugins') },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as FilterType)}
                className={clsx(
                  "px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shadow-sm border",
                  filter === tab.id
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg border-transparent"
                    : "apple-glass text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 shadow border-gray-200/50 dark:border-gray-700/50"
                )}
              >
                {tab.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden md:inline">{t('marketplace.sort')}</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="h-10 rounded-xl bg-white/80 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60 text-sm px-3 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-gray-700 dark:text-gray-200"
              >
                <option value="relevance">{t('marketplace.sortRelevance')}</option>
                <option value="price-asc">{t('marketplace.sortPriceAsc')}</option>
                <option value="price-desc">{t('marketplace.sortPriceDesc')}</option>
                <option value="rating-desc">{t('marketplace.sortRating')}</option>
              </select>
            </div>
          </div>
        </section>

        {/* Product Grid */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {search ? "Suchergebnisse" : filter === "all" ? "Alle Produkte" : `${filter.charAt(0).toUpperCase() + filter.slice(1)}s`}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                isFavorite={favorites.has(product.id)}
                onToggleFavorite={() => toggleFavorite(product.id)}
                onClick={() => setSelectedProduct(product)} 
              />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100/80 dark:bg-gray-800/60 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <MagnifyingGlassIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('marketplace.noResults')}</h3>
              <p className="text-gray-500 dark:text-gray-400">{t('marketplace.noResultsDescription')}</p>
            </div>
          )}
        </section>

      </main>

      {/* Detail Overlay */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
