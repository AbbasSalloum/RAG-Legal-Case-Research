require("dotenv").config();
const fs = require("fs/promises");
const path = require("path");
const { OpenAI } = require("openai");

const DEFAULT_INPUT = path.join(__dirname, "data", "canlii-sample.json");
const DEFAULT_OUTPUT = path.join(__dirname, "data", "vectorStore.json");
const DEFAULT_CHUNK_WORDS = Number(process.env.CHUNK_WORDS) || 220;
const DEFAULT_CHUNK_OVERLAP = Number(process.env.CHUNK_OVERLAP) || 40;
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "text-embedding-3-small";

const args = process.argv.slice(2);

function getArg(flag, fallback) {
  const idx = args.indexOf(flag);
  if (idx === -1) return fallback;
  const val = args[idx + 1];
  return val && !val.startsWith("--") ? val : fallback;
}

function normalizeWhitespace(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

function chunkText(text, chunkWords = DEFAULT_CHUNK_WORDS, overlap = DEFAULT_CHUNK_OVERLAP) {
  const tokens = normalizeWhitespace(text).split(" ").filter(Boolean);
  if (!tokens.length) return [];
  const window = Math.max(chunkWords - overlap, 1);
  const chunks = [];
  for (let i = 0; i < tokens.length; i += window) {
    const slice = tokens.slice(i, i + chunkWords);
    if (!slice.length) continue;
    chunks.push(slice.join(" "));
    if (i + chunkWords >= tokens.length) break;
  }
  return chunks;
}

async function embedTexts(openai, texts, batchSize = 16) {
  const out = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch
    });
    for (const item of response.data) {
      out.push(item.embedding);
    }
  }
  return out;
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required. Set it in your .env and retry.");
  }

  const inputFile = getArg("--input", DEFAULT_INPUT);
  const outputFile = getArg("--output", DEFAULT_OUTPUT);

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const raw = await fs.readFile(inputFile, "utf8");
  const docs = JSON.parse(raw);
  if (!Array.isArray(docs) || docs.length === 0) {
    throw new Error(`No CanLII documents found in ${inputFile}`);
  }

  const chunks = [];
  for (const doc of docs) {
    const body = normalizeWhitespace(doc.body || doc.text || "");
    if (!body) continue;
    const docChunks = chunkText(body);
    docChunks.forEach((chunk, idx) => {
      chunks.push({
        id: `${doc.id}::${idx + 1}`,
        caseId: doc.id,
        title: doc.title,
        citation: doc.citation,
        court: doc.court,
        year: doc.year,
        url: doc.url,
        text: chunk
      });
    });
  }

  if (!chunks.length) {
    throw new Error("No chunks produced. Check that your documents contain text.");
  }

  console.log(`Embedding ${chunks.length} chunks from ${docs.length} documents...`);
  const embeddings = await embedTexts(openai, chunks.map((c) => c.text));

  const vectorStore = {
    model: EMBEDDING_MODEL,
    generatedAt: new Date().toISOString(),
    chunkWords: DEFAULT_CHUNK_WORDS,
    chunkOverlap: DEFAULT_CHUNK_OVERLAP,
    chunkCount: chunks.length,
    cases: docs.map((doc) => ({
      id: doc.id,
      title: doc.title,
      citation: doc.citation,
      court: doc.court,
      year: doc.year,
      url: doc.url
    })),
    chunks: chunks.map((chunk, idx) => ({
      ...chunk,
      embedding: embeddings[idx]
    }))
  };

  await fs.writeFile(outputFile, JSON.stringify(vectorStore, null, 2), "utf8");
  console.log(`Saved vector store to ${outputFile}`);
}

main().catch((err) => {
  console.error("Ingestion failed:", err.message);
  process.exit(1);
});
