import { withAuth } from './util';

export async function tryJsonApi(endpoint: string, apiKey?: string, headerName?: string, authScheme?: string) {
  try {
    const res = await fetch(endpoint, { headers: withAuth({}, apiKey, headerName, authScheme) });
    if (!res.ok) return { ok: false as const };
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/vnd.api+json')) return { ok: false as const };
    const body = await res.json();
    if (!body || typeof body !== 'object') return { ok: false as const };

    const resources: string[] = [];
    const data = (body as any).data;
    if (Array.isArray(data)) {
      for (const item of data) if (item && typeof item.type === 'string') resources.push(item.type);
    } else if (data && typeof data.type === 'string') {
      resources.push(data.type);
    }

    const links: { rel: string; href: string }[] = [];
    const ls = (body as any).links;
    if (ls && typeof ls === 'object') {
      for (const [rel, val] of Object.entries(ls)) {
        if (typeof val === 'string') {
          links.push({ rel, href: val });
        } else if (val && typeof (val as any).href === 'string') {
          links.push({ rel, href: (val as any).href });
        }
      }
    }

    return { ok: true as const, data: { kind: 'jsonapi', resources, links } };
  } catch {
    return { ok: false as const };
  }
}

