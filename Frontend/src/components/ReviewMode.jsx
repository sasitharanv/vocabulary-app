import { useState, useCallback, useEffect } from 'react';
import { getReviewQueue, submitReview, devSkipToDue } from '../api.js';

export default function ReviewMode({ devMode, onQueueChanged, dueCount }) {
  const [revealed, setRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastOutcome, setLastOutcome] = useState(null);
  const [queueData, setQueueData] = useState({ words: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const queue = queueData.words || [];
  const totalDue = queueData.count || 0;
  
  const loadQueue = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getReviewQueue();
      setQueueData(data || { words: [], count: 0 });
      return data;
    } catch (err) {
      setLoadError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    // run once on mount
    (async () => {
      try {
        const data = await loadQueue();
        if (!mounted) return;
      } catch (e) {
        // handled in loadQueue
      }
    })();
    return () => {
      mounted = false;
    };
  }, [loadQueue]);
  const currentWord = queue[0];

  const handleReveal = () => setRevealed(true);

  const handleAnswer = useCallback(
    async (result) => {
      if (!currentWord || submitting) return;
      setSubmitting(true);

      try {
        const res = await submitReview(currentWord.id, result, devMode);
        setLastOutcome({ result, ...res.scheduling });
        setQueueData((prev) => ({
          ...prev,
          words: prev.words.slice(1),
          count: Math.max(0, prev.count - 1),
        }));
        setRevealed(false);
        onQueueChanged?.();
      } catch (err) {
        // Preserve loadError if fetch failed; the hook will already set it.
      } finally {
        setSubmitting(false);
      }
    },
    [currentWord, devMode, onQueueChanged, setQueueData, submitting]
  );

  const handleSkipToDue = useCallback(
    async () => {
      setSubmitting(true);
      try {
        await devSkipToDue();
        await loadQueue();
        onQueueChanged?.();
      } finally {
        setSubmitting(false);
      }
    },
    [loadQueue, onQueueChanged]
  );

  if (loadError) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg text-red-700 text-center font-semibold max-w-2xl mx-auto">
        ❌ {loadError?.message || String(loadError)}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        <p className="text-lg text-gray-600">Loading review queue…</p>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="text-center py-16 flex flex-col items-center gap-6 max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 text-green-600 rounded-full flex items-center justify-center text-6xl shadow-lg">✓</div>
        <h2 className="text-4xl font-bold text-gray-900">All caught up!</h2>
        <p className="text-gray-600 text-lg">
          {dueCount === 0
            ? '🎉 Nothing is due right now. Add more words to keep the queue full.'
            : "🎊 You've cleared the current review queue."}
        </p>
        {lastOutcome && (
          <p className="text-sm font-mono text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
            Last review scheduled for {lastOutcome.intervalApplied} {lastOutcome.unit} from now.
          </p>
        )}
        {devMode && (
          <button className="mt-4 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:shadow-lg transition-all font-semibold" onClick={handleSkipToDue} disabled={submitting}>
            🔧 Make everything due now
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-mono text-indigo-600 font-bold">
            {totalDue - queue.length + 1} / {totalDue} 📖
          </span>
          <p className="text-base text-gray-600 mt-2">Reveal the definition and test your recall.</p>
        </div>
        {devMode && (
          <button className="text-xs uppercase px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:shadow-lg transition-all font-bold whitespace-nowrap" onClick={handleSkipToDue} disabled={submitting}>
            🔄 Refresh Queue
          </button>
        )}
      </div>

      <div className="w-full">
        <div className="relative w-full h-72 sm:h-96 transition-all duration-500 perspective">
          {!revealed ? (
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-2xl border-4 border-white/20 transform hover:scale-105 transition-transform">
              <span className="text-xs uppercase tracking-wider text-white/80 font-bold mb-6">What does this mean?</span>
              <h2 className="text-6xl md:text-7xl font-black text-white mb-4 drop-shadow-lg">{currentWord.word}</h2>
              {currentWord.partOfSpeech && (
                <span className="text-sm bg-white/20 text-white px-4 py-2 rounded-full mb-8 font-semibold backdrop-blur">/{currentWord.partOfSpeech}/</span>
              )}
              <button className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:shadow-2xl transition-all transform hover:scale-110 active:scale-95 text-lg flex items-center gap-3 justify-center" onClick={handleReveal} disabled={revealed || submitting}>
                {revealed ? '✓ Revealed' : '👁️ Reveal'}
                {submitting && <span className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />}
              </button>
            </div>
          ) : (
            <div className="absolute inset-0 bg-white rounded-2xl p-10 flex flex-col gap-6 shadow-2xl border-4 border-indigo-200/50 overflow-auto">
              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-wider text-indigo-600 font-bold">Meaning</span>
                {currentWord.partOfSpeech && (
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-semibold">/{currentWord.partOfSpeech}/</span>
                )}
              </div>
              <p className="text-xl text-gray-800 leading-relaxed font-medium">{currentWord.definition}</p>
              {currentWord.example && (
                <div className="border-l-4 border-indigo-400 bg-indigo-50 p-5 rounded-lg mt-2">
                  <p className="text-base text-gray-700 italic">"{currentWord.example}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          className="px-6 py-5 bg-gradient-to-br from-orange-100 to-red-100 border-3 border-red-300 text-red-700 rounded-xl font-bold hover:shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-center"
          onClick={() => handleAnswer('needs_work')}
          disabled={!revealed || submitting}
        >
          <div className="text-2xl mb-2">⏳</div>
          <div>Needs work</div>
          <div className="text-xs mt-1 opacity-70">again in {devMode ? '1 min' : '1 day'}</div>
        </button>
        <button
          className="px-6 py-5 bg-gradient-to-br from-green-100 to-emerald-100 border-3 border-green-300 text-green-700 rounded-xl font-bold hover:shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-center"
          onClick={() => handleAnswer('right')}
          disabled={!revealed || submitting}
        >
          <div className="text-2xl mb-2">✓</div>
          <div>Got it right</div>
          <div className="text-xs mt-1 opacity-70">again in {devMode ? '3 min' : '3 days'}</div>
        </button>
      </div>

      {!revealed && (
        <p className="text-center text-base text-gray-600 bg-blue-50 px-6 py-4 rounded-lg border-l-4 border-blue-400 font-medium">💡 Reveal the definition before answering to strengthen your recall.</p>
      )}
    </div>
  );
}
