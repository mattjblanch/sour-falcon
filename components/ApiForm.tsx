'use client';
import React, { useState } from 'react';

export default function ApiForm({ onSubmit, disabled }:{ onSubmit:(p:{baseUrl:string; apiKey?: string; headerName?: string})=>void; disabled?:boolean;}) {
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [headerName, setHeaderName] = useState('Authorization');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let url = baseUrl.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    onSubmit({ baseUrl: url, apiKey: apiKey.trim() || undefined, headerName: headerName.trim() || undefined });
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>API Base URL</label>
      <input required placeholder="https://api.example.com" value={baseUrl} onChange={e=>setBaseUrl(e.target.value)} />
      <label>API Key (optional)</label>
      <input type="password" placeholder="Will be sent as Bearer token" autoComplete="off" value={apiKey} onChange={e=>setApiKey(e.target.value)} />
      <label>Header Name</label>
      <input placeholder="Authorization" value={headerName} onChange={e=>setHeaderName(e.target.value)} />
      <button disabled={disabled} type="submit">Explore</button>
    </form>
  );
}
