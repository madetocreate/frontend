import { Customer, CustomersFilters } from './types';

/**
 * Apply filters to customers
 */
export function applyCustomerFilters(
  customers: Customer[],
  filters: CustomersFilters
): Customer[] {
  let filtered = [...customers];

  // Filter by type
  if (filters.type) {
    filtered = filtered.filter((customer) => customer.type === filters.type);
  }

  // Filter by tags
  if (filters.tag && filters.tag.length > 0) {
    filtered = filtered.filter((customer) =>
      customer.tags.some((tag) => filters.tag!.includes(tag))
    );
  }

  // Filter by activity range
  if (filters.range && filters.range !== 'all') {
    const now = new Date();
    const cutoff = new Date();

    switch (filters.range) {
      case 'today':
        cutoff.setHours(0, 0, 0, 0);
        break;
      case '7d':
        cutoff.setDate(cutoff.getDate() - 7);
        break;
      case '30d':
        cutoff.setDate(cutoff.getDate() - 30);
        break;
    }

    filtered = filtered.filter((customer) => {
      const lastActivity = new Date(customer.lastActivityAt);
      return lastActivity >= cutoff;
    });
  }

  // Filter by channel (based on last activity summary)
  if (filters.ch && filters.ch.length > 0) {
    const channelKeywords: Record<string, string[]> = {
      email: ['E-Mail', 'email'],
      telegram: ['Telegram', 'telegram'],
      reviews: ['Review', 'Bewertung'],
      website: ['Website', 'website'],
      phone: ['Anruf', 'Call'],
      docs: ['Dokument', 'doc'],
    };

    filtered = filtered.filter((customer) => {
      const summary = customer.lastActivitySummary.toLowerCase();
      return filters.ch!.some((ch) => {
        const keywords = channelKeywords[ch] || [];
        return keywords.some((keyword) => summary.includes(keyword.toLowerCase()));
      });
    });
  }

  return filtered;
}

