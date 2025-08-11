import React from 'react';
import JsonTree from './JsonTree';

type Data =
  | { kind: 'openapi'; sourceUrl?: string; info?: any; paths?: Record<string, any>; components?: any }
  | { kind: 'graphql'; types: Array<{ name: string; kind: string }>; queryType?: string; mutationType?: string }
  | { kind: 'unknown'; note: string };

export default function Explorer({ data }: { data: Data }) {
  if ((data as any).kind === 'openapi') {
    const d = data as any;
    const paths = d.paths || {};
    const pathEntries = Object.entries(paths as Record<string, any>);
    return (
      <div>
        <p className="small">Detected <b>OpenAPI</b>{d.sourceUrl ? ` at ${d.sourceUrl}`:''}</p>
        <h3>Endpoints ({pathEntries.length})</h3>
        <ul>
          {pathEntries.map(([path, byMethod]) => (
            <li key={path}>
              <details>
                <summary><code>{path}</code></summary>
                <ul>
                  {Object.entries(byMethod as Record<string, any>).map(([method, op]) => (
                    <li key={method}>
                      <details>
                        <summary>
                          <code>{method.toUpperCase()}</code>{op.summary ? ` ${op.summary}` : ''}
                        </summary>
                        {op.description && <p className="small">{op.description}</p>}
                        {op.parameters && (
                          <section>
                            <h4>Parameters</h4>
                            <JsonTree data={op.parameters} />
                          </section>
                        )}
                        {op.requestBody && (
                          <section>
                            <h4>Request Body</h4>
                            <JsonTree data={op.requestBody} />
                          </section>
                        )}
                        {op.responses && (
                          <section>
                            <h4>Responses</h4>
                            <JsonTree data={op.responses} />
                          </section>
                        )}
                      </details>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
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
