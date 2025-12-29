/**
 * Filter Query Params Helpers
 * 
 * Utilities to parse and build URL query params for filters.
 * URL is source-of-truth, localStorage is fallback.
 */

export interface FilterParams {
  src?: string[]; // comma-separated sources
  status?: string; // needs_action|open|archived
  range?: string; // today|7d|30d|all
  q?: string; // search query
  id?: string; // selected item id
  // Actions filters
  cat?: string[]; // comma-separated categoryIds
  type?: string; // template|automation (Actions) OR company|contact (Customers)
  view?: string; // all|favorites|new|archived
  // Customers filters
  tag?: string[]; // comma-separated tags
  ch?: string[]; // comma-separated channels
}

/**
 * Parse URL search params into FilterParams
 */
export function parseFilterParams(searchParams: URLSearchParams): FilterParams {
  const params: FilterParams = {};

  // Sources (comma-separated)
  const srcParam = searchParams.get('src');
  if (srcParam) {
    params.src = srcParam.split(',').filter(Boolean);
  }

  // Status
  const statusParam = searchParams.get('status');
  if (statusParam) {
    params.status = statusParam;
  }

  // Range
  const rangeParam = searchParams.get('range');
  if (rangeParam) {
    params.range = rangeParam;
  } else {
    params.range = 'all'; // default
  }

  // Search query
  const qParam = searchParams.get('q');
  if (qParam) {
    params.q = qParam;
  }

  // Item ID
  const idParam = searchParams.get('id');
  if (idParam) {
    params.id = idParam;
  }

  // Actions: Categories
  const catParam = searchParams.get('cat');
  if (catParam) {
    params.cat = catParam.split(',').filter(Boolean);
  }

  // Type (used for both Actions and Customers - context determines which)
  const typeParam = searchParams.get('type');
  if (typeParam) {
    // Check if it's a customer type (company/contact) or action type (template/automation)
    if (typeParam === 'company' || typeParam === 'contact') {
      // Customer type
      params.type = typeParam;
    } else if (typeParam === 'template' || typeParam === 'automation') {
      // Action type
      params.type = typeParam;
    } else {
      // Default: assume it's a customer type if it doesn't match action types
      params.type = typeParam;
    }
  }

  // Actions: View
  const viewParam = searchParams.get('view');
  if (viewParam) {
    params.view = viewParam;
  }

  // Customers: Tag
  const tagParam = searchParams.get('tag');
  if (tagParam) {
    params.tag = tagParam.split(',').filter(Boolean);
  }

  // Customers: Channel
  const chParam = searchParams.get('ch');
  if (chParam) {
    params.ch = chParam.split(',').filter(Boolean);
  }

  return params;
}

/**
 * Build URL search params from FilterParams
 */
export function buildFilterParams(params: FilterParams): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (params.src && params.src.length > 0) {
    searchParams.set('src', params.src.join(','));
  }

  if (params.status) {
    searchParams.set('status', params.status);
  }

  if (params.range && params.range !== 'all') {
    searchParams.set('range', params.range);
  }

  if (params.q) {
    searchParams.set('q', params.q);
  }

  if (params.id) {
    searchParams.set('id', params.id);
  }

  // Actions: Categories
  if (params.cat && params.cat.length > 0) {
    searchParams.set('cat', params.cat.join(','));
  }

  // Actions: Type
  if (params.type) {
    searchParams.set('type', params.type);
  }

  // Actions: View
  if (params.view && params.view !== 'all') {
    searchParams.set('view', params.view);
  }

  // Customers: Type
  if (params.type) {
    searchParams.set('type', params.type);
  }

  // Customers: Tag
  if (params.tag && params.tag.length > 0) {
    searchParams.set('tag', params.tag.join(','));
  }

  // Customers: Channel
  if (params.ch && params.ch.length > 0) {
    searchParams.set('ch', params.ch.join(','));
  }

  return searchParams;
}

/**
 * Count active filters (for badge)
 * Ensures each filter type is only counted once.
 */
export function countActiveFilters(params: FilterParams): number {
  let count = 0;

  if (params.src && params.src.length > 0) {
    count += 1;
  }

  if (params.status) {
    count += 1;
  }

  if (params.range && params.range !== 'all') {
    count += 1;
  }

  if (params.q) {
    count += 1;
  }

  if (params.cat && params.cat.length > 0) {
    count += 1;
  }

  // Type is shared between Actions and Customers
  if (params.type && params.type !== 'template') {
    count += 1;
  }

  if (params.view && params.view !== 'all') {
    count += 1;
  }

  if (params.tag && params.tag.length > 0) {
    count += 1;
  }

  if (params.ch && params.ch.length > 0) {
    count += 1;
  }

  return count;
}

/**
 * Load filters from localStorage (fallback)
 */
export function loadFiltersFromStorage(key: string): FilterParams | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // Ignore parse errors
  }

  return null;
}

/**
 * Save filters to localStorage (fallback)
 */
export function saveFiltersToStorage(key: string, params: FilterParams): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(key, JSON.stringify(params));
  } catch (e) {
    // Ignore storage errors
  }
}

