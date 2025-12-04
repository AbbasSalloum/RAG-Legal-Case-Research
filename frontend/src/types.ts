export interface LegalCase {
  id: string;
  title: string;
  court: string;
  year: number;
  url: string;
  snippet: string;
  score: number; // similarity score from RAG
}

export interface SearchParams {
  query: string;
  yearFrom?: number;
  yearTo?: number;
  court?: string;
  keywords?: string;
}
