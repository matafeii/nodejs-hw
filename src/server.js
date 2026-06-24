import 'dotenv/config';

import cors from 'cors';
import express from 'express';
import pinoHttp from 'pino-http';

const app = express();

app.use(cors());
app.use(express.json());
app.use(pinoHttp());

app.get('/notes', (_req, res) => {
  res.status(200).json({
    message: 'Retrieved all notes',
  });
});

app.get('/notes/:noteId', (req, res) => {
  const { noteId } = req.params;

  res.status(200).json({
    message: `Retrieved note with ID: ${noteId}`,
  });
});

app.get('/test-error', () => {
  throw new Error('Simulated server error');
});

app.use((_req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

app.use((error, req, res, _next) => {
  req.log.error(error);

  res.status(500).json({
    message: error.message,
  });
});

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
