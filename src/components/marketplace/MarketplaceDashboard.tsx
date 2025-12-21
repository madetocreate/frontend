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
  ChatBubbleLeftRightIcon,
  MegaphoneIcon,
  ShieldCheckIcon,
  PhotoIcon,
  ChartBarIcon,
  HeartIcon
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
const SCREENSHOTS: Record<string, string[]> = {};

// --- Products Data ---

const PRODUCTS: Product[] = [
  // New Dashboard Pro Product
  {
    id: "dashboard-pro",
    type: "dashboard",
    title: "Dashboard Pro",
    developer: "AI Shield",
    description: "Das ultimative Cockpit für Ihr Unternehmen. Eine Plattform für alle Branchen.",
    longDescription: "Dashboard Pro vereint alle spezialisierten Branchen-Lösungen in einer einzigen, leistungsstarken Oberfläche. Egal ob Hotel, Gastronomie, Praxis oder Immobilien – Dashboard Pro passt sich intelligent an Ihre Bedürfnisse an. Enthält alle Features der bisherigen Einzel-Dashboards sowie einen neuen, flexiblen Konfigurator, mit dem Sie Ihre Ansicht personalisieren können. Wechseln Sie nahtlos zwischen verschiedenen Branchen-Templates oder bauen Sie Ihr eigenes Traum-Dashboard.",
    price: 199,
    priceType: "monthly",
    rating: 5.0,
    reviewsCount: 12,
    icon: ChartBarIcon,
    color: "bg-gradient-to-br from-blue-600 to-indigo-600",
    screenshots: [
      "bg-gradient-to-br from-blue-100 to-indigo-200",
      "bg-gradient-to-br from-indigo-200 to-purple-300",
      "bg-gradient-to-br from-purple-300 to-pink-400"
    ],
    tags: ["All-in-One", "Configurable", "Pro"],
    category: "Dashboards",
    bundle: true,
    bundleItems: ["Hotel & Hospitality", "Gastronomie & Restaurant", "Praxis & Medizin", "Immobilien & Real Estate", "Analytics Suite", "Custom Widgets"]
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
      className="group relative flex flex-col apple-glass-enhanced rounded-2xl p-5 shadow-[var(--ak-shadow-soft)] hover:shadow-[var(--ak-shadow-md)] hover:-translate-y-1 transition-all duration-300 cursor-pointer active:scale-[0.98] border border-[var(--ak-color-border-subtle)]"
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
            isFavorite ? "bg-rose-500 text-white shadow-rose-300/50" : "apple-glass-enhanced text-[var(--ak-color-text-secondary)] hover:text-rose-500"
          )}
        >
          <HeartIcon className="w-4 h-4" />
        </button>
        {product.bundle && (
          <AppleBadge variant="blue" size="sm">{t('marketplace.bundle') || 'Bundle'}</AppleBadge>
        )}
      </div>
      
      <div className="flex items-start gap-4">
        <div className={clsx("w-16 h-16 rounded-xl flex items-center justify-center text-white shadow-lg", product.color)}>
          <Icon className="w-8 h-8" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--ak-color-text-primary)] truncate text-base">{product.title}</h3>
          <p className="text-sm text-[var(--ak-color-text-secondary)] truncate">{product.developer}</p>
          <div className="flex items-center gap-2 mt-1">
            <RatingStars rating={product.rating} />
            <span className="text-xs text-[var(--ak-color-text-muted)]">({product.reviewsCount})</span>
          </div>
        </div>
      </div>
      
      <p className="mt-4 text-sm text-[var(--ak-color-text-secondary)] line-clamp-2 leading-relaxed h-10">
        {product.description}
      </p>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {product.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-secondary)] text-[10px] uppercase font-semibold tracking-wide rounded-md">
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
              ? "bg-[var(--ak-color-bg-surface-muted)] text-[var(--ak-color-text-muted)] cursor-default"
              : "bg-[var(--ak-color-accent)] text-white hover:bg-[var(--ak-color-accent-strong)] shadow-[var(--ak-shadow-soft)] hover:shadow-[var(--ak-shadow-md)]"
          )}
        >
          {product.installed ? (t('marketplace.installed') || 'Installiert') : product.price === 0 ? (t('marketplace.free') || 'Gratis') : `${product.price}€`}
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
    
    // For Dashboard Pro, we redirect to the dashboard setup
    if (product.id === 'dashboard-pro') {
        setIsProcessing(true);
        // Simulate purchase/entitlement
        setTimeout(() => {
            // Set localStorage flag or call API
            try {
                localStorage.setItem('dashboard_pro_entitlement', 'true');
            } catch {}
            
            // Redirect using router, not window.location
            // We need to trigger the Open Module event
            window.dispatchEvent(new CustomEvent('aklow-open-module', { detail: { module: 'dashboard' } }));
            onClose();
            // Optional: router.push('/') if needed, but event should work if handled by layout
        }, 1000);
        return;
    }

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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        layoutId={`card-${product.id}`}
        className="apple-glass-enhanced w-full max-w-3xl rounded-3xl overflow-hidden shadow-[var(--ak-shadow-strong)] relative flex flex-col max-h-[90vh] border border-[var(--ak-color-border-subtle)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 apple-glass-enhanced hover:shadow-[var(--ak-shadow-soft)] rounded-xl transition-colors"
        >
          <XMarkIcon className="w-5 h-5 text-[var(--ak-color-text-secondary)]" />
        </button>

        {/* Header / Banner */}
        <div className={clsx("h-48 w-full flex items-end p-8 pb-0 relative overflow-hidden", product.color)}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl" />
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl" />
          
          <div className="relative z-10 flex gap-6 translate-y-8">
            <div className="w-32 h-32 apple-glass-enhanced rounded-2xl shadow-[var(--ak-shadow-strong)] flex items-center justify-center border-4 border-white/50">
              <Icon className="w-16 h-16 text-[var(--ak-color-text-primary)]" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pt-12 pb-8 overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-3xl font-bold text-[var(--ak-color-text-primary)] tracking-tight">{product.title}</h2>
                {product.bundle && (
                  <AppleBadge variant="blue" size="md">{t('marketplace.bundle') || 'Bundle'}</AppleBadge>
                )}
              </div>
              <p className="text-lg text-[var(--ak-color-text-secondary)]">{product.developer}</p>
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
                    {t('common.yes') || 'Ja'}
                  </>
                ) : (
                  <>
                    {product.price === 0 ? (t('common.loading') || 'Laden') : product.id === 'dashboard-pro' ? 'Jetzt Testen' : `${t('common.yes') || 'Kaufen'} ${product.price}€`}
                    {product.priceType === 'monthly' && '/Monat'}
                  </>
                )}
              </AppleButton>
              <p className="text-[10px] text-[var(--ak-color-text-muted)]">{product.priceType === 'monthly' ? 'Monatliches Abo' : 'Einmalig'}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-8 py-4 border-y border-[var(--ak-color-border-subtle)]">
            <div className="flex flex-col items-center px-4 border-r border-[var(--ak-color-border-subtle)] last:border-0">
              <div className="text-[var(--ak-color-text-muted)] text-xs font-semibold uppercase mb-1">{t('marketplace.rating') || 'Bewertung'}</div>
              <div className="flex items-center gap-1 font-bold text-[var(--ak-color-text-primary)] text-xl">
                {product.rating} <StarIconSolid className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="text-[var(--ak-color-text-muted)] text-xs mt-1">{product.reviewsCount} {t('marketplace.reviews') || 'Reviews'}</div>
            </div>
            <div className="flex flex-col items-center px-4 border-r border-[var(--ak-color-border-subtle)] last:border-0">
              <div className="text-[var(--ak-color-text-muted)] text-xs font-semibold uppercase mb-1">{t('marketplace.category') || 'Kategorie'}</div>
              <div className="font-bold text-[var(--ak-color-text-primary)] text-xl capitalize">{product.category || product.type}</div>
              <div className="text-[var(--ak-color-text-muted)] text-xs mt-1">{product.type}</div>
            </div>
            <div className="flex flex-col items-center px-4">
              <div className="text-[var(--ak-color-text-muted)] text-xs font-semibold uppercase mb-1">{t('marketplace.developer') || 'Entwickler'}</div>
              <div className="font-bold text-[var(--ak-color-text-primary)] text-xl truncate max-w-[100px]">{product.developer}</div>
              <div className="text-[var(--ak-color-text-muted)] text-xs mt-1">{t('marketplace.verified') || 'Verifiziert'}</div>
            </div>
          </div>

          {/* Bundle Items */}
          {product.bundle && product.bundleItems && (
            <div className="mb-6 p-4 apple-glass-enhanced rounded-xl border border-[var(--ak-color-border-subtle)]">
              <h4 className="text-sm font-semibold text-[var(--ak-color-text-primary)] mb-3">{t('marketplace.inBundle') || 'Im Bundle enthalten'}</h4>
              <div className="grid grid-cols-2 gap-2">
                {product.bundleItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-[var(--ak-color-text-primary)]">
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
                const fallbackGradient = product.color;
                
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
            <h3 className="text-xl font-bold text-[var(--ak-color-text-primary)]">Beschreibung</h3>
            <p className="text-[var(--ak-color-text-secondary)] leading-relaxed text-base">
              {product.longDescription}
            </p>
          </div>

          <div className="mt-10 pt-6 border-t border-[var(--ak-color-border-subtle)]">
            <h3 className="text-lg font-bold text-[var(--ak-color-text-primary)] mb-4">{t('marketplace.information') || 'Informationen'}</h3>
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div className="text-[var(--ak-color-text-secondary)]">{t('marketplace.provider') || 'Anbieter'}</div>
              <div className="text-[var(--ak-color-text-primary)] font-medium text-right">{product.developer}</div>
              
              <div className="text-[var(--ak-color-text-secondary)]">{t('marketplace.price') || 'Preis'}</div>
              <div className="text-[var(--ak-color-text-primary)] font-medium text-right">
                {product.price === 0 ? (t('marketplace.free') || 'Gratis') : `${product.price}€ ${product.priceType === 'monthly' ? `/${t('marketplace.monthly') || 'Monat'}` : ''}`}
              </div>
              
              <div className="text-[var(--ak-color-text-secondary)]">{t('marketplace.category') || 'Kategorie'}</div>
              <div className="text-[var(--ak-color-text-primary)] font-medium text-right capitalize">{product.category || product.type}</div>
              
              <div className="text-[var(--ak-color-text-secondary)]">{t('marketplace.compatibility') || 'Kompatibilität'}</div>
              <div className="text-[var(--ak-color-text-primary)] font-medium text-right">AI Shield 2.0+</div>
              
              <div className="text-[var(--ak-color-text-secondary)]">{t('marketplace.languages') || 'Sprachen'}</div>
              <div className="text-[var(--ak-color-text-primary)] font-medium text-right">DE, EN, ES, FR, IT</div>
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
    <div className="min-h-screen bg-[var(--ak-color-bg-app)] text-[var(--ak-color-text-primary)] font-sans pb-20 relative overflow-hidden">
      {/* Background Effects - Subtle, Apple-style */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-16 w-[420px] h-[420px] bg-[var(--ak-color-accent-soft)] blur-3xl opacity-30" />
        <div className="absolute top-10 right-[-10%] w-[520px] h-[520px] bg-[var(--ak-color-accent-soft)] blur-3xl opacity-20" />
        <div className="absolute bottom-[-20%] left-[20%] w-[480px] h-[480px] bg-[var(--ak-color-accent-soft)] blur-3xl opacity-15" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-20 apple-glass-enhanced border-b border-[var(--ak-color-border-subtle)] px-6 py-4 shadow-[var(--ak-shadow-soft)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--ak-color-text-primary)]">{t('marketplace.title') || 'Marketplace'}</h1>
          <div className="relative w-full md:w-96">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--ak-color-text-muted)]" />
            <input
              type="text"
              placeholder={t('marketplace.searchPlaceholder') || 'Suchen...'}
              ref={searchRef}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-10 rounded-xl apple-glass-enhanced border border-[var(--ak-color-border-subtle)] pl-10 pr-4 text-sm focus:ring-2 focus:ring-[var(--ak-color-accent)]/30 focus:border-[var(--ak-color-accent)] transition-all placeholder:text-[var(--ak-color-text-muted)] text-[var(--ak-color-text-primary)]"
            />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-10 relative z-10">
        
        {/* Featured Dashboards Section */}
        {filter === "all" && !search && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[var(--ak-color-text-primary)]">{t('marketplace.premiumDashboards') || 'Premium Dashboards'}</h2>
              <button className="text-sm text-[var(--ak-color-accent)] font-medium hover:underline">
                {t('marketplace.showAll') || 'Alle anzeigen'}
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
              <h2 className="text-2xl font-bold text-[var(--ak-color-text-primary)]">{t('marketplace.popularAddons') || 'Beliebte Add-ons'}</h2>
              <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
                {t('marketplace.showAll') || 'Alle anzeigen'}
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
              <h2 className="text-2xl font-bold text-[var(--ak-color-text-primary)]">{t('marketplace.recent') || 'Zuletzt angesehen'}</h2>
              <span className="text-sm text-[var(--ak-color-text-secondary)]">{recentProducts.length} {t('marketplace.items') || 'Elemente'}</span>
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
              { id: "all", label: t('marketplace.filters.all') || 'Alle' },
              { id: "dashboard", label: t('marketplace.filters.dashboards') || 'Dashboards' },
              { id: "addon", label: t('marketplace.filters.addons') || 'Add-ons' },
              { id: "app", label: t('marketplace.filters.apps') || 'Apps' },
              { id: "agent", label: t('marketplace.filters.agents') || 'Agents' },
              { id: "workflow", label: t('marketplace.filters.workflows') || 'Workflows' },
              { id: "plugin", label: t('marketplace.filters.plugins') || 'Plugins' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as FilterType)}
                className={clsx(
                  "px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shadow-sm border",
                  filter === tab.id
                    ? "bg-[var(--ak-color-accent)] text-white shadow-[var(--ak-shadow-md)] border-transparent"
                    : "apple-glass-enhanced text-[var(--ak-color-text-primary)] hover:shadow-[var(--ak-shadow-soft)] border-[var(--ak-color-border-subtle)]"
                )}
              >
                {tab.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-[var(--ak-color-text-secondary)] hidden md:inline">{t('marketplace.sort') || 'Sortieren'}</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="h-10 rounded-xl apple-glass-enhanced border border-[var(--ak-color-border-subtle)] text-sm px-3 focus:ring-2 focus:ring-[var(--ak-color-accent)]/30 focus:border-[var(--ak-color-accent)] transition-all text-[var(--ak-color-text-primary)]"
              >
                <option value="relevance">{t('marketplace.sortRelevance') || 'Relevanz'}</option>
                <option value="price-asc">{t('marketplace.sortPriceAsc') || 'Preis aufsteigend'}</option>
                <option value="price-desc">{t('marketplace.sortPriceDesc') || 'Preis absteigend'}</option>
                <option value="rating-desc">{t('marketplace.sortRating') || 'Bewertung'}</option>
              </select>
            </div>
          </div>
        </section>

        {/* Product Grid */}
        <section>
          <h2 className="text-xl font-bold text-[var(--ak-color-text-primary)] mb-6">
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
              <div className="w-16 h-16 bg-[var(--ak-color-bg-surface-muted)] rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--ak-color-text-muted)]">
                <MagnifyingGlassIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--ak-color-text-primary)]">{t('marketplace.noResults') || 'Keine Ergebnisse'}</h3>
              <p className="text-[var(--ak-color-text-secondary)]">{t('marketplace.noResultsDescription') || 'Versuchen Sie es mit anderen Suchbegriffen.'}</p>
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
