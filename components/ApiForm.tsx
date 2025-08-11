'use client';
import React, { useState, useEffect } from 'react';

export default function ApiForm({ onSubmit, disabled }:{ onSubmit:(p:{baseUrl:string; apiKey?: string; headerName?: string; authScheme?: string})=>void; disabled?:boolean;}) {
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [headerName, setHeaderName] = useState('Authorization');
  const [authType, setAuthType] = useState('Bearer');
  const [customScheme, setCustomScheme] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hn = localStorage.getItem('headerName');
    if (hn) setHeaderName(hn);
    const at = localStorage.getItem('authType');
    if (at) setAuthType(at);
    const cs = localStorage.getItem('customScheme');
    if (cs) setCustomScheme(cs);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('headerName', headerName);
  }, [headerName]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('authType', authType);
    if (authType === 'Custom') {
      localStorage.setItem('customScheme', customScheme);
    } else {
      localStorage.removeItem('customScheme');
    }
  }, [authType, customScheme]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let url = baseUrl.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    const scheme = authType === 'Custom' ? customScheme.trim() : authType;
    onSubmit({ baseUrl: url, apiKey: apiKey.trim() || undefined, headerName: headerName.trim() || undefined, authScheme: scheme.trim() || undefined });
  }

  const schemeDisplay = authType === 'Custom' ? customScheme : authType;
  const placeholder = schemeDisplay ? `Will be sent as ${schemeDisplay} token` : 'API key';

  return (
    <form onSubmit={handleSubmit}>
      <label>API Base URL</label>
      <input required placeholder="https://api.example.com" value={baseUrl} onChange={e=>setBaseUrl(e.target.value)} />
      <label>API Key (optional)</label>
      <input type="password" placeholder={placeholder} autoComplete="off" value={apiKey} onChange={e=>setApiKey(e.target.value)} />
      <label>Header Name</label>
      <input placeholder="Authorization" value={headerName} onChange={e=>setHeaderName(e.target.value)} />
      <label>Token Scheme</label>
      <select value={authType} onChange={e=>setAuthType(e.target.value)}>
        <option value="Bearer">Bearer</option>
        <option value="Basic">Basic</option>
        <option value="Custom">Custom</option>
      </select>
      {authType === 'Custom' && (
        <input placeholder="Scheme" value={customScheme} onChange={e=>setCustomScheme(e.target.value)} />
      )}
      <button disabled={disabled} type="submit">Explore</button>
    </form>
  );
}
