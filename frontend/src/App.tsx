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
      <div className="chat-shell">
        <header className="chat-header">
          <div>
            <p className="chat-header__eyebrow">RAG · CanLII</p>
            <h1>Ask about Canadian precedent</h1>
            <p>Describe your issue and review the cited cases in the stream below.</p>
          </div>
          <span className="chat-header__status" data-state={loading ? "loading" : error ? "error" : "idle"}>
            {statusMessage}
          </span>
        </header>

        <main className="chat-stream">
          <ResultsList cases={results} />
        </main>

        <SearchForm onSearch={handleSearch} />
        <p className="chat-hint">Responses rely on cached CanLII decisions up to 2023.</p>
      </div>
    </div>
  );
}

export default App;
