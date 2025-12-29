'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Sparkles,
  Brain,
  Zap,
  Shield,
  TrendingUp,
  Link2,
  HelpCircle,
  AlertTriangle,
  Beaker,
} from 'lucide-react';

interface Feature {
  feature_id: string;
  name: string;
  description: string;
  category: 'basic' | 'advanced' | 'expert';
  enabled: boolean;
  default_enabled: boolean;
  requires_dependencies: boolean;
  performance_impact: string;
}

interface FeatureSettings {
  features: Record<string, Feature>;
  count: number;
}

const CATEGORY_ICONS = {
  basic: Sparkles,
  advanced: Brain,
  expert: Beaker,
};

const CATEGORY_LABELS = {
  basic: 'Basis-Features',
  advanced: 'KI-Einstellungen',
  expert: 'Experteneinstellungen',
};

const CATEGORY_DESCRIPTIONS = {
  basic: 'Diese Features sind immer aktiv und sorgen für intelligente Action-Vorschläge.',
  advanced: 'Erweiterte KI-Features für noch bessere Vorschläge. Du kannst sie ein- oder ausschalten.',
  expert: 'Experimentelle Features für Power User. Manche benötigen zusätzliche Installation.',
};

const PERFORMANCE_BADGES: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  low: { label: 'Schnell', variant: 'default' },
  medium: { label: 'Normal', variant: 'secondary' },
  high: { label: 'Langsam', variant: 'destructive' },
  negative: { label: '⚡ Macht schneller', variant: 'default' },
};

export function AISettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [basicFeatures, setBasicFeatures] = useState<Feature[]>([]);
  const [advancedFeatures, setAdvancedFeatures] = useState<Feature[]>([]);
  const [expertFeatures, setExpertFeatures] = useState<Feature[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    try {
      setLoading(true);
      
      // Load all features
      const { authedFetch } = await import('@/lib/api/authedFetch')
      const response = await authedFetch('/api/actions/settings/features?tenant_id=default');
      
      if (!response.ok) {
        throw new Error('Failed to load features');
      }
      
      const data: FeatureSettings = await response.json();
      
      // Group by category
      const features = Object.values(data.features);
      setBasicFeatures(features.filter(f => f.category === 'basic'));
      setAdvancedFeatures(features.filter(f => f.category === 'advanced'));
      setExpertFeatures(features.filter(f => f.category === 'expert'));
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to load features:', err);
      setError('Fehler beim Laden der Einstellungen');
      setLoading(false);
    }
  };

  const toggleFeature = async (featureId: string, enabled: boolean) => {
    try {
      setSaving(featureId);
      setError(null);
      
      const response = await fetch(`/api/actions/settings/features/${featureId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: 'default',
          enabled,
        }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        if (result.error === 'dependencies_not_met') {
          setError(
            `Feature kann nicht aktiviert werden: ${result.message}\n` +
            `Fehlende Dependencies: ${result.missing_dependencies.join(', ')}`
          );
        } else {
          throw new Error(result.message || 'Failed to update feature');
        }
        // Revert
        await loadFeatures();
      } else {
        // Update local state
        await loadFeatures();
      }
    } catch (err) {
      console.error('Failed to toggle feature:', err);
      setError('Fehler beim Speichern der Einstellung');
      await loadFeatures();
    } finally {
      setSaving(null);
    }
  };

  const renderFeature = (feature: Feature) => {
    const perfBadge = PERFORMANCE_BADGES[feature.performance_impact] || PERFORMANCE_BADGES.low;
    const isDisabled = feature.category === 'basic'; // Basic features can't be disabled
    
    return (
      <div
        key={feature.feature_id}
        className="flex items-start justify-between py-4 first:pt-0 last:pb-0"
      >
        <div className="flex-1 space-y-1 pr-4">
          <div className="flex items-center gap-2">
            <Label
              htmlFor={feature.feature_id}
              className={`text-sm font-medium ${isDisabled ? 'opacity-60' : ''}`}
            >
              {feature.name}
            </Label>
            
            {/* Performance Badge */}
            <Badge variant={perfBadge.variant} className="text-xs">
              {perfBadge.label}
            </Badge>
            
            {/* Dependencies Badge */}
            {feature.requires_dependencies && (
              <Badge variant="outline" className="text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Benötigt ML
              </Badge>
            )}
          </div>
          
          <p className={`text-sm ${isDisabled ? 'opacity-50' : 'opacity-70'}`}>
            {feature.description}
          </p>
        </div>
        
        <Switch
          id={feature.feature_id}
          checked={feature.enabled}
          onCheckedChange={(enabled) => toggleFeature(feature.feature_id, enabled)}
          disabled={isDisabled || saving === feature.feature_id}
          className="ml-auto"
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin">
          <Brain className="w-8 h-8 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="w-6 h-6" />
          KI & Intelligence Settings
        </h2>
        <p className="text-sm opacity-70 mt-1">
          Steuere, wie intelligent AKLOW Action-Vorschläge generiert
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* === BASIC FEATURES (Always On) === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5" />
            {CATEGORY_LABELS.basic}
          </CardTitle>
          <CardDescription>
            {CATEGORY_DESCRIPTIONS.basic}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {basicFeatures.map(renderFeature)}
          </div>
        </CardContent>
      </Card>

      {/* === ADVANCED FEATURES (User kann wählen) === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5" />
            {CATEGORY_LABELS.advanced}
          </CardTitle>
          <CardDescription>
            {CATEGORY_DESCRIPTIONS.advanced}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {advancedFeatures.map(renderFeature)}
          </div>
          
          {advancedFeatures.length === 0 && (
            <p className="text-sm opacity-50 text-center py-8">
              Keine erweiterten Features verfügbar
            </p>
          )}
        </CardContent>
      </Card>

      {/* === EXPERT FEATURES (Experimentell) === */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Beaker className="w-5 h-5 text-primary" />
            {CATEGORY_LABELS.expert}
            <Badge variant="outline" className="ml-auto">Experimentell</Badge>
          </CardTitle>
          <CardDescription>
            {CATEGORY_DESCRIPTIONS.expert}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {expertFeatures.map(renderFeature)}
          </div>
          
          {expertFeatures.length === 0 && (
            <p className="text-sm opacity-50 text-center py-8">
              Keine Experten-Features verfügbar
            </p>
          )}
          
          {expertFeatures.some(f => f.requires_dependencies) && (
            <Alert className="mt-4">
              <HelpCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Hinweis:</strong> Features mit "Benötigt ML" benötigen zusätzliche Python-Pakete.
                Installiere sie mit: <code className="bg-muted px-1 py-0.5 rounded text-xs">pip install sentence-transformers scikit-learn</code>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-3 text-sm">
            <p className="flex items-start gap-2">
              <Zap className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
              <span>
                <strong>Performance-Impact:</strong> Zeigt an, wie sehr ein Feature die Geschwindigkeit beeinflusst.
              </span>
            </p>
            <p className="flex items-start gap-2">
              <Shield className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
              <span>
                <strong>Sicherheit:</strong> Alle Features durchlaufen Security Tests und sind production-ready.
              </span>
            </p>
            <p className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
              <span>
                <strong>Lernen:</strong> Viele Features werden mit der Zeit besser, je mehr du sie nutzt.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

