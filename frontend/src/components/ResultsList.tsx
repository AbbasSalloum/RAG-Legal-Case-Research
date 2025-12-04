import type { LegalCase } from "../types";
import  { CaseCard } from "./CaseCard";

interface Props {
  cases: LegalCase[];
}

export function ResultsList({ cases }: Props) {
  if (!cases.length) {
    return <p>No results yet. Try a search.</p>;
  }

  return (
    <section className="results">
      <h2>Results ({cases.length})</h2>
      <div className="results-grid">
        {cases.map((c) => (
          <CaseCard key={c.id} legalCase={c} />
        ))}
      </div>
    </section>
  );
}
