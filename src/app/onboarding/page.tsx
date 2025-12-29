'use client';

import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();

  const handleClose = () => {
    // Flag im localStorage setzen, dass Onboarding abgeschlossen wurde
    localStorage.setItem('aklow_onboarding_complete', 'true');
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-[var(--ak-color-bg-app)] flex items-center justify-center relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-18%] left-[-12%] w-[46%] h-[46%] bg-[var(--ak-color-accent-soft)]/55 blur-[120px] rounded-full opacity-60" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[42%] h-[42%] bg-[var(--ak-color-bg-surface-muted)]/70 blur-[120px] rounded-full opacity-50" />
      </div>

      <OnboardingWizard onClose={handleClose} />
    </main>
  );
}
