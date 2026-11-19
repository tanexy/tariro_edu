# Tariro — AI learning-space generator

Tariro turns a folder of documents into an interactive learning space: an overview, study guide, flashcards, quizzes, a mind map, a study plan, an exam-focus report, and a tutor that answers questions from your own documents.

**Status:** working prototype (single user, no login).

---

## What it does

1. **Upload a folder** of PDFs, Office files or text. The server extracts the text and keeps the folder structure.
2. **Generate learning resources** with Gemini using structured output (JSON schemas):
   - overview and study guide
   - flashcards (easy / medium / hard)
   - quizzes (multiple-choice, short-answer, scenario)
   - mind map (root → topic → concept → detail)
   - study plan
3. **Exam intelligence:** if past papers are included, analyse them for high-priority topics and likely questions.
4. **AI tutor:** ask questions about your material. Answers are grounded in snippets from your uploaded documents, with the source documents cited, and the model is instructed to say so when the sources don't contain the answer (low temperature, 0.2).
5. **Dashboard:** learning spaces, recent activity, and a tier and storage-limit model (Free / Pro / Enterprise) in the data layer.

## Architecture

```
React 19 + Vite + Tailwind 4
 src/features/  dashboard · learning-spaces · flashcards · assessments
                exam-intel · tutor · upload · billing
        │  REST (/api/*)
        ▼
Express + TypeScript (server.ts)
 ├─ document parsing (officeparser)
 ├─ Gemini calls with responseSchema (structured JSON)
 ├─ retry wrapper for rate limits (429 / quota)
 └─ JSON-file persistence (db.json via src/lib/db.ts)
```

## Run it locally

Requires Node.js 20+ and a Gemini API key.

```bash
npm install
cp .env.example .env.local     # set GEMINI_API_KEY
npm run dev                    # starts the Express + Vite dev server
```

Build for production:

```bash
npm run build
npm start
```

Type-check: `npm run lint`.

## Design decisions

- **Structured output, not free text.** Generation calls use `responseMimeType: "application/json"` with a `responseSchema`, so the UI receives a predictable shape.
- **Rate-limit resilience.** `generateContentWithRetry` retries on 429 / quota errors. It reads the wait time from the error message when present and otherwise backs off exponentially.
- **Grounded tutor.** The tutor receives matched source snippets and must cite them, rather than answering from the model's general knowledge.
- **Simple persistence.** A JSON file keeps the prototype dependency-free and easy to inspect.

## Known limitations and roadmap

<!-- EDIT: delete each line as you fix it -->

- [ ] **No authentication.** A single hard-coded user. Next: real accounts and per-user data isolation.
- [ ] **JSON-file database.** Not safe for concurrent writes. Next: SQLite or Postgres.
- [ ] **Blocking retries.** Rate-limit waits happen inside the request. Next: a background job queue with progress updates.
- [ ] **No automated tests.** Next: tests for document parsing and the generation pipeline with the model mocked.
- [ ] **Output is not independently validated.** Next: validate generated JSON on the server and measure answer accuracy against a labelled set.
- [ ] **Billing and tiers are a data model only.** There is no payment integration.



<!-- EDIT: e.g. MIT -->
