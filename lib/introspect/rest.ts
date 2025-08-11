import { withAuth, withQuery } from './util';

function deriveResource(url: string) {
  try {
    const u = new URL(url);
    const segments = u.pathname.replace(/\/+$/, '').split('/');
    const last = segments.pop() || '';
    return last.replace(/\.[^.]+$/, '');
  } catch {
    return '';
  }
}

function guessIdKey(item: any) {
  if (!item || typeof item !== 'object') return undefined;
  for (const key of Object.keys(item)) {
    const lower = key.toLowerCase();
    if (lower === 'id' || lower === '_id' || lower === 'uuid' || lower === 'guid') return key;
  }
  return undefined;
}

function inferFields(sample: any[]) {
  const acc: Record<string, string> = {};
  function walk(obj: any, prefix = '') {
    if (!obj || typeof obj !== 'object') return;
    for (const [k, v] of Object.entries(obj)) {
      const name = prefix ? `${prefix}.${k}` : k;
      const t = Array.isArray(v) ? 'array' : typeof v;
      if (t === 'object' && v !== null) {
        walk(v, name);
      } else {
        if (!(name in acc)) acc[name] = t;
      }
    }
  }
  for (const item of sample.slice(0, 50)) walk(item);
  return Object.entries(acc).map(([name, type]) => ({ name, type }));
}

function buildItemTemplate(url: string, resource: string, idKey?: string, apiKey?: string, authMethod?: string, queryName?: string) {
  if (!idKey) return undefined;
  try {
    const u = new URL(url);
    const segments = u.pathname.replace(/\/+$/, '').split('/');
    const last = segments.pop() || '';
    const match = last.match(/(\.[^.]+)$/);
    const ext = match ? match[1] : '';
    const prefix = segments.join('/');
    let path = `${prefix}/${resource}/{id}${ext}`;
    if (!path.startsWith('/')) path = '/' + path;
    let query = u.search;
    if (authMethod === 'query' && apiKey) {
      const sp = new URLSearchParams(query);
      sp.set(queryName || 'key', apiKey);
      query = `?${sp.toString()}`;
    }
    return `${u.protocol}//${u.host}${path}${query}`;
  } catch {
    return undefined;
  }
}

export async function tryRest(endpoint: string, apiKey?: string, headerName?: string, authScheme?: string, authMethod?: string, queryName?: string) {
  try {
    let url = endpoint;
    let headers: HeadersInit = {};
    if (authMethod === 'query') {
      url = withQuery(url, apiKey, queryName);
    } else {
      headers = withAuth(headers, apiKey, headerName, authScheme);
    }
    const res = await fetch(url, { headers });
    if (!res.ok) return { ok: false as const };
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('json')) return { ok: false as const };
    const body = await res.json();
    if (!body) return { ok: false as const };
    const resource = deriveResource(endpoint);
    if (Array.isArray(body) && body.every(i => i && typeof i === 'object')) {
      const sample = body.slice(0, 50);
      const fields = inferFields(sample);
      const idKey = guessIdKey(sample[0]);
      const itemUrlTemplate = buildItemTemplate(endpoint, resource, idKey, apiKey, authMethod, queryName);
      return { ok: true as const, data: { kind: 'rest', resource, idKey, fields, sample, itemUrlTemplate } };
    } else if (body && typeof body === 'object') {
      const fields = inferFields([body]);
      return { ok: true as const, data: { kind: 'rest', resource, fields, sample: body } };
    }
    return { ok: false as const };
  } catch {
    return { ok: false as const };
  }
}

