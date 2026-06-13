/**
 * Dictionary service wrapper for the free dictionaryapi.dev endpoint.
 *
 * Responsibilities:
 *   - fetch definitions from the external API
 *   - normalize and extract the first usable definition, example, and part of speech
 *   - surface typed errors so the HTTP layer can map them cleanly to status codes
 */
import fetch from 'node-fetch';
import { BadRequestError, NotFoundError, ServiceError } from '../utils/httpErrors.js';

const DICTIONARY_API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en';

/**
 * Custom error class so route handlers can distinguish
 * "word not found" (404, user-facing) from other failures.
 */
export class WordNotFoundError extends NotFoundError {
  constructor(word) {
    super(`No definition found for "${word}"`);
    this.name = 'WordNotFoundError';
  }
}

export class DictionaryServiceError extends ServiceError {
  constructor(message, statusCode = 502) {
    super(message, statusCode);
    this.name = 'DictionaryServiceError';
  }
}

/**
 * Fetches a definition, example sentence, and part of speech for a word
 * from the free Dictionary API.
 *
 * @param {string} word
 * @returns {Promise<{ definition: string, example: string, partOfSpeech: string }>} 
 */
export async function fetchDefinition(word) {
  const normalized = word.trim().toLowerCase();

  if (!normalized) {
    throw new BadRequestError('Word cannot be empty.');
  }

  let response;
  try {
    response = await fetch(
      `${DICTIONARY_API_BASE}/${encodeURIComponent(normalized)}`
    );
  } catch (networkErr) {
    throw new DictionaryServiceError(
      'Unable to reach the dictionary service. Please try again later.',
      503
    );
  }

  if (response.status === 404) {
    throw new WordNotFoundError(normalized);
  }

  if (!response.ok) {
    throw new DictionaryServiceError(
      `Dictionary service returned an unexpected error (${response.status}).`,
    );
  }

  let data;
  try {
    data = await response.json();
  } catch (parseErr) {
    throw new DictionaryServiceError(
      'Received an invalid response from the dictionary service.',
      502
    );
  }

  return extractBestEntry(data, normalized);
}

/**
 * The dictionaryapi.dev response is an array of entries, each with multiple
 * "meanings", each with multiple "definitions". We pick the first usable
 * definition and, if available, an example sentence (possibly from a
 * different definition than the one we use, since examples are sparse).
 */
function extractBestEntry(entries, word) {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new WordNotFoundError(word);
  }

  let definition = null;
  let example = '';
  let partOfSpeech = '';

  for (const entry of entries) {
    const meanings = entry.meanings || [];
    for (const meaning of meanings) {
      const defs = meaning.definitions || [];
      for (const def of defs) {
        if (!definition && def.definition) {
          definition = def.definition;
          partOfSpeech = meaning.partOfSpeech || '';
        }
        if (!example && def.example) {
          example = def.example;
        }
        if (definition && example) break;
      }
      if (definition && example) break;
    }
    if (definition && example) break;
  }

  if (!definition) {
    throw new WordNotFoundError(word);
  }

  return { definition, example, partOfSpeech };
}
