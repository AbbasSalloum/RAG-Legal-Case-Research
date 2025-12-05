require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");

const PORT = process.env.PORT || 5000;
const VECTOR_STORE_PATH =
  process.env.VECTOR_STORE_PATH || path.join(__dirname, "data", "vectorStore.json");
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "text-embedding-3-small";
const MAX_RESULTS = Number(process.env.MAX_RESULTS) || 10;

const app = express();
app.use(cors());
app.use(express.json());

let vectorStore = loadVectorStore();
let caseIndex = buildCaseIndex(vectorStore);

const openai =
  process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 0
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

if (!openai) {
  console.warn("OPENAI_API_KEY is not set. /api/search will return 503 until it is configured.");
}

function loadVectorStore() {
  try {
    const raw = fs.readFileSync(VECTOR_STORE_PATH, "utf8");
    const data = JSON.parse(raw);
    console.log(
      `Loaded vector store with ${data.chunkCount || data.chunks?.length || 0} chunks from ${VECTOR_STORE_PATH}`
    );
    return data;
  } catch (err) {
    console.warn(`Unable to read vector store at ${VECTOR_STORE_PATH}: ${err.message}`);
    return null;
  }
}

function buildCaseIndex(store) {
  if (!store?.cases?.length) return new Map();
  return new Map(store.cases.map((c) => [c.id, c]));
}

function toKeywords(value) {
  if (!value) return [];
  const source = Array.isArray(value) ? value : String(value).split(/[,|]/);
  return source
    .map((kw) => kw.trim().toLowerCase())
    .filter(Boolean);
}

function chunkMatchesFilters(chunk, filters) {
  if (filters.yearFrom && Number(chunk.year) < filters.yearFrom) return false;
  if (filters.yearTo && Number(chunk.year) > filters.yearTo) return false;
  if (filters.court && chunk.court?.toLowerCase() !== filters.court) return false;
  if (filters.keywords.length) {
    const text = chunk.text.toLowerCase();
    const keywordMiss = filters.keywords.some((kw) => !text.includes(kw));
    if (keywordMiss) return false;
  }
  return true;
}

function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    const vA = a[i];
    const vB = b[i];
    dot += vA * vB;
    normA += vA * vA;
    normB += vB * vB;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}

function snippetFrom(text, size = 420) {
  if (!text) return "";
  const trimmed = text.trim();
  if (trimmed.length <= size) return trimmed;
  return `${trimmed.slice(0, size).trim()}…`;
}

function formatFilters({ yearFrom, yearTo, court, keywords }) {
  return {
    yearFrom,
    yearTo,
    court,
    keywords
  };
}

async function embedQuery(query) {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: query
  });
  return response.data[0].embedding;
}

function rankCases(scoredChunks) {
  const bestChunkPerCase = new Map();
  for (const chunk of scoredChunks) {
    const existing = bestChunkPerCase.get(chunk.caseId);
    if (!existing || chunk.score > existing.score) {
      bestChunkPerCase.set(chunk.caseId, chunk);
    }
  }
  return Array.from(bestChunkPerCase.values()).sort((a, b) => b.score - a.score);
}

function filterAndScoreChunks(queryEmbedding, filters) {
  if (!vectorStore?.chunks?.length) return [];
  const matches = [];
  for (const chunk of vectorStore.chunks) {
    if (!chunkMatchesFilters(chunk, filters)) continue;
    const score = cosineSimilarity(queryEmbedding, chunk.embedding);
    matches.push({ ...chunk, score });
  }
  return matches.sort((a, b) => b.score - a.score);
}

function buildResult(chunk) {
  const meta = caseIndex.get(chunk.caseId) || {};
  return {
    id: meta.id || chunk.caseId,
    title: meta.title || "Untitled case",
    citation: meta.citation,
    court: meta.court,
    year: meta.year,
    url: meta.url,
    snippet: snippetFrom(chunk.text),
    score: Number(chunk.score?.toFixed(4)) || 0
  };
}

app.post("/api/search", async (req, res) => {
  const { query, yearFrom, yearTo, court, keywords } = req.body || {};
  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Query is required" });
  }
  if (!vectorStore) {
    return res
      .status(503)
      .json({ error: "Vector store is missing. Run `npm run ingest` to generate embeddings." });
  }
  if (!openai) {
    return res
      .status(503)
      .json({ error: "OPENAI_API_KEY is missing. Set it in backend/.env and restart the server." });
  }

  const filters = {
    yearFrom: yearFrom ? Number(yearFrom) : undefined,
    yearTo: yearTo ? Number(yearTo) : undefined,
    court: court ? String(court).trim().toLowerCase() : undefined,
    keywords: toKeywords(keywords)
  };

  try {
    const queryEmbedding = await embedQuery(query);
    const scoredChunks = filterAndScoreChunks(queryEmbedding, filters);
    const rankedCases = rankCases(scoredChunks).slice(0, MAX_RESULTS);
    const results = rankedCases.map(buildResult);

    return res.json({
      results,
      meta: {
        count: results.length,
        totalCandidates: scoredChunks.length,
        filters: formatFilters(filters),
        vectorStoreGeneratedAt: vectorStore.generatedAt,
        embeddingModel: vectorStore.model
      }
    });
  } catch (err) {
    console.error("Search failed:", err);
    return res.status(500).json({ error: "Search failed", details: err.message });
  }
});

app.post("/api/admin/reload-vector", (req, res) => {
  vectorStore = loadVectorStore();
  caseIndex = buildCaseIndex(vectorStore);
  const ready = Boolean(vectorStore);
  return res.json({ reloaded: ready, chunkCount: vectorStore?.chunkCount || vectorStore?.chunks?.length || 0 });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    vectorStoreLoaded: Boolean(vectorStore),
    hasOpenAIKey: Boolean(openai),
    chunkCount: vectorStore?.chunkCount || vectorStore?.chunks?.length || 0
  });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
