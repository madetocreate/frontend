'use client';

import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();

  const handleClose = () => {
    // Flag im localStorage setzen, dass Onboarding abgeschlossen wurde
    localStorage.setItem('aklow_onboarding_completed', 'true');
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-[var(--apple-bg-secondary)] flex items-center justify-center">
      {/* 
        Hintergrund-Elemente für Apple-like Look auf der vollen Seite 
      */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--apple-blue)]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--apple-green)]/5 blur-[120px] rounded-full" />
      </div>

      <OnboardingWizard onClose={handleClose} />
    </main>
  );
}
