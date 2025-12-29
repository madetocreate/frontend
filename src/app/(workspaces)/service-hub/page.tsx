import { redirect } from 'next/navigation';

export default async function ServiceHubPage({
  searchParams,
}: {
  searchParams?: Promise<{ area?: string }> | { area?: string };
}) {
  // Map area to correct route
  const routeMap: Record<string, string> = {
    'inbox': '/inbox',
    'docs': '/docs',
    'customers': '/customers',
    'website': '/settings?view=integrations',
    'reviews': '/settings?view=integrations',
    'telephony': '/settings?view=integrations',
    'telegram': '/settings?view=integrations',
    'marketing': '/settings?view=integrations',
  };

  // Handle both Promise and direct object (Next.js 13+ compatibility)
  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const area = params?.area;
  const targetRoute = area && routeMap[area] ? routeMap[area] : '/inbox';
  
  redirect(targetRoute);
}

