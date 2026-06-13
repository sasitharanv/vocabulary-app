import { useState, useCallback, useEffect } from "react";
import Library from "./components/Library.jsx";
import ReviewMode from "./components/ReviewMode.jsx";
import DevModeToggle from "./components/DevModeToggle.jsx";
import Toasts from "./components/Toasts.jsx";
import { getReviewQueue } from "./api.js";
import "./App.css";

export default function App() {
  const [view, setView] = useState("library"); // 'library' | 'review'
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
      <header className="bg-indigo-600 shadow-md sticky top-0 z-20 border-b border-indigo-700/30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-sm">
              L
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Lexicon</h1>
              <p className="text-indigo-100 text-sm">
                Master vocabulary with spaced repetition
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="bg-white/15 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
              {dueCount} due
            </span>
            <span className="text-indigo-100 text-sm font-medium">
              {devMode ? "🔧 Dev mode" : "📚 Learning"}
            </span>

            <nav
              className="flex items-center gap-2 bg-white/10 rounded-lg p-1"
              role="tablist"
              aria-label="Main navigation"
            >
              <button
                role="tab"
                aria-selected={view === "library"}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${view === "library" ? "bg-white text-indigo-600 shadow-sm" : "text-white hover:bg-white/10"}`}
                onClick={() => setView("library")}
              >
                Library
              </button>
              <button
                role="tab"
                aria-selected={view === "review"}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all relative ${view === "review" ? "bg-white text-indigo-600 shadow-sm" : "text-white hover:bg-white/10"}`}
                onClick={() => setView("review")}
              >
                Review
                {dueCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {dueCount}
                  </span>
                )}
              </button>
            </nav>

            <DevModeToggle devMode={devMode} setDevMode={setDevMode} />
          </div>
        </div>
      </header>

      <main className="flex-1 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="py-12">
          {view === "library" ? (
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
          ✨ Powered by Free Dictionary API · Smart scheduling uses spaced
          repetition
          {devMode ? " (dev mode: min intervals)" : " (day intervals)"}
        </p>
      </footer>
    </div>
  );
}
