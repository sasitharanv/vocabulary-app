import { useSyncExternalStore } from 'react';
const WORDS_KEY = 'svb.words.v1';
const OFFSET_KEY = 'svb.timeOffsetMs.v1';
const DEV_KEY = 'svb.devMode.v1';
const listeners = new Set();
function emitChange() {
    listeners.forEach(listener => listener());
}
function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
// Cache for snapshot stability
let cachedWords = [];
let cachedOffset = null;
let cachedDevMode = null;
export function getWords() {
    if (cachedWords.length > 0) {
        try {
            const raw = localStorage.getItem(WORDS_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            if (Array.isArray(parsed)) {
                cachedWords = parsed;
            }
        }
        catch {
            cachedWords = [];
        }
    }
    else {
        try {
            const raw = localStorage.getItem(WORDS_KEY);
            cachedWords = raw ? JSON.parse(raw) : [];
        }
        catch {
            cachedWords = [];
        }
    }
    return cachedWords;
}
export function getTimeOffset() {
    if (cachedOffset !== null)
        return cachedOffset;
    try {
        cachedOffset = parseInt(localStorage.getItem(OFFSET_KEY) || '0', 10);
    }
    catch {
        cachedOffset = 0;
    }
    return cachedOffset;
}
export function getDevMode() {
    if (cachedDevMode !== null)
        return cachedDevMode;
    try {
        cachedDevMode = localStorage.getItem(DEV_KEY) === 'true';
    }
    catch {
        cachedDevMode = false;
    }
    return cachedDevMode;
}
export function now() {
    return Date.now() + getTimeOffset();
}
export function isDue(word, atMs) {
    const checkTime = atMs ?? now();
    return new Date(word.nextReviewDate).getTime() <= checkTime;
}
export function addWord(input) {
    const words = getWords();
    // Check for duplicates (case-insensitive)
    if (words.some(w => w.word.toLowerCase() === input.word.toLowerCase())) {
        throw new Error(`"${input.word}" already exists in your vocabulary.`);
    }
    const newWord = {
        id: crypto.randomUUID(),
        word: input.word,
        definition: input.definition,
        example: input.example,
        reviewCount: 0,
        nextReviewDate: new Date(now()).toISOString(),
        lastReviewedAt: null,
        createdAt: new Date(now()).toISOString(),
        updatedAt: new Date(now()).toISOString(),
    };
    words.push(newWord);
    saveWords(words);
    return newWord;
}
export function deleteWord(id) {
    const words = getWords().filter(w => w.id !== id);
    saveWords(words);
}
export function reviewWord(id, result) {
    const words = getWords();
    const word = words.find(w => w.id === id);
    if (!word)
        throw new Error('Word not found');
    const daysToAdd = result === 'correct' ? 3 : 1;
    const nextReviewMs = now() + daysToAdd * 24 * 60 * 60 * 1000;
    word.nextReviewDate = new Date(nextReviewMs).toISOString();
    word.lastReviewedAt = new Date(now()).toISOString();
    word.reviewCount += 1;
    word.updatedAt = new Date(now()).toISOString();
    saveWords(words);
    return word;
}
export function advanceTimeDays(days) {
    const currentOffset = getTimeOffset();
    const newOffset = currentOffset + days * 24 * 60 * 60 * 1000;
    localStorage.setItem(OFFSET_KEY, newOffset.toString());
    cachedOffset = null;
    emitChange();
}
export function resetTime() {
    localStorage.removeItem(OFFSET_KEY);
    cachedOffset = null;
    emitChange();
}
export function setDevMode(enabled) {
    localStorage.setItem(DEV_KEY, enabled ? 'true' : 'false');
    cachedDevMode = null;
    emitChange();
}
function saveWords(words) {
    localStorage.setItem(WORDS_KEY, JSON.stringify(words));
    cachedWords = words;
    emitChange();
}
// React hooks
export function useWords() {
    return useSyncExternalStore(subscribe, () => getWords());
}
export function useTimeOffset() {
    return useSyncExternalStore(subscribe, () => getTimeOffset());
}
export function useDevMode() {
    return useSyncExternalStore(subscribe, () => getDevMode());
}
export function useDueWords() {
    const words = useWords();
    return words.filter(w => isDue(w));
}
