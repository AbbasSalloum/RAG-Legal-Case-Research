import { useState } from "react";
import "./App.css";
import type { LegalCase, SearchParams } from "./types";
import { SearchForm } from "./components/SearchForm";
import { ResultsList } from "./components/ResultsList";

function App() {
  const [results, setResults] = useState<LegalCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(params: SearchParams) {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch("http://localhost:5000/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(params)
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      setResults(data.results || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const hasResults = results.length > 0;
  const statusPills: Array<{ key: string; text: string; className: string }> = [];

  if (loading) {
    statusPills.push({
      key: "loading",
      text: "Searching the CanLII memory bank…",
      className: "pill pill--glow"
    });
  }

  if (error) {
    statusPills.push({
      key: "error",
      text: error,
      className: "pill pill--error"
    });
  }

  if (!loading && !error) {
    statusPills.push({
      key: hasResults ? "success" : "idle",
      text: hasResults ? `Found ${results.length} relevant cases` : "Awaiting your first query",
      className: hasResults ? "pill pill--success" : "pill pill--muted"
    });
  }

  return (
    <div className="app">
      <div className="app__orb app__orb--one" />
      <div className="app__orb app__orb--two" />

      <header className="masthead">
        <p className="masthead__eyebrow">RAG Legal Workbench · CanLII corpus</p>
        <h1>Colorful insights for Canadian precedent research</h1>
        <p>
          Fuse keyword constraints with semantic retrieval to instantly highlight persuasive
          authorities. Filter by court, vintage, and focus terms while AI generates the most relevant
          snippet for every hit.
        </p>
        <ul className="masthead__highlights">
          <li>Real-time similarity search</li>
          <li>Metadata aware filters</li>
          <li>Snippets ready for drafting</li>
        </ul>
      </header>

      <div className="content-grid">
        <section className="panel panel--form">
          <div className="panel__header">
            <p className="panel__eyebrow">Query Builder</p>
            <h2>Blend Boolean + semantic search</h2>
            <p>Use filters to narrow by year or court before the embedding model ranks candidates.</p>
          </div>
          <SearchForm onSearch={handleSearch} />
          <p className="panel__note">
            Pro tip: combine legal concepts (e.g. “duty of care auditor”) with filters for precise
            canvassing.
          </p>
        </section>

        <section className="panel panel--results">
          <div className="panel__header panel__header--results">
            <div>
              <p className="panel__eyebrow">Results Overview</p>
              <h2>Retrieval feed</h2>
              <p>Explore the ranked CanLII decisions with color-coded diagnosis.</p>
            </div>
            <div className="status-rail">
              {statusPills.map((pill) => (
                <span key={pill.key} className={pill.className}>
                  {pill.text}
                </span>
              ))}
            </div>
          </div>
          <ResultsList cases={results} />
        </section>
      </div>
    </div>
  );
}

export default App;
