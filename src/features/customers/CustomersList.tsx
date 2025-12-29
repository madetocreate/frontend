'use client';

import { Customer } from './types';
import { AkListRow } from '@/components/ui/AkListRow';
import { AkBadge } from '@/components/ui/AkBadge';
import { AkEmptyState } from '@/components/ui/AkEmptyState';
import { UserGroupIcon } from '@heroicons/react/24/outline';

interface CustomersListProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Gerade eben';
  if (diffMins < 60) return `vor ${diffMins} Min`;
  if (diffHours < 24) return `vor ${diffHours} Std`;
  if (diffDays === 1) return 'Gestern';
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
}

export function CustomersList({ customers, onSelectCustomer }: CustomersListProps) {
  if (customers.length === 0) {
    return (
      <AkEmptyState
        icon={<UserGroupIcon />}
        title="Keine Kunden gefunden"
        description="Passe die Filter an, um mehr Ergebnisse zu sehen."
      />
    );
  }

  return (
    <div className="space-y-1">
      {customers.map((customer) => (
        <AkListRow
          key={customer.id}
          accent="customers"
          onClick={() => onSelectCustomer(customer)}
          leading={
            <div className="w-10 h-10 rounded-full bg-[var(--ak-color-bg-surface-muted)] flex items-center justify-center">
              <span className="text-sm font-medium text-[var(--ak-color-text-secondary)]">
                {getInitials(customer.displayName)}
              </span>
            </div>
          }
          title={
            <div className="space-y-1">
              <div>
                <h3 className="text-sm font-medium text-[var(--ak-color-text-primary)] line-clamp-1">
                  {customer.displayName}
                  {customer.companyName && customer.type === 'contact' && (
                    <span className="text-xs text-[var(--ak-color-text-muted)] ml-1">
                      · {customer.companyName}
                    </span>
                  )}
                </h3>
                {customer.email && (
                  <p className="text-xs text-[var(--ak-color-text-muted)] line-clamp-1">
                    {customer.email}
                  </p>
                )}
              </div>
              <p className="text-xs text-[var(--ak-color-text-secondary)] line-clamp-1">
                {customer.lastActivitySummary}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {customer.tags.map((tag) => (
                  <AkBadge key={tag} tone="neutral" size="xs">
                    {tag === 'lead' && 'Lead'}
                    {tag === 'stammkunde' && 'Stammkunde'}
                    {tag === 'vip' && 'VIP'}
                  </AkBadge>
                ))}
                {customer.counters?.openItems && customer.counters.openItems > 0 && (
                  <AkBadge tone="warning" size="xs">
                    {customer.counters.openItems} offen
                  </AkBadge>
                )}
              </div>
            </div>
          }
          trailing={
            <span className="text-xs text-[var(--ak-color-text-muted)] flex-shrink-0">
              {formatTimeAgo(customer.lastActivityAt)}
            </span>
          }
        />
      ))}
    </div>
  );
}

