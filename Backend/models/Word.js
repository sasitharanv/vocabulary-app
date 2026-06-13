/**
 * Word model for the Lexicon SRS API.
 * Captures the vocabulary entry, dictionary metadata, and review tracking
 * state for a single hardcoded user.
 *
 * The compound unique index on { userId, word } prevents duplicate entries
 * per user and keeps the insert workflow aligned with route-level de-dup checks.
 */
import mongoose from 'mongoose';

const wordSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      default: 'test-user',
      index: true,
    },
    word: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    definition: {
      type: String,
      required: true,
    },
    example: {
      type: String,
      default: '',
    },
    partOfSpeech: {
      type: String,
      default: '',
    },
    // Spaced repetition fields
    interval: {
      // current interval in days (real mode) - kept for reference
      type: Number,
      default: 1,
    },
    nextReviewAt: {
      type: Date,
      required: true,
      default: () => new Date(), // due immediately when created
      index: true,
    },
    lastReviewedAt: {
      type: Date,
      default: null,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    // History of outcomes, useful for debugging / future analytics
    history: {
      type: [
        {
          result: { type: String, enum: ['right', 'needs_work'], required: true },
          reviewedAt: { type: Date, default: () => new Date(), required: true },
          intervalApplied: { type: Number, required: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

// Prevent duplicate words per user
wordSchema.index({ userId: 1, word: 1 }, { unique: true });

export default mongoose.model('Word', wordSchema);
