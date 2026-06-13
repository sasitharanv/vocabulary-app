/**
 * Word service encapsulates business logic for vocabulary entries.
 * It coordinates model persistence, dictionary lookup, and scheduling.
 */
import Word from '../models/Word.js';
import { fetchDefinition } from './dictionaryService.js';
import { computeNextReview } from './srsService.js';
import { ConflictError, NotFoundError } from '../utils/httpErrors.js';

export async function getWordsForUser(userId) {
  return Word.find({ userId }).sort({ createdAt: -1 });
}

export async function createWordForUser(userId, normalizedWord) {
  const existing = await Word.findOne({ userId, word: normalizedWord });
  if (existing) {
    throw new ConflictError(
      `"${normalizedWord}" is already in your vocabulary list.`,
      existing
    );
  }

  const { definition, example, partOfSpeech } = await fetchDefinition(normalizedWord);

  try {
    return await Word.create({
      userId,
      word: normalizedWord,
      definition,
      example,
      partOfSpeech,
      nextReviewAt: new Date(),
    });
  } catch (err) {
    if (err?.code === 11000 || err?.codeName === 'DuplicateKey') {
      throw new ConflictError(`"${normalizedWord}" is already in your vocabulary list.`);
    }
    throw err;
  }
}

export async function deleteWordById(userId, id) {
  const deleted = await Word.findOneAndDelete({ _id: id, userId });
  if (!deleted) {
    throw new NotFoundError('Word not found.');
  }
  return deleted;
}

export async function getReviewQueueForUser(userId, now = new Date()) {
  return Word.find({ userId, nextReviewAt: { $lte: now } }).sort({ nextReviewAt: 1 });
}

export async function reviewWordForUser(userId, id, result, devMode, now = new Date()) {
  const word = await Word.findOne({ _id: id, userId });
  if (!word) {
    throw new NotFoundError('Word not found.');
  }

  const { nextReviewAt, intervalApplied, unit } = computeNextReview(result, Boolean(devMode), now);

  word.lastReviewedAt = now;
  word.nextReviewAt = nextReviewAt;
  word.reviewCount += 1;
  word.interval = intervalApplied;
  word.history.push({ result, reviewedAt: now, intervalApplied });

  await word.save();

  return { word, scheduling: { nextReviewAt, intervalApplied, unit } };
}

export async function skipAllWordsToDue(userId, now = new Date()) {
  const result = await Word.updateMany({ userId }, { $set: { nextReviewAt: now } });
  return result.modifiedCount;
}
