export default function DevModeToggle({ devMode, setDevMode }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer" title="Dev Mode maps review intervals from days to minutes">
      <span className="text-sm font-semibold text-gray-700">🔧 Dev Mode</span>
      <div className="relative">
        <input
          type="checkbox"
          checked={devMode}
          onChange={(e) => setDevMode(e.target.checked)}
          aria-label="Toggle developer test mode (1-day/3-day intervals become 1-minute/3-minute)"
          className="sr-only"
        />
        <div className={`w-12 h-6 rounded-full transition-colors ${devMode ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${devMode ? 'translate-x-6' : ''}`}></div>
      </div>
    </label>
  );
}
