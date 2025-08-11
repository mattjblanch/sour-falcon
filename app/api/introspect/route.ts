import { NextRequest, NextResponse } from 'next/server';
import { tryOpenApi } from '../../../lib/introspect/openapi';
import { tryGraphQL } from '../../../lib/introspect/graphql';
import { tryJsonApi } from '../../../lib/introspect/jsonapi';
import { tryHal } from '../../../lib/introspect/hal';
import { withAuth } from '../../../lib/introspect/util';

function sanitizeUrl(url: string) {
  const u = new URL(url);
  if (!/^https?:$/.test(u.protocol)) throw new Error('Only http(s) URLs are allowed');
  return u.toString();
}

export async function POST(req: NextRequest) {
  try {
    const { baseUrl, apiKey, headerName, authScheme } = await req.json();
    if (!baseUrl) return NextResponse.json({ error: 'baseUrl required' }, { status: 400 });
    const url = sanitizeUrl(baseUrl);

    // Try OpenAPI / Swagger
    const openapi = await tryOpenApi(url, apiKey, headerName, authScheme);
    if (openapi.ok) return NextResponse.json(openapi.data);

    // Try GraphQL at the same endpoint
    const gql = await tryGraphQL(url, apiKey, headerName, authScheme);
    if (gql.ok) return NextResponse.json(gql.data);

    // Try JSON:API at base URL
    const ja = await tryJsonApi(url, apiKey, headerName, authScheme);
    if (ja.ok) return NextResponse.json(ja.data);

    // Try HAL at base URL
    const hal = await tryHal(url, apiKey, headerName, authScheme);
    if (hal.ok) return NextResponse.json(hal.data);

    // Fallback: fetch base URL and return small preview (no guessing yet)
    try {
      const res = await fetch(url, { headers: withAuth({}, apiKey, headerName, authScheme) });
      const ct = res.headers.get('content-type') || '';
      const body = ct.includes('json') ? await res.json() : await res.text();
      return NextResponse.json({ kind: 'unknown', note: 'No OpenAPI/GraphQL detected at common locations', preview: typeof body === 'string' ? body.slice(0, 2000) : body });
    } catch (e:any) {
      return NextResponse.json({ kind: 'unknown', note: 'Fetch failed', error: e?.message }, { status: 502 });
    }
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Bad Request' }, { status: 400 });
  }
}
