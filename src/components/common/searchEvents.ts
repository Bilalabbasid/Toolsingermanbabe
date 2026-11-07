/** Tiny event bridge so any client island can open the global search modal owned by the Header. */
export const OPEN_SEARCH_EVENT = 'datei_tools_open_search';

export interface OpenSearchDetail {
  query?: string;
}

export function openGlobalSearch(query?: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<OpenSearchDetail>(OPEN_SEARCH_EVENT, { detail: { query } }));
}
