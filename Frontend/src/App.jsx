import { useState, useCallback, useEffect } from 'react';
import Library from './components/Library.jsx';
import ReviewMode from './components/ReviewMode.jsx';
import DevModeToggle from './components/DevModeToggle.jsx';
import Toasts from './components/Toasts.jsx';
import { getReviewQueue } from './api.js';
import './App.css';

export default function App() {
  const [view, setView] = useState('library'); // 'library' | 'review'
  const [devMode, setDevMode] = useState(false);
  const [dueCount, setDueCount] = useState(0);

  const refreshDueCount = useCallback(async () => {
    try {
      const queue = await getReviewQueue();
      setDueCount(queue.count);
    } catch {
      setDueCount(0);
    }
  }, []);

  useEffect(() => {
    refreshDueCount();
  }, [refreshDueCount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      <Toasts />
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 shadow-2xl sticky top-0 z-20 border-b border-indigo-400/30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-white to-blue-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-2xl shadow-lg transform hover:scale-105 transition-transform duration-200">L</div>
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow">Lexicon</h1>
              <p className="text-blue-100 text-sm">Master vocabulary with spaced repetition</p>
            </div>
          </div>

          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="bg-white/20 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg border border-white/30">
                {dueCount} due
              </span>
              <span className="text-blue-100 text-sm font-medium">{devMode ? '🔧 Dev mode' : '📚 Learning'}</span>
            </div>

            <nav className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-lg p-1 border border-white/20" role="tablist" aria-label="Main navigation">
              <button
                role="tab"
                aria-selected={view === 'library'}
                className={`px-5 py-2 rounded-md font-semibold transition-all duration-200 ${view === 'library' ? 'bg-white text-indigo-600 shadow-lg' : 'text-white hover:bg-white/20'}`}
                onClick={() => setView('library')}
              >
                📖 Library
              </button>
              <button
                role="tab"
                aria-selected={view === 'review'}
                className={`px-5 py-2 rounded-md font-semibold transition-all duration-200 relative ${view === 'review' ? 'bg-white text-indigo-600 shadow-lg' : 'text-white hover:bg-white/20'}`}
                onClick={() => setView('review')}
              >
                ✍️ Review
                {dueCount > 0 && <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg">{dueCount}</span>}
              </button>
            </nav>

            <DevModeToggle devMode={devMode} setDevMode={setDevMode} />
          </div>
        </div>
      </header>

      <main className="flex-1 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="py-12">
          {view === 'library' ? (
            <Library onWordsChanged={refreshDueCount} />
          ) : (
            <ReviewMode
              devMode={devMode}
              onQueueChanged={refreshDueCount}
              dueCount={dueCount}
            />
          )}
        </div>
      </main>

      <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200 py-6 px-4 text-center shadow-lg">
        <p className="text-sm text-gray-600">
          ✨ Powered by Free Dictionary API · Smart scheduling uses spaced repetition{devMode ? ' (dev mode: min intervals)' : ' (day intervals)'}
        </p>
      </footer>
    </div>
  );
}
 
