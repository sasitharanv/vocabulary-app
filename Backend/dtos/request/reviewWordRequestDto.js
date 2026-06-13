/**
 * Request DTO validation for recording a review outcome.
 */
import { BadRequestError } from '../../utils/httpErrors.js';

export function parseReviewWordRequest(body) {
  if (!body || (body.result !== 'right' && body.result !== 'needs_work')) {
    throw new BadRequestError('Field "result" must be either "right" or "needs_work".');
  }

  return {
    result: body.result,
    devMode: Boolean(body.devMode),
  };
}
