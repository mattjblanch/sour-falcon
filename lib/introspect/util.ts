export async function fetchJson(url: string, init?: RequestInit, timeoutMs=8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json') && !ct.includes('+json')) {
      throw new Error(`Not JSON at ${url} (content-type: ${ct})`);
    }
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

export function withAuth(headers: HeadersInit, apiKey?: string, headerName?: string): HeadersInit {
  if (!apiKey) return headers;
  const h = new Headers(headers);
  h.set(headerName || 'Authorization', headerName?.toLowerCase() === 'authorization' || !headerName ? `Bearer ${apiKey}` : apiKey);
  return h;
}
