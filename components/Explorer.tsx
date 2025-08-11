"use client";

import React, { useState } from 'react';
import JsonTree from './JsonTree';
import Graph, { GraphOp } from './Graph';

type Data =
  | { kind: 'openapi'; sourceUrl?: string; info?: any; paths?: Record<string, any>; components?: any }
  | { kind: 'graphql'; types: Array<{ name: string; kind: string }>; queryType?: string; mutationType?: string }
  | { kind: 'unknown'; note: string };

export default function Explorer({ data }: { data: Data }) {
  const [showGraph, setShowGraph] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  if ((data as any).kind === "openapi") {
    const d = data as any;
    const paths = d.paths || {};
    const pathEntries = Object.entries(paths as Record<string, any>);
    const ops: GraphOp[] = pathEntries.flatMap(([path, byMethod]) =>
      Object.entries(byMethod as Record<string, any>).map(([method, op]) => ({
        id: `${method.toUpperCase()} ${path}`,
        label: `${method.toUpperCase()} ${path}`,
        cluster: op.tags?.[0] || path.split("/")[1] || "root",
      }))
    );
    const endpointCount = ops.length;

    function handleSelect(id: string) {
      setSelected(id);
      const el = document.getElementById(`op-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    return (
      <div>
        <p className="small">
          Detected <b>OpenAPI</b>
          {d.sourceUrl ? ` at ${d.sourceUrl}` : ""}
        </p>
        {endpointCount >= 10 && (
          <p>
            <button onClick={() => setShowGraph((v) => !v)}>
              {showGraph ? "Hide" : "Show"} Graph
            </button>
          </p>
        )}
        {showGraph && <Graph ops={ops} onSelect={handleSelect} />}
        <h3>Endpoints ({pathEntries.length})</h3>
        <ul>
          {pathEntries.map(([path, byMethod]) => (
            <li key={path}>
              <details>
                <summary>
                  <code>{path}</code>
                </summary>
                <ul>
                  {Object.entries(byMethod as Record<string, any>).map(([method, op]) => {
                    const opId = `${method.toUpperCase()} ${path}`;
                    return (
                      <li
                        key={method}
                        id={`op-${opId}`}
                        style={{ background: selected === opId ? "#fffae5" : undefined }}
                      >
                        <details open={selected === opId}>
                          <summary>
                            <code>{method.toUpperCase()}</code>
                            {op.summary ? ` ${op.summary}` : ""}
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
                    );
                  })}
                </ul>
              </details>
            </li>
          ))}
        </ul>
        <details>
          <summary>Raw OpenAPI (truncated)</summary>
          <pre>
            {JSON.stringify(
              { info: d.info, paths: d.paths, components: d.components },
              null,
              2
            )}
          </pre>
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
