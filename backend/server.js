const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

/**
 * In the future, this will call your RAG pipeline:
 *  - Embed query
 *  - Search CanLII vector store
 *  - Return ranked cases
 */
app.post("/api/search", (req, res) => {
  const { query, yearFrom, yearTo, court, keywords } = req.body;

  console.log("Received search:", { query, yearFrom, yearTo, court, keywords });

  // Mock results for now (you'll replace this with RAG results)
  const mockResults = [
    {
      id: "2025canlii12345",
      title: "Smith v. Jones",
      court: "ONCA",
      year: 2025,
      url: "https://www.canlii.org/en/on/onca/doc/2025/2025onca123/2025onca123.html",
      snippet:
        "This case discusses negligence and duty of care in the context of professional services.",
      score: 0.93
    },
    {
      id: "2023canlii54321",
      title: "Doe v. Canada",
      court: "SCC",
      year: 2023,
      url: "https://www.canlii.org/en/ca/scc/doc/2023/2023scc45/2023scc45.html",
      snippet:
        "The Supreme Court considered the scope of Charter protections in administrative decisions.",
      score: 0.87
    }
  ];

  res.json({
    results: mockResults,
    meta: {
      query,
      count: mockResults.length
    }
  });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
