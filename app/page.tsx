'use client';
import React, { useState } from 'react';
import ApiForm from '../components/ApiForm';
import Explorer from '../components/Explorer';

export default function Page() {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(payload: { baseUrl: string; apiKey?: string; headerName?: string; authScheme?: string }) {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch('/api/introspect', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setError(e?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid">
      <section className="card">
        <h1>API Explorer</h1>
        <p className="small">Enter a base URL (OpenAPI/Swagger, GraphQL, or a JSON API). Optional API key is sent using your chosen header and scheme.</p>
        <ApiForm onSubmit={onSubmit} disabled={loading} />
      </section>
      <section className="card">
        <h2>Result</h2>
        {loading && <p>Scanning…</p>}
        {error && <p style={{color:'crimson'}}>Error: {error}</p>}
        {!loading && !error && result && <Explorer data={result}/>}
        {!loading && !error && !result && <p className="small">Results will appear here.</p>}
      </section>
    </main>
  );
}
