import type { LegalCase } from "../types";
import { CaseCard } from "./CaseCard";

interface Props {
  cases: LegalCase[];
}

export function ResultsList({ cases }: Props) {
  if (!cases.length) {
    return (
      <section className="results results--empty">
        <h2>Results</h2>
        <p>Run a search to surface the most relevant CanLII decisions.</p>
      </section>
    );
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
