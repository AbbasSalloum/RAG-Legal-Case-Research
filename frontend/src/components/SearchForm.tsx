import { useState } from "react";
import type { SearchParams } from "../types";

interface Props {
  onSearch: (params: SearchParams) => void;
}

export function SearchForm({ onSearch }: Props) {
  const [query, setQuery] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [court, setCourt] = useState("");
  const [keywords, setKeywords] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const params: SearchParams = {
      query,
      yearFrom: yearFrom ? Number(yearFrom) : undefined,
      yearTo: yearTo ? Number(yearTo) : undefined,
      court: court || undefined,
      keywords: keywords || undefined
    };

    onSearch(params);
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="field">
        <label>Query</label>
        <input
          type="text"
          placeholder="e.g. negligence duty of care"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label>Year from</label>
          <input
            type="number"
            placeholder="2000"
            value={yearFrom}
            onChange={(e) => setYearFrom(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Year to</label>
          <input
            type="number"
            placeholder="2025"
            value={yearTo}
            onChange={(e) => setYearTo(e.target.value)}
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Court</label>
          <input
            type="text"
            placeholder="e.g. SCC, ONCA"
            value={court}
            onChange={(e) => setCourt(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Keywords (optional)</label>
          <input
            type="text"
            placeholder="e.g. contract, Charter"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div>
      </div>

      <button type="submit">Search</button>
    </form>
  );
}
