// components/CapabilityMatrix.tsx
import React from 'react';
import type { ResourceMatrix } from '../lib/openapi/normalize';

const VERBS = ['GET','POST','PUT','PATCH','DELETE'] as const;

export default function CapabilityMatrix({ matrix }: { matrix: ResourceMatrix }) {
  const resources = Object.keys(matrix).sort();
  return (
    <div>
      <h3>Capabilities</h3>
      <div className="small">How each resource can be manipulated.</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px' }}>Resource</th>
              {VERBS.map(v => <th key={v} style={{ textAlign: 'center', padding: '8px' }}>{v}</th>)}
            </tr>
          </thead>
          <tbody>
            {resources.map(r => (
              <tr key={r} style={{ borderTop: '1px solid rgba(0,0,0,.1)' }}>
                <td style={{ padding: '8px', fontWeight: 600 }}>{r}</td>
                {VERBS.map(v => {
                  const n = (matrix[r] as any)[v] || 0;
                  const on = n > 0;
                  return (
                    <td key={v} style={{ textAlign:'center', padding:'8px' }}>
                      {on ? <span title={`${n} endpoint(s)`}>●</span> : <span style={{ opacity:.25 }}>—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
