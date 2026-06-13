/**
 * Request DTO validation for creating a new vocabulary word.
 * Keeps validation rules centralized and reusable.
 */
import { BadRequestError } from '../../utils/httpErrors.js';

export function parseCreateWordRequest(body) {
  if (!body || typeof body.word !== 'string' || !body.word.trim()) {
    throw new BadRequestError('A non-empty "word" field is required.');
  }

  return body.word.trim().toLowerCase();
}
