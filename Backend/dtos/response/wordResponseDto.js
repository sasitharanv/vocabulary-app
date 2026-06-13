/**
 * Response DTO helpers convert Mongoose documents into clean API results.
 * This centralizes formatting and avoids leaking internal model details.
 */
export function formatWordResponse(word) {
  const doc = typeof word.toObject === 'function' ? word.toObject() : word;

  return {
    id: String(doc._id),
    userId: doc.userId,
    word: doc.word,
    definition: doc.definition,
    example: doc.example,
    partOfSpeech: doc.partOfSpeech,
    nextReviewAt: doc.nextReviewAt,
    lastReviewedAt: doc.lastReviewedAt,
    reviewCount: doc.reviewCount,
    interval: doc.interval,
    history: doc.history || [],
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function formatReviewResponse(word, scheduling) {
  return {
    word: formatWordResponse(word),
    scheduling,
  };
}

export function formatQueueResponse(words) {
  return {
    count: words.length,
    words: words.map(formatWordResponse),
  };
}
