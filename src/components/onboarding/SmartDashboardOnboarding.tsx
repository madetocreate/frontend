/**
 * Smart Dashboard Onboarding
 * Step-by-step dashboard configuration during onboarding
 */

'use client'

import { useState } from 'react'
import { 
  XMarkIcon,
  ChevronRightIcon,
  SparklesIcon,
  Squares2X2Icon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { AppleCard, AppleButton, AppleBadge } from '../ui/AppleDesignSystem'
import { UniversalDashboardConfigurator, type DashboardLayout, DashboardType } from '../dashboard/UniversalDashboardConfigurator'
import { useTranslation } from '../../i18n'

interface OnboardingStep {
  id: string
  title: string
  description: string
  component: React.ReactNode
  skippable: boolean
}

interface SmartDashboardOnboardingProps {
  dashboardType: DashboardType
  availableWidgets: Record<string, { title: string; description: string; icon: React.ComponentType<{ className?: string }>; category?: string }>
  onComplete?: (config: Record<string, unknown>) => void
  onSkip?: () => void
}

export function SmartDashboardOnboarding({
  dashboardType,
  availableWidgets,
  onComplete,
  onSkip
}: SmartDashboardOnboardingProps) {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)
  const [, setSkippedSteps] = useState<Set<number>>(new Set())
  const [showConfigurator, setShowConfigurator] = useState(false)
  const [dashboardConfig, setDashboardConfig] = useState<DashboardLayout[] | null>(null)

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: t('onboarding.welcome'),
      description: t('onboarding.welcomeDescription'),
      component: <WelcomeStep dashboardType={dashboardType} />,
      skippable: false
    },
    {
      id: 'dashboard-config',
      title: t('onboarding.configureDashboard'),
      description: t('onboarding.configureDashboardDescription'),
      component: (
        <DashboardConfigStep
          dashboardType={dashboardType}
          onConfigure={() => setShowConfigurator(true)}
        />
      ),
      skippable: true
    },
    {
      id: 'preferences',
      title: t('onboarding.settings'),
      description: t('onboarding.settingsDescription'),
      component: <PreferencesStep dashboardType={dashboardType} />,
      skippable: true
    },
    {
      id: 'complete',
      title: 'Fertig!',
      description: 'Ihr Dashboard ist bereit',
      component: <CompleteStep dashboardType={dashboardType} />,
      skippable: false
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    setSkippedSteps(prev => new Set([...prev, currentStep]))
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    if (onComplete) {
      onComplete({ layouts: dashboardConfig ?? [] })
    }
  }

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        
        {/* Onboarding Modal */}
        <div className="relative w-full max-w-2xl rounded-3xl apple-glass shadow-2xl overflow-hidden">
          {/* Progress Bar */}
          <div className="h-1 bg-gray-200/50 dark:bg-gray-700/50">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {currentStepData.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {t('onboarding.step')} {currentStep + 1} {t('onboarding.of')} {steps.length}
                </p>
              </div>
            </div>
            <button
              onClick={onSkip}
              className="p-2 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 rounded-xl transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {currentStepData.description}
            </p>
            {currentStepData.component}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex gap-2">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentStep
                      ? 'w-8 bg-blue-600'
                      : idx < currentStep
                      ? 'w-2 bg-green-500'
                      : 'w-2 bg-gray-300 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-3">
              {currentStepData.skippable && (
                <AppleButton variant="secondary" onClick={handleSkip}>
                  {t('onboarding.skip')}
                </AppleButton>
              )}
              <AppleButton variant="primary" onClick={handleNext}>
                {currentStep === steps.length - 1 ? t('onboarding.finish') : t('onboarding.next')}
                <ChevronRightIcon className="h-4 w-4" />
              </AppleButton>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Configurator Modal */}
      {showConfigurator && (
        <UniversalDashboardConfigurator
          dashboardType={dashboardType}
          availableWidgets={availableWidgets}
          onSave={(layouts) => {
            setDashboardConfig(layouts)
            setShowConfigurator(false)
          }}
          onClose={() => setShowConfigurator(false)}
        />
      )}
    </>
  )
}

// Step Components
function WelcomeStep({ dashboardType }: { dashboardType: DashboardType }) {
  const { t } = useTranslation()
  const dashboardNames: Record<DashboardType, string> = {
    hotel: 'Hotel',
    practice: t('onboarding.dashboard'),
    realestate: 'Immobilien',
    general: 'Allgemein',
    gastronomie: 'Gastronomie',
  }

  return (
    <div className="space-y-4">
      <AppleCard glass padding="lg" className="text-center">
        <div className="mb-4">
          <div className="inline-flex p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
            <Squares2X2Icon className="h-12 w-12 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('onboarding.welcomeTo')} {dashboardNames[dashboardType]} {t('onboarding.dashboard')}!
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {t('onboarding.setupDescription')}
        </p>
      </AppleCard>
    </div>
  )
}

function DashboardConfigStep({ 
  dashboardType,
  onConfigure 
}: { 
  dashboardType: DashboardType
  onConfigure: () => void
}) {
  void dashboardType
  return (
    <div className="space-y-4">
      <AppleCard glass padding="lg">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Personalisieren Sie Ihr Dashboard
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Wählen Sie die Widgets aus, die für Sie am wichtigsten sind. 
              Sie können diese Einstellungen jederzeit ändern.
            </p>
          </div>
          <AppleButton variant="primary" fullWidth onClick={onConfigure}>
            <Squares2X2Icon className="h-5 w-5" />
            Dashboard konfigurieren
          </AppleButton>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Oder überspringen Sie diesen Schritt und konfigurieren Sie später
          </p>
        </div>
      </AppleCard>
    </div>
  )
}

function PreferencesStep({ dashboardType }: { dashboardType: DashboardType }) {
  void dashboardType
  return (
    <div className="space-y-4">
      <AppleCard glass padding="lg">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Ihre Präferenzen
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Diese Einstellungen können Sie später in den Einstellungen anpassen.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
              <span className="text-sm text-gray-900 dark:text-white">E-Mail Benachrichtigungen</span>
              <AppleBadge variant="green">Aktiviert</AppleBadge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
              <span className="text-sm text-gray-900 dark:text-white">Dark Mode</span>
              <AppleBadge variant="blue">System</AppleBadge>
            </div>
          </div>
        </div>
      </AppleCard>
    </div>
  )
}

function CompleteStep({ dashboardType }: { dashboardType: DashboardType }) {
  void dashboardType
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      <AppleCard glass padding="lg" className="text-center">
        <div className="mb-4">
          <div className="inline-flex p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4">
            <CheckCircleIcon className="h-12 w-12 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('onboarding.allDone')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('onboarding.allDoneDescription')}
        </p>
        <div className="flex gap-2 justify-center">
          <AppleBadge variant="green">{t('onboarding.configured')}</AppleBadge>
          <AppleBadge variant="blue">{t('onboarding.ready')}</AppleBadge>
        </div>
      </AppleCard>
    </div>
  )
}
