import { useCallback, useState, useEffect } from 'react';
import { getWords, addWord, deleteWord } from '../api.js';
import WordEntryForm from './WordEntryForm.jsx';
import WordCard from './WordCard.jsx';
import './Library.css';

export default function Library({ onWordsChanged }) {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const loadWords = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getWords();
      setWords(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setLoadError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  const handleAdd = useCallback(
    async (word) => {
      const newWord = await addWord(word);
      setWords((prev) => [newWord, ...prev]);
      onWordsChanged?.();
      return newWord;
    },
    [onWordsChanged]
  );

  const handleDelete = useCallback(
    async (id) => {
      await deleteWord(id);
      setWords((prev) => prev.filter((w) => w.id !== id));
      onWordsChanged?.();
    },
    [onWordsChanged]
  );

  return (
    <section className="flex flex-col gap-10 max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-xs uppercase letter-spacing tracking-wider text-indigo-600 font-bold">📚 Vocabulary workspace</p>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Build stronger recall.</h2>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
          Add new words, review the meanings, and keep your vocabulary active with smart spaced repetition.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 border border-indigo-100/50">
        <WordEntryForm onAdd={handleAdd} />
      </div>

      <div className="flex items-center justify-between gap-4 pb-5 border-b-3 border-gradient from-indigo-300 to-purple-300">
        <div>
          <h3 className="text-3xl font-bold text-gray-900">Your library</h3>
          <p className="text-base text-gray-500 mt-1">
            {words.length === 0 ? 'No words yet—start adding to build your collection!' : 'Saved words appear here in newest-first order.'}
          </p>
        </div>
        <span className="text-lg font-mono font-bold text-indigo-600 whitespace-nowrap bg-indigo-50 px-4 py-2 rounded-full">
          {loading ? '…' : `${words.length}`}
        </span>
      </div>

      {!loading && loadError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg text-red-700 font-semibold">❌ {loadError}</div>
      )}

      {!loading && !loadError && words.length === 0 && (
        <div className="border-3 border-dashed border-indigo-300 rounded-2xl p-16 text-center bg-gradient-to-br from-indigo-50 to-purple-50 transition-all hover:border-indigo-400">
          <p className="text-2xl font-bold text-gray-900">✨ Your vocabulary is waiting.</p>
          <p className="text-gray-500 mt-3 text-lg">Add a word above and see it ready for review immediately.</p>
        </div>
      )}

      {loading && (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 list-none m-0 p-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="p-5 bg-white rounded-xl shadow-md animate-pulse h-40" />
          ))}
        </ul>
      )}

      {!loading && !loadError && words.length > 0 && (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 list-none m-0 p-0">
          {words.map((word) => (
            <WordCard key={word.id} word={word} onDelete={handleDelete} />
          ))}
        </ul>
      )}
    </section>
  );
}
