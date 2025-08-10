import React from 'react';

type Data =
  | { kind: 'openapi'; sourceUrl?: string; info?: any; paths?: Record<string, any>; components?: any }
  | { kind: 'graphql'; types: Array<{ name: string; kind: string }>; queryType?: string; mutationType?: string }
  | { kind: 'unknown'; note: string };

export default function Explorer({ data }: { data: Data }) {
  if ((data as any).kind === 'openapi') {
    const d = data as any;
    const paths = d.paths || {};
    const endpoints = Object.entries(paths).flatMap(([p, byMethod]) =>
      Object.keys(byMethod as any).map((m)=> ({ path: p, method: m.toUpperCase() }))
    );
    return (
      <div>
        <p className="small">Detected <b>OpenAPI</b>{d.sourceUrl ? ` at ${d.sourceUrl}`:''}</p>
        <h3>Endpoints ({endpoints.length})</h3>
        <ul>
          {endpoints.map((e, i)=>(<li key={i}><code>{e.method}</code> <code>{e.path}</code></li>))}
        </ul>
        <details>
          <summary>Raw OpenAPI (truncated)</summary>
          <pre>{JSON.stringify({ info: d.info, paths: d.paths, components: d.components }, null, 2)}</pre>
        </details>
      </div>
    );
  }

  if ((data as any).kind === 'graphql') {
    const d = data as any;
    return (
      <div>
        <p className="small">Detected <b>GraphQL</b></p>
        <h3>Root Types</h3>
        <ul>
          <li>query: <code>{d.queryType || '—'}</code></li>
          <li>mutation: <code>{d.mutationType || '—'}</code></li>
        </ul>
        <h3>Types ({d.types.length})</h3>
        <ul>
          {d.types.slice(0, 200).map((t:any, i:number)=>(<li key={i}><code>{t.kind}</code> <b>{t.name}</b></li>))}
        </ul>
      </div>
    );
  }

  const u = data as any;
  return (
    <div>
      <p className="small">Couldn’t auto-detect this API yet.</p>
      <pre>{JSON.stringify(u, null, 2)}</pre>
    </div>
  );
}
