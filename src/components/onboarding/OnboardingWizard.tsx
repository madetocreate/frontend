'use client';

import React, { useState, useEffect } from 'react';
import { WizardShell } from './WizardShell';
import { OptionCard } from './OptionCard';
import { ResultScreen } from './ResultScreen';
import { getRecommendation, OnboardingAnswers, RecommendationResult } from '@/lib/onboarding/recommendation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

interface OnboardingWizardProps {
  onClose: () => void;
}

const STEPS = [
  {
    id: 1,
    question: 'Womit willst du starten?',
    type: 'single',
    options: [
      'Intelligenter Posteingang',
      'Website & Telefon Assistent',
      'Dokumente & Ordnung',
      'Bewertungen',
      'Kunden & Vorgänge'
    ]
  },
  {
    id: 2,
    question: 'Wie viel kommt bei dir grob rein?',
    type: 'single',
    options: [
      'niedrig (bis ~30/Woche)',
      'mittel (30–150/Woche)',
      'hoch (150+/Woche)'
    ]
  },
  {
    id: 3,
    question: 'Was ist dir am wichtigsten?',
    type: 'single',
    options: [
      'Zeit sparen',
      'schneller reagieren',
      'weniger Chaos',
      'besserer Überblick',
      'mehr Bewertungen'
    ]
  },
  {
    id: 4,
    question: 'Welche Tools nutzt du heute?',
    type: 'multi',
    optional: true,
    options: [
      'Gmail / Google Workspace',
      'Microsoft 365',
      'WhatsApp',
      'Telefon',
      'Dateien/Ordner (Drive/Dropbox/anders)'
    ]
  },
  {
    id: 5,
    question: 'Wie sensibel sind die Inhalte?',
    type: 'single',
    options: [
      'normal',
      'teils sensibel',
      'sehr sensibel'
    ]
  }
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Partial<OnboardingAnswers>>({
    tools: []
  });
  const [result, setResult] = useState<RecommendationResult | null>(null);

  // Keyboard navigation: ESC to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleOptionToggle = (option: string) => {
    const step = STEPS[currentStep - 1];
    
    if (step.type === 'single') {
      setAnswers(prev => ({
        ...prev,
        [getStepKey(currentStep)]: option
      }));
    } else {
      setAnswers(prev => {
        const currentTools = prev.tools || [];
        const newTools = currentTools.includes(option)
          ? currentTools.filter(t => t !== option)
          : [...currentTools, option];
        return { ...prev, tools: newTools };
      });
    }
  };

  const getStepKey = (stepId: number): keyof OnboardingAnswers => {
    switch (stepId) {
      case 1: return 'startingPoint';
      case 2: return 'volume';
      case 3: return 'importance';
      case 4: return 'tools';
      case 5: return 'sensitivity';
      default: return 'startingPoint';
    }
  };

  const isNextDisabled = () => {
    const step = STEPS[currentStep - 1];
    if (step.optional) return false;
    
    const key = getStepKey(currentStep);
    const val = answers[key];
    
    if (step.type === 'multi') {
      return !val || (val as string[]).length === 0;
    }
    return !val;
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Show result
      const finalRecommendation = getRecommendation(answers as OnboardingAnswers);
      setResult(finalRecommendation);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setAnswers({ tools: [] });
    setResult(null);
  };

  if (result) {
    return (
      <WizardShell currentStep={6} totalSteps={5} onClose={onClose} showProgress={false}>
        <ResultScreen 
          result={result} 
          onRestart={handleRestart} 
          onComplete={onClose} 
        />
      </WizardShell>
    );
  }

  const step = STEPS[currentStep - 1];
  const stepKey = getStepKey(currentStep);
  const selectedOptions = step.type === 'multi' 
    ? (answers.tools || []) 
    : [answers[stepKey] as string];

  return (
    <WizardShell currentStep={currentStep} totalSteps={5} onClose={onClose}>
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <h2 className="text-xl font-bold mb-6">{step.question}</h2>
        
        <div className="space-y-3 mb-8">
          {step.options.map((option) => (
            <OptionCard
              key={option}
              label={option}
              selected={selectedOptions.includes(option)}
              onClick={() => handleOptionToggle(option)}
              multi={step.type === 'multi'}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className={clsx(
              'flex items-center gap-2 text-sm font-medium transition-colors py-2 px-4 rounded-xl',
              currentStep === 1 
                ? 'opacity-0 pointer-events-none' 
                : 'text-[var(--apple-text-secondary)] hover:bg-[var(--apple-gray-100)] dark:hover:bg-[var(--apple-gray-800)]'
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </button>

          <button
            disabled={isNextDisabled()}
            onClick={handleNext}
            className={clsx(
              'flex items-center gap-2 h-11 px-6 rounded-2xl transition-all duration-300',
              isNextDisabled()
                ? 'bg-[var(--apple-gray-200)] text-[var(--apple-gray-400)] cursor-not-allowed'
                : 'apple-button-primary'
            )}
          >
            {currentStep === 5 ? 'Ergebnis anzeigen' : 'Weiter'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </WizardShell>
  );
};

