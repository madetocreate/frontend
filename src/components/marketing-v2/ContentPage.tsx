'use client';

import { ContentCreator } from './ContentCreator';
import { appleSectionTitle, appleAnimationFadeInUp } from '@/lib/appleDesign';

export function ContentPage() {
  return (
    <div className={`space-y-6 ${appleAnimationFadeInUp}`}>
      <div>
        <h2 className={appleSectionTitle}>Content Studio</h2>
        <p className="text-[var(--ak-color-text-secondary)]">
          Erstelle, plane und verwalte deine Social Media Posts.
        </p>
      </div>
      
      <ContentCreator />
    </div>
  );
}

