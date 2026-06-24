# nodejs-hw

A simple Express server for working with notes.

## Run locally

```bash
npm install
npm run dev
```

The server uses `PORT` from `.env` and falls back to port `3000`.

## Available routes

- `GET /notes` — returns all notes.
- `GET /notes/:noteId` — returns a note by its identifier.
- `GET /test-error` — simulates an internal server error.
