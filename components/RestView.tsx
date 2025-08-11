"use client";

import React, { useState } from 'react';

function get(obj: any, path: string) {
  return path.split('.').reduce((o, k) => (o ? (o as any)[k] : undefined), obj);
}

export default function RestView({ data }: { data: any }) {
  const { resource, idKey, fields, sample, itemUrlTemplate } = data;
  const [id, setId] = useState('');
  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchItem() {
    if (!itemUrlTemplate) return;
    setLoading(true);
    try {
      const url = itemUrlTemplate.replace('{id}', encodeURIComponent(id));
      const res = await fetch(url);
      const ct = res.headers.get('content-type') || '';
      const body = ct.includes('json') ? await res.json() : await res.text();
      setItem(body);
    } catch (e) {
      setItem({ error: (e as any)?.message || 'Request failed' });
    } finally {
      setLoading(false);
    }
  }

  if (Array.isArray(sample)) {
    const scalar = fields.filter((f: any) => !['object', 'array'].includes(f.type));
    return (
      <div>
        <p className="small">Detected <b>REST JSON</b> resource <code>{resource}</code></p>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                {scalar.map((f:any) => (<th key={f.name}>{f.name}</th>))}
                <th>raw</th>
              </tr>
            </thead>
            <tbody>
              {sample.map((row:any, i:number) => (
                <tr key={i}>
                  {scalar.map((f:any) => (
                    <td key={f.name}>{String(get(row, f.name) ?? '')}</td>
                  ))}
                  <td><details><summary>…</summary><pre>{JSON.stringify(row, null, 2)}</pre></details></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {itemUrlTemplate && idKey && (
          <div style={{ marginTop: '1rem' }}>
            <label>Try item ({idKey})</label>
            <input value={id} onChange={e=>setId(e.target.value)} />
            <button onClick={fetchItem} disabled={loading || !id}>Fetch</button>
            {item && (
              <details open style={{ marginTop: '0.5rem' }}>
                <summary>Result</summary>
                <pre>{JSON.stringify(item, null, 2)}</pre>
              </details>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <p className="small">Detected <b>REST JSON</b> resource <code>{resource}</code></p>
      <h3>Fields</h3>
      <ul>
        {fields.map((f:any) => (
          <li key={f.name}><code>{f.name}</code> <span className="small">{f.type}</span></li>
        ))}
      </ul>
      <details style={{ marginTop:'1rem' }}>
        <summary>Sample</summary>
        <pre>{JSON.stringify(sample, null, 2)}</pre>
      </details>
    </div>
  );
}
