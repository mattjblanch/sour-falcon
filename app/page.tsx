'use client';
import React, { useState, useEffect } from 'react';
import ApiForm from "../components/ApiForm";
import Explorer from "../components/Explorer";
import ProjectsPane, { Project } from "../components/ProjectsPane";

export default function Page() {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjects, setShowProjects] = useState(true);
  const [lastPayload, setLastPayload] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("projects");
      if (raw) setProjects(JSON.parse(raw));
    } catch {}
  }, []);

  function persist(list: Project[]) {
    if (typeof window !== "undefined")
      localStorage.setItem("projects", JSON.stringify(list));
  }

  function handleSaveProject() {
    if (!result) return;
    const name = prompt("Project name?");
    if (!name) return;
    const newList = [
      ...projects.filter((p) => p.name !== name),
      { name, result, baseUrl: lastPayload?.baseUrl, payload: lastPayload },
    ];
    setProjects(newList);
    persist(newList);
  }

  function handleSelectProject(p: Project) {
    setResult(p.result);
    setShowProjects(false);
    if (p.payload) {
      setLastPayload(p.payload);
    } else if (p.baseUrl) {
      setLastPayload({ baseUrl: p.baseUrl });
    }
  }

  async function onSubmit(payload: { baseUrl: string; apiKey?: string; headerName?: string; authScheme?: string; authMethod?: string; queryName?: string; useAuth?: boolean; authType?: string; customScheme?: string }) {
    setLoading(true); setError(null); setResult(null); setLastPayload(payload);
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
    <>
      {!showProjects && (
        <button onClick={() => setShowProjects(true)} style={{ width: "auto", marginBottom: "1rem" }}>
          Show Projects
        </button>
      )}
      <main className={`grid ${showProjects ? "with-projects" : ""}`}>
        {showProjects && (
          <section className="card" style={{ paddingLeft: 0 }}>
            <ProjectsPane
              projects={projects}
              onSelect={handleSelectProject}
              onClose={() => setShowProjects(false)}
            />
          </section>
        )}
        <section className="card">
          <h1>API Explorer</h1>
          <p className="small">
            Enter a base URL (OpenAPI/Swagger, GraphQL, or a JSON API). Optional API key is sent using your chosen header or query
            parameter.
          </p>
          <ApiForm onSubmit={onSubmit} disabled={loading} initial={lastPayload || undefined} />
        </section>
        <section className="card">
          <h2>Result</h2>
          {loading && <p>Scanning…</p>}
          {error && <p style={{ color: "crimson" }}>Error: {error}</p>}
          {!loading && !error && result && (
            <>
              <button onClick={handleSaveProject} style={{ width: "auto", marginBottom: ".5rem" }}>
                Save Project
              </button>
              <Explorer data={result} />
            </>
          )}
          {!loading && !error && !result && <p className="small">Results will appear here.</p>}
        </section>
      </main>
    </>
  );
}
