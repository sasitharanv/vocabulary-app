/**
 * Spaced Repetition Scheduling Service
 * ------------------------------------
 * Centralizes the logic for when a word should next be reviewed.
 *
 * Dev Mode design decision:
 * The base spec is "1 day" for Needs Work and "3 days" for Got It Right.
 * For testing, we map days -> minutes when devMode is true:
 *   - Needs Work: 1 day  -> 1 minute
 *   - Got It Right: 3 days -> 3 minutes
 *
 * This keeps the SAME scheduling code path for both modes (just a different
 * unit multiplier), so we're testing the real engine rather than a separate
 * mock. The reviewer can toggle "Dev Mode" in the UI, answer a word, wait
 * ~60-180 seconds (or just refresh after a minute), and see it become due
 * again - exercising the full lifecycle in well under 5 minutes.
 */

const REAL_INTERVALS = {
  needs_work: 1, // days
  right: 3, // days
};

const DEV_INTERVALS = {
  needs_work: 1, // minutes
  right: 3, // minutes
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_MINUTE = 60 * 1000;

/**
 * Computes the next review date for a word given the user's response.
 *
 * @param {'right' | 'needs_work'} result
 * @param {boolean} devMode - if true, intervals are interpreted as minutes instead of days
 * @param {Date} [from] - reference time, defaults to now
 * @returns {{ nextReviewAt: Date, intervalApplied: number, unit: 'days' | 'minutes' }}
 */
export function computeNextReview(result, devMode = false, from = new Date()) {
  if (result !== 'right' && result !== 'needs_work') {
    throw new Error(`Invalid review result: ${result}`);
  }

  const intervals = devMode ? DEV_INTERVALS : REAL_INTERVALS;
  const msPerUnit = devMode ? MS_PER_MINUTE : MS_PER_DAY;
  const amount = intervals[result];

  const nextReviewAt = new Date(from.getTime() + amount * msPerUnit);

  return {
    nextReviewAt,
    intervalApplied: amount,
    unit: devMode ? 'minutes' : 'days',
  };
}
