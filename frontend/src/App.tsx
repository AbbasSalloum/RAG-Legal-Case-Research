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
  const statusMessage = loading
    ? "Searching cases..."
    : error
      ? error
      : hasResults
        ? `Found ${results.length} relevant cases`
        : "Ready when you are.";

  return (
    <div className="app">
      <header className="masthead">
        <div>
          <p className="masthead__eyebrow">CanLII knowledge base</p>
          <h1>Legal case research, simplified.</h1>
          <p>
            Blend natural language questions with a few filters and quickly scan the decisions that
            matter.
          </p>
        </div>
        <ul className="masthead__highlights">
          <li>Hybrid search</li>
          <li>Case metadata</li>
          <li>Concise snippets</li>
        </ul>
      </header>

      <div className="content-grid">
        <section className="panel panel--form">
          <div className="panel__header">
            <p className="panel__eyebrow">Search</p>
            <h2>Set your filters</h2>
            <p>Narrow the scope by time frame, court, or keywords before running the search.</p>
          </div>
          <SearchForm onSearch={handleSearch} />
        </section>

        <section className="panel panel--results">
          <div className="panel__header panel__header--results">
            <div>
              <p className="panel__eyebrow">Results</p>
              <h2>Case list</h2>
              <p>Browse the ranked CanLII decisions with the generated snippets.</p>
            </div>
            <div className="status-text" data-state={loading ? "loading" : error ? "error" : "idle"}>
              {statusMessage}
            </div>
          </div>
          <ResultsList cases={results} />
        </section>
      </div>
    </div>
  );
}

export default App;
