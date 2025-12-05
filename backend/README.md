## Backend overview

The backend exposes a single `/api/search` endpoint that performs retrieval‑augmented search over CanLII decisions. Documents are embedded with the OpenAI embeddings API and persisted into `data/vectorStore.json`. At query time the server embeds the incoming query, runs cosine similarity against the stored chunks, applies any metadata filters (year range, court, keywords), and returns the highest scoring cases.

## 1. Install dependencies

```bash
cd backend
npm install
```

## 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your OpenAI key:

```
cp .env.example .env
```

Required keys:

- `OPENAI_API_KEY` – used for both ingestion embeddings and query embeddings
- Optional tuning knobs: `EMBEDDING_MODEL`, `CHUNK_WORDS`, `CHUNK_OVERLAP`, `MAX_RESULTS`, `PORT`, `VECTOR_STORE_PATH`

## 3. Prepare CanLII documents

Place your downloaded CanLII decisions inside `data/canlii-sample.json` (or pass a custom file via `--input`). Each entry must look like:

```jsonc
[
  {
    "id": "2023canlii0001",
    "title": "Example v. Example",
    "citation": "2023 SCC 1",
    "court": "SCC",
    "year": 2023,
    "url": "https://www.canlii.org/...",
    "body": "Full text of the decision..."
  }
]
```

You can generate this JSON by using the CanLII API/CSV exports, scraping HTML and stripping markup, or by manually converting existing case summaries. The ingestion script will chunk the `body` text and keep all metadata so filters continue to work.

## 4. Build the vector store

Run the ingestion script (requires network access for OpenAI embeddings):

```bash
npm run ingest -- --input data/canlii-sample.json --output data/vectorStore.json
```

- `--input` can point to any JSON file that matches the format above.
- `--output` controls where the generated embeddings live. `server.js` reads from `VECTOR_STORE_PATH`.

If you add or update documents, rerun the script and then call `POST /api/admin/reload-vector` (or restart the server) to pick up the new vectors.

## 5. Start the API

```bash
npm run dev
```

Health check: `GET http://localhost:5000/api/health`

Reload vector store without restarting: `POST http://localhost:5000/api/admin/reload-vector`

## 6. Querying

`POST /api/search` accepts the payload produced by the frontend:

```json
{
  "query": "negligence duty of care",
  "yearFrom": 2000,
  "yearTo": 2024,
  "court": "SCC",
  "keywords": "Charter, proportionality"
}
```

The endpoint embeds the query, runs similarity search, and returns up to `MAX_RESULTS` cases with their best scoring snippet and similarity score. These results flow directly into the React UI.
