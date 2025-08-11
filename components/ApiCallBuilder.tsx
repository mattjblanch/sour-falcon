"use client";

import React, { useEffect, useState } from "react";

interface Payload {
  baseUrl: string;
  apiKey?: string;
  queryName?: string;
  authMethod?: string;
  useAuth?: boolean;
  headerName?: string;
  authScheme?: string;
}

function buildUrl(p: Payload): string {
  try {
    const url = new URL(p.baseUrl);
    if (p.useAuth && p.authMethod === "query" && p.apiKey && p.queryName) {
      url.searchParams.set(p.queryName, p.apiKey);
    }
    return url.toString();
  } catch {
    let url = p.baseUrl;
    if (p.useAuth && p.authMethod === "query" && p.apiKey && p.queryName) {
      const sep = url.includes("?") ? "&" : "?";
      url += `${sep}${p.queryName}=${encodeURIComponent(p.apiKey)}`;
    }
    return url;
  }
}

export default function ApiCallBuilder({ payload, endpoint }: { payload: Payload; endpoint?: { method: string; path: string } }) {
  const [method, setMethod] = useState(endpoint?.method || "GET");
  const [url, setUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState<string>("");

  useEffect(() => {
    if (endpoint?.method) setMethod(endpoint.method);
  }, [endpoint?.method]);

  useEffect(() => {
    const base = buildUrl(payload);
    const full = endpoint?.path ? `${base.replace(/\/+$/, '')}${endpoint.path}` : base;
    setUrl(full);
  }, [payload, endpoint?.path]);

  async function handleSend() {
    setSending(true);
    setResponse("");
    try {
      const headers: Record<string, string> = {};
      if (
        payload.useAuth &&
        payload.authMethod === "header" &&
        payload.apiKey &&
        payload.headerName
      ) {
        const value = payload.authScheme
          ? `${payload.authScheme} ${payload.apiKey}`
          : payload.apiKey;
        headers[payload.headerName] = value;
      }
      const res = await fetch(url, { method, headers });
      const text = await res.text();
      setResponse(text);
    } catch (e: any) {
      setResponse(String(e));
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <select
          style={{ width: "auto" }}
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          {[
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
            "HEAD",
          ].map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ flex: 1 }}
        />
        <button
          style={{ width: "auto" }}
          onClick={handleSend}
          disabled={sending}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
      {response && (
        <pre style={{ marginTop: ".5rem", maxHeight: "20rem", overflow: "auto" }}>
          {response}
        </pre>
      )}
    </>
  );
}

