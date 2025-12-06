import type { LegalCase } from "../types";
import { CaseCard } from "./CaseCard";

interface Props {
  cases: LegalCase[];
}

export function ResultsList({ cases }: Props) {
  if (!cases.length) {
    return (
      <div className="results">
        <div className="chat-message">
          <p className="results--empty__eyebrow">Welcome</p>
          <h3>Ask about a fact pattern or doctrine to get curated citations.</h3>
          <p>Use the filters drawer for court, year range, or additional keywords.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="results">
      {cases.map((c) => (
        <CaseCard key={c.id} legalCase={c} />
      ))}
    </div>
  );
}
