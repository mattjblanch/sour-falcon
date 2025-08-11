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

export function withAuth(headers: HeadersInit, apiKey?: string, headerName?: string, authScheme?: string): HeadersInit {
  if (!apiKey) return headers;
  const h = new Headers(headers);
  const name = headerName || 'Authorization';
  let value: string;
  if (authScheme && authScheme.trim()) {
    if (/^basic$/i.test(authScheme)) {
      value = `Basic ${Buffer.from(apiKey).toString('base64')}`;
    } else {
      value = `${authScheme.trim()} ${apiKey}`.trim();
    }
  } else if (!headerName || headerName.toLowerCase() === 'authorization') {
    value = `Bearer ${apiKey}`;
  } else {
    value = apiKey;
  }
  h.set(name, value);
  return h;
}

export function withQuery(url: string, apiKey?: string, queryName = 'key'): string {
  if (!apiKey) return url;
  const u = new URL(url);
  u.searchParams.append(queryName || 'key', apiKey);
  return u.toString();
}
