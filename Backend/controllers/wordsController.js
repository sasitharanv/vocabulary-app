/**
 * Controller layer for vocabulary routes.
 *
 * It receives validated HTTP requests, delegates to the service layer for
 * business operations, and returns clean response DTOs.
 */
import {
  getWordsForUser,
  createWordForUser,
  deleteWordById,
  getReviewQueueForUser,
  reviewWordForUser,
  skipAllWordsToDue,
} from '../services/wordService.js';
import { parseCreateWordRequest } from '../dtos/request/createWordRequestDto.js';
import { parseReviewWordRequest } from '../dtos/request/reviewWordRequestDto.js';
import {
  formatWordResponse,
  formatReviewResponse,
  formatQueueResponse,
} from '../dtos/response/wordResponseDto.js';
import { successResponse } from '../utils/apiResponse.js';

const USER_ID = 'test-user';

export async function getAllWords(req, res, next) {
  try {
    const words = await getWordsForUser(USER_ID);
    res.json(successResponse(words.map(formatWordResponse)));
  } catch (err) {
    next(err);
  }
}

export async function createWord(req, res, next) {
  try {
    const normalizedWord = parseCreateWordRequest(req.body);
    const createdWord = await createWordForUser(USER_ID, normalizedWord);
    res.status(201).json(successResponse(formatWordResponse(createdWord)));
  } catch (err) {
    next(err);
  }
}

export async function deleteWord(req, res, next) {
  try {
    await deleteWordById(USER_ID, req.params.id);
    res.json(successResponse({ success: true }));
  } catch (err) {
    next(err);
  }
}

export async function getReviewQueue(req, res, next) {
  try {
    const words = await getReviewQueueForUser(USER_ID);
    res.json(successResponse(formatQueueResponse(words)));
  } catch (err) {
    next(err);
  }
}

export async function reviewWord(req, res, next) {
  try {
    const { result, devMode } = parseReviewWordRequest(req.body);
    const { word, scheduling } = await reviewWordForUser(
      USER_ID,
      req.params.id,
      result,
      devMode
    );

    res.json(successResponse(formatReviewResponse(word, scheduling)));
  } catch (err) {
    next(err);
  }
}

export async function skipToDue(req, res, next) {
  try {
    const modifiedCount = await skipAllWordsToDue(USER_ID);
    res.json(successResponse({ modifiedCount }));
  } catch (err) {
    next(err);
  }
}
