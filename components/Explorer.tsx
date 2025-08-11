"use client";

import React, { useMemo, useState } from 'react';
import CapabilityMatrix from './CapabilityMatrix';
import SchemaTree from './SchemaTree';
import GraphView from './GraphView';
import { isOpenApi, collectOperations, buildCapabilityMatrix, resolveSchemaRef, pickPrimaryResponse } from '../lib/openapi/normalize';

type Data =
  | { kind: 'openapi'; sourceUrl?: string; info?: any; paths?: Record<string, any>; components?: any }
  | { kind: 'graphql'; types: Array<{ name: string; kind: string }>; queryType?: string; mutationType?: string }
  | { kind: 'unknown'; note: string };

export default function Explorer({ data }: { data: Data }) {
  const isOas = data?.kind === 'openapi' && isOpenApi(data);
  const ops = useMemo(() => (isOas ? collectOperations(data as any) : []), [data, isOas]);
  const matrix = useMemo(() => (isOas ? buildCapabilityMatrix(ops) : {}), [ops, isOas]);
  const [showGraph, setShowGraph] = useState(false);

  if (isOas) {

    return (
      <div>
        <p className="small">Detected <b>OpenAPI</b>{data.sourceUrl ? ` at ${data.sourceUrl}` : ''}</p>
        <CapabilityMatrix matrix={matrix} />
        <p style={{ marginTop: '0.5rem' }}>
          <button onClick={() => setShowGraph(v => !v)}>{showGraph ? 'Show List' : 'Show Graph'}</button>
        </p>
        {showGraph ? (
          <GraphView doc={data} />
        ) : (
          <>
            <h3 style={{ marginTop: '1rem' }}>Endpoints ({ops.length})</h3>
            <div className="small">Click a card to preview schemas.</div>
            <div style={{ display:'grid', gap:'0.75rem' }}>
              {ops.map((op, i) => {
                const resp = pickPrimaryResponse(op);
                let schema: any = undefined;
                if (resp?.content) {
                  for (const [ct, media] of Object.entries(resp.content)) {
                    if (ct.includes('json') && (media as any).schema) {
                      schema = resolveSchemaRef(data, (media as any).schema);
                      break;
                    }
                  }
                }
                let requestSchema: any = undefined;
                const rb = (op.requestBody && (op.requestBody as any).content) || undefined;
                if (rb) {
                  for (const [ct, media] of Object.entries(rb)) {
                    if (ct.includes('json') && (media as any).schema) {
                      requestSchema = resolveSchemaRef(data, (media as any).schema);
                      break;
                    }
                  }
                }
                const needsAuth = Array.isArray(op.security) && op.security.length > 0;
                return (
                  <details key={i} className="card">
                    <summary style={{ display:'flex', gap:'.5rem', alignItems:'center', cursor:'pointer' }}>
                      <code style={{ fontWeight:700 }}>{op.method.toUpperCase()}</code>
                      <code>{op.path}</code>
                      {needsAuth && <span className="small" style={{ marginLeft:'auto' }}>🔐 auth</span>}
                    </summary>
                    {op.summary && <p className="small" style={{ marginTop:'.5rem' }}>{op.summary}</p>}
                    {requestSchema && (
                      <>
                        <h4>Request Body</h4>
                        <SchemaTree schema={requestSchema} />
                      </>
                    )}
                    {schema && (
                      <>
                        <h4>Response {resp?.status ? `(${resp.status})` : ''}</h4>
                        <SchemaTree schema={schema} />
                      </>
                    )}
                  </details>
                );
              })}
            </div>
          </>
        )}
        <details style={{ marginTop:'1rem' }}>
          <summary>Raw OpenAPI (truncated)</summary>
          <pre>{JSON.stringify({ info: data.info, paths: data.paths, components: data.components }, null, 2)}</pre>
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
