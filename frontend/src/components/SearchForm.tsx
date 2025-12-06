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
  const [showFilters, setShowFilters] = useState(false);

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
    <form className="composer" onSubmit={handleSubmit}>
      <div className="composer__input">
        <input
          type="text"
          aria-label="Query"
          placeholder="Ask about liability, damages, Charter rights…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
        />
        <button type="submit">Send</button>
      </div>

      <div className="composer__toolbar">
        <button
          type="button"
          className="composer__toggle"
          onClick={() => setShowFilters((prev) => !prev)}
          aria-pressed={showFilters}
          aria-expanded={showFilters}
        >
          {showFilters ? "Hide filters" : "Add filters"}
        </button>
      </div>

      {showFilters && (
        <div className="composer__filters">
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
              <label>Keywords</label>
              <input
                type="text"
                placeholder="e.g. contract, Charter"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
