/**
 * Onboarding Recommendation Logic
 * 
 * Deterministische Logik zur Bestimmung des Startpunkts basierend auf Nutzerantworten.
 * Später durch LLM-Hook ersetzbar.
 */

export type OnboardingAnswers = {
  startingPoint: string;
  volume: string;
  importance: string;
  tools: string[];
  sensitivity: string;
};

export type RecommendationResult = {
  title: string;
  recommendedApplication: string;
  nextSteps: string[];
  track: 'match' | 'custom';
};

export function getRecommendation(answers: OnboardingAnswers): RecommendationResult {
  const { startingPoint, importance, tools, sensitivity, volume } = answers;

  // 1. Recommended Application based on Step 1 (deterministic for now)
  const recommendedApplication = startingPoint;

  // 2. Next steps based on Step 3 (importance) + Step 4 (tools)
  const nextSteps: string[] = [];

  // Logic for next steps based on importance
  if (importance === 'Zeit sparen' || importance === 'weniger Chaos') {
    nextSteps.push('Automatisiere erste Standard-Antworten');
    nextSteps.push('Verbinde deine wichtigsten Kommunikationskanäle');
  } else if (importance === 'besserer Überblick' || importance === 'schneller reagieren') {
    nextSteps.push('Richte Benachrichtigungen für kritische Anfragen ein');
    nextSteps.push('Lade dein Team zur Zusammenarbeit ein');
  } else if (importance === 'mehr Bewertungen') {
    nextSteps.push('Aktiviere das automatische Bewertungs-Follow-up');
    nextSteps.push('Verknüpfe dein Google Business Profil');
  }

  // Add tool-specific step if tools are selected
  if (tools.length > 0) {
    if (tools.includes('Gmail / Google Workspace') || tools.includes('Microsoft 365')) {
      nextSteps.push(`Importiere bestehende Daten aus ${tools[0]}`);
    } else if (tools.includes('WhatsApp')) {
      nextSteps.push('Konfiguriere die WhatsApp Business API Schnittstelle');
    }
  }

  // Ensure we have at least 2 steps
  if (nextSteps.length < 2) {
    nextSteps.push('Personalisiere dein Dashboard');
    nextSteps.push('Erkunde die Hilfe-Sektion für einen schnellen Start');
  }

  // 3. Track determination
  // track = "custom" wenn sensitivity == sehr sensibel AND volume == hoch, sonst "match"
  const track = (sensitivity === 'sehr sensibel' && volume === 'hoch (150+/Woche)') ? 'custom' : 'match';

  return {
    title: 'Dein Startpunkt',
    recommendedApplication,
    nextSteps: nextSteps.slice(0, 2), // Nur die ersten 2 Schritte
    track,
  };
}

