/**
 * Express application bootstrap for the Lexicon backend.
 *
 * Responsibilities:
 *   - configure middleware
 *   - connect to MongoDB
 *   - mount API routes
 *   - expose health and centralized error handling
 */
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import wordsRouter from './routes/words.js';
import { info, error as logError } from './utils/logger.js';
import { failureResponse } from './utils/apiResponse.js';
import { formatWordResponse } from './dtos/response/wordResponseDto.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/vocab-builder';

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  info(`Incoming request: ${req.method} ${req.originalUrl}`);
  res.on('finish', () => {
    info(`Completed request: ${req.method} ${req.originalUrl} ${res.statusCode} in ${Date.now() - start}ms`);
  });
  next();
});

app.use('/api/words', wordsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', dbState: mongoose.connection.readyState });
});

app.use((req, res) => {
  logError(`Not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json(failureResponse('Not found'));
});

// Centralized error handler - catches anything passed via next(err)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const details = err.existing ? { existing: formatWordResponse(err.existing) } : err.details;

  logError(`Error on ${req.method} ${req.originalUrl}: ${err.message}`, {
    statusCode,
    stack: err.stack,
  });

  res.status(statusCode).json(failureResponse(err.message || 'Internal server error', details));
});

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}

start();
