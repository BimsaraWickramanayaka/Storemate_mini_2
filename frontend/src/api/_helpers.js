// src/api/_helpers.js
// Small helper to normalize list responses (paginated or non-paginated).
export function extractList(response) {
  // response is an axios response
  // Laravel paginated => response.data = { data: [...], meta: { ... }, links: { ... } }
  // Non-paginated list => response.data = [...]
  const payload = response?.data;

  if (!payload) return { items: [], meta: null };

  // If payload has .data as array and meta => paginated
  if (Array.isArray(payload.data) && payload.meta) {
    return { items: payload.data, meta: payload.meta };
  }

  // If payload itself is an array (non-paginated)
  if (Array.isArray(payload)) {
    return { items: payload, meta: null };
  }

  // Fallback: if payload is an object (single resource), return it as single-item list
  return { items: payload.data ?? payload, meta: payload.meta ?? null };
}
