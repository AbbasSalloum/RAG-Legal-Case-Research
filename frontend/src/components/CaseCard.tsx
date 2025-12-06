import type { LegalCase } from "../types";

interface Props {
  legalCase: LegalCase;
}

export function CaseCard({ legalCase }: Props) {
  return (
    <article className="case-card chat-message chat-message--assistant">
      <header>
        <p className="case-card__eyebrow">{legalCase.citation || legalCase.id}</p>
        <h3>{legalCase.title}</h3>
        <div className="meta">
          <span className="badge badge--court">{legalCase.court}</span>
          <span className="badge badge--year">{legalCase.year}</span>
          <span className="badge badge--score">
            {(legalCase.score * 100).toFixed(1)}% match
          </span>
        </div>
      </header>

      <p className="snippet">{legalCase.snippet}</p>

      <a href={legalCase.url} target="_blank" rel="noreferrer" className="btn btn--accent">
        Open full case on CanLII
      </a>
    </article>
  );
}
