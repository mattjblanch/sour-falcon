import { fetchJson, withAuth } from './util';

// Minimal introspection query (shortened variant)
const INTROSPECTION_QUERY = `
  query IntrospectionQuery {
    __schema {
      queryType { name }
      mutationType { name }
      types { kind name }
    }
  }
`;

export async function tryGraphQL(endpoint: string, apiKey?: string, headerName?: string) {
  try {
    const body = JSON.stringify({ query: INTROSPECTION_QUERY });
    const headers = withAuth({ 'content-type': 'application/json' }, apiKey, headerName);
    const res = await fetch(endpoint, { method: 'POST', headers, body });
    if (!res.ok) return { ok: false as const };
    const data = await res.json();
    if (data?.data?.__schema) {
      const s = data.data.__schema;
      return {
        ok: true as const,
        data: {
          kind: 'graphql',
          queryType: s.queryType?.name,
          mutationType: s.mutationType?.name,
          types: s.types?.map((t:any)=>({ name: t.name, kind: t.kind })) ?? []
        }
      };
    }
  } catch {/* ignore */}
  return { ok: false as const };
}
