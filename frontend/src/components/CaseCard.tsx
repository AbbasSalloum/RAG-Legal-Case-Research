import type { LegalCase } from "../types";

interface Props {
  legalCase: LegalCase;
}

export function CaseCard({ legalCase }: Props) {
  return (
    <article className="case-card">
      <header>
        <h3>{legalCase.title}</h3>
        <p className="meta">
          <span>{legalCase.court}</span> · <span>{legalCase.year}</span> ·{" "}
          <span>Score: {(legalCase.score * 100).toFixed(1)}%</span>
        </p>
      </header>

      <p className="snippet">{legalCase.snippet}</p>

      <a href={legalCase.url} target="_blank" rel="noreferrer" className="btn">
        Open full case on CanLII
      </a>
    </article>
  );
}
