import { withAuth } from './util';

export async function tryHal(endpoint: string, apiKey?: string, headerName?: string, authScheme?: string) {
  try {
    const res = await fetch(endpoint, { headers: withAuth({}, apiKey, headerName, authScheme) });
    if (!res.ok) return { ok: false as const };
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('json')) return { ok: false as const };
    const body = await res.json();
    if (!body || typeof body !== 'object') return { ok: false as const };
    const hasLinks = typeof (body as any)._links === 'object';
    const hasEmbedded = typeof (body as any)._embedded === 'object';
    if (!hasLinks && !hasEmbedded) return { ok: false as const };

    const links: { rel: string; href: string }[] = [];
    const lobj = (body as any)._links || {};
    for (const [rel, val] of Object.entries(lobj)) {
      if (Array.isArray(val)) {
        for (const v of val) if (v && typeof (v as any).href === 'string') links.push({ rel, href: (v as any).href });
      } else if (val && typeof (val as any).href === 'string') {
        links.push({ rel, href: (val as any).href });
      }
    }

    const resources = Object.keys((body as any)._embedded || {});

    return { ok: true as const, data: { kind: 'hal', resources, links } };
  } catch {
    return { ok: false as const };
  }
}

