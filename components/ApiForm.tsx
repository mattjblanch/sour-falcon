'use client';
import React, { useState, useEffect } from 'react';

type Payload = {
  baseUrl: string;
  apiKey?: string;
  headerName?: string;
  authScheme?: string;
  authMethod?: string;
  queryName?: string;
  useAuth?: boolean;
  authType?: string;
  customScheme?: string;
};

export default function ApiForm({ onSubmit, disabled, initial }:{ onSubmit:(p:Payload)=>void; disabled?:boolean; initial?:Payload;}) {
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [useAuth, setUseAuth] = useState(false);
  const [authMethod, setAuthMethod] = useState('header');
  const [headerName, setHeaderName] = useState('Authorization');
  const [authType, setAuthType] = useState('Bearer');
  const [customScheme, setCustomScheme] = useState('');
  const [queryName, setQueryName] = useState('key');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const bu = localStorage.getItem('baseUrl');
    if (bu) setBaseUrl(bu);
    const ak = localStorage.getItem('apiKey');
    if (ak) setApiKey(ak);
    const am = localStorage.getItem('authMethod');
    if (am) setAuthMethod(am);
    const hn = localStorage.getItem('headerName');
    if (hn) setHeaderName(hn);
    const at = localStorage.getItem('authType');
    if (at) setAuthType(at);
    const cs = localStorage.getItem('customScheme');
    if (cs) setCustomScheme(cs);
    const qn = localStorage.getItem('queryName');
    if (qn) setQueryName(qn);
    const ua = localStorage.getItem('useAuth');
    if (ua) setUseAuth(ua === 'true');
  }, []);

  useEffect(() => {
    if (!initial) return;
    setBaseUrl(initial.baseUrl || '');
    setUseAuth(Boolean(initial.useAuth));
    setApiKey(initial.apiKey || '');
    if (initial.authMethod) setAuthMethod(initial.authMethod);
    if (initial.headerName) setHeaderName(initial.headerName);
    if (initial.queryName) setQueryName(initial.queryName);
    if (initial.authType) {
      setAuthType(initial.authType);
      if (initial.authType === 'Custom') setCustomScheme(initial.customScheme || '');
    } else if (initial.authScheme) {
      if (initial.authScheme === 'Bearer' || initial.authScheme === 'Basic') {
        setAuthType(initial.authScheme);
      } else {
        setAuthType('Custom');
        setCustomScheme(initial.authScheme);
      }
    }
  }, [initial]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('authMethod', authMethod);
  }, [authMethod]);

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

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('queryName', queryName);
  }, [queryName]);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('useAuth', String(useAuth));
  }, [useAuth]);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('baseUrl', baseUrl);
  }, [baseUrl]);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('apiKey', apiKey);
  }, [apiKey]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let url = baseUrl.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    const scheme = authType === 'Custom' ? customScheme.trim() : authType;
    const payload: Payload = { baseUrl: url, useAuth };
    if (useAuth) {
      payload.apiKey = apiKey.trim() || undefined;
      payload.authMethod = authMethod;
      if (authMethod === 'header') {
        payload.headerName = headerName.trim() || undefined;
        payload.authScheme = scheme.trim() || undefined;
        payload.authType = authType;
        if (authType === 'Custom') payload.customScheme = customScheme.trim() || undefined;
      } else if (authMethod === 'query') {
        payload.queryName = queryName.trim() || undefined;
      }
    }
    onSubmit(payload);
  }

  const schemeDisplay = authType === 'Custom' ? customScheme : authType;
  const placeholder = authMethod === 'header' && schemeDisplay ? `Will be sent as ${schemeDisplay} token` : 'API key';

  return (
    <form onSubmit={handleSubmit}>
      <label>API Base URL</label>
      <input required placeholder="https://api.example.com" value={baseUrl} onChange={e=>setBaseUrl(e.target.value)} />
      <label style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
        <input type="checkbox" checked={useAuth} onChange={e=>setUseAuth(e.target.checked)} style={{width:'auto'}} />
        Authorization
      </label>
      {useAuth && (
        <>
          <label>API Key (optional)</label>
          <input type="password" placeholder={placeholder} autoComplete="off" value={apiKey} onChange={e=>setApiKey(e.target.value)} />
          <label>Auth Method</label>
          <select value={authMethod} onChange={e=>setAuthMethod(e.target.value)}>
            <option value="header">Header</option>
            <option value="query">Query param</option>
          </select>
          {authMethod === 'header' && (
            <>
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
            </>
          )}
          {authMethod === 'query' && (
            <>
              <label>Query key name</label>
              <input placeholder="key" value={queryName} onChange={e=>setQueryName(e.target.value)} />
            </>
          )}
        </>
      )}
      <button disabled={disabled} type="submit">Explore</button>
    </form>
  );
}
