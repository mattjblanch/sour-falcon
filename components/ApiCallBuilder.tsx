"use client";

import React, { useEffect, useState } from "react";

interface Payload {
  baseUrl: string;
  apiKey?: string;
  queryName?: string;
  authMethod?: string;
  useAuth?: boolean;
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

export default function ApiCallBuilder({ payload }: { payload: Payload }) {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(buildUrl(payload));
  }, [payload]);

  return (
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
    </div>
  );
}

