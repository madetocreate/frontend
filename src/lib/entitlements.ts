import { useAuth } from '@/contexts/AuthContext';

export interface Entitlements {
  hasMarketing: boolean;
  hasWebsiteBot: boolean;
  hasReviewBot: boolean;
  hasTelephony: boolean;
  hasTelegram: boolean;
}

// Temporary mock implementation using Feature Flags or defaults
export function useEntitlements(): Entitlements {
  const { user } = useAuth();
  const isDeveloper = user?.isDeveloper === true || process.env.NEXT_PUBLIC_AKLOW_DEV_MODE === 'true';

  if (isDeveloper) {
    return {
      hasMarketing: true,
      hasWebsiteBot: true,
      hasReviewBot: true,
      hasTelephony: true,
      hasTelegram: true,
    };
  }

  // Note: This is a legacy hook - prefer useEntitlements from @/hooks/useEntitlements
  // In a real app, this would come from a context or API
  // Return locked state (not forced unlock)
  return {
    hasMarketing: false,
    hasWebsiteBot: false,
    hasReviewBot: false,
    hasTelephony: false,
    hasTelegram: false,
  };
}
