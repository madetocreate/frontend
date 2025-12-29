'use client';

import { useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { CustomersList } from '@/features/customers/CustomersList';
import { CustomerProfile } from '@/features/customers/CustomerProfile';
import { applyCustomerFilters } from '@/features/customers/filtering';
import { parseFilterParams, buildFilterParams } from '@/lib/filters/query';
import { CustomerType, CustomerTag, Channel, Customer } from '@/features/customers/types';
import { fetchJson } from '@/lib/api/fetchJson';

export function CustomersView() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse filters from URL
  const filterParams = parseFilterParams(searchParams);

  // Fetch real customers from API
  const { data, isLoading, error } = useQuery({
    queryKey: ['customers', filterParams],
    queryFn: async () => {
      const params = new URLSearchParams(searchParams.toString());
      const data = await fetchJson<{ customers: Customer[] }>(`/api/customers?${params.toString()}`);
      return data.customers;
    },
    staleTime: 60000,
  });

  const allCustomers = useMemo(() => data ?? [], [data]);

  const customersFilters = useMemo(() => {
    return {
      type: filterParams.type as CustomerType | undefined,
      tag: filterParams.tag as CustomerTag[] | undefined,
      range: (filterParams.range || 'all') as 'today' | '7d' | '30d' | 'all',
      ch: filterParams.ch as Channel[] | undefined,
    };
  }, [filterParams]);

  // Apply local filters
  const filteredCustomers = useMemo(() => {
    return applyCustomerFilters(allCustomers, customersFilters);
  }, [allCustomers, customersFilters]);

  // Get selected customer
  const selectedCustomer = useMemo(() => {
    if (!filterParams.id) return null;
    return allCustomers.find((customer) => customer.id === filterParams.id) || null;
  }, [filterParams.id, allCustomers]);

  const handleSelectCustomer = (customer: { id: string }) => {
    const params = buildFilterParams({ ...filterParams, id: customer.id });
    // Wichtig: Wir müssen sicherstellen, dass wir im richtigen Pfad bleiben
    // Aber hier nutzt es replace auf den aktuellen Pfad (durch router.replace mit params)
    // Wenn wir in /service sind, bleiben wir in /service?view=customers&...
    // Aber customers page nutzt /customers
    // Wir sollten pathname dynamisch nutzen oder fixen.
    // Da wir aber params an searchParams anhängen, müssen wir die existierenden Params behalten!
    // filterParams kommt aus searchParams.
    // Aber wir müssen 'view=customers' behalten, wenn wir im Service Hub sind!
    
    // Check if we are in service hub
    const currentView = searchParams.get('view');
    if (currentView === 'customers') {
        params.set('view', 'customers');
    }
    
    // router.replace(`?${params.toString()}`); // Relativ geht nicht so einfach in Next App Router
    // Wir nutzen window.location.pathname?
    const pathname = window.location.pathname;
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleBack = () => {
    const params = buildFilterParams(filterParams);
    // Remove id from params
    params.delete('id');
    
    const currentView = searchParams.get('view');
    if (currentView === 'customers') {
        params.set('view', 'customers');
    }

    const pathname = window.location.pathname;
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Loading state
  if (isLoading) {
    return <div className="p-8 text-center text-[var(--ak-color-text-muted)]">Lade Customers…</div>;
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center text-[var(--ak-color-status-danger-text)]">
        Fehler beim Laden der Kunden: {(error as Error).message}
      </div>
    );
  }

  // Profile View
  if (selectedCustomer) {
    return (
      <CustomerProfile
        customer={selectedCustomer}
        events={[]} // Real events API not yet available
        onBack={handleBack}
      />
    );
  }

  // List View
  return (
    <CustomersList
      customers={filteredCustomers}
      onSelectCustomer={handleSelectCustomer}
    />
  );
}

