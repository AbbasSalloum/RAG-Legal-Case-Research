import type { LegalCase } from "../types";
import { CaseCard } from "./CaseCard";

interface Props {
  cases: LegalCase[];
}

export function ResultsList({ cases }: Props) {
  if (!cases.length) {
    return (
      <div className="results results--empty">
        <div className="results--empty__spark" />
        <p className="results--empty__eyebrow">Nothing to show (yet)</p>
        <h3>Run your first semantic query to unlock colorful insights.</h3>
        <p>Combine a natural language question with filters for year, court, or keywords.</p>
      </div>
    );
  }

  return (
    <div className="results">
      <div className="results-grid">
        {cases.map((c) => (
          <CaseCard key={c.id} legalCase={c} />
        ))}
      </div>
    </div>
  );
}
