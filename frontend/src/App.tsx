import { useState } from "react";
import "./App.css";
import type { LegalCase, SearchParams } from "./types";
import  { SearchForm } from "./components/SearchForm";
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>RAG Legal Case Searcher</h1>
        <p>Search Canadian legal cases with AI-assisted relevance (future RAG here).</p>
      </header>

      <main>
        <SearchForm onSearch={handleSearch} />

        {loading && <p>Searching cases…</p>}
        {error && <p className="error">Error: {error}</p>}

        <ResultsList cases={results} />
      </main>
    </div>
  );
}

export default App;
