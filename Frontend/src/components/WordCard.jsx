import { useState, memo } from 'react';

function formatDueDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();

  if (diffMs <= 0) {
    return 'Due now';
  }

  const diffMinutes = Math.round(diffMs / 60000);
  if (diffMinutes < 60) {
    return `Due in ${diffMinutes} min`;
  }

  const diffHours = Math.round(diffMs / 3600000);
  if (diffHours < 24) {
    return `Due in ${diffHours}h`;
  }

  const diffDays = Math.round(diffMs / 86400000);
  return `Due in ${diffDays}d`;
}

function WordCard({ word, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete(word.id);
    } catch {
      setDeleting(false);
    }
  };

  const isDue = new Date(word.nextReviewAt) <= new Date();
  const isNew = word.reviewCount === 0;

  return (
    <li className={`group p-5 bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-blue-100/50 hover:border-indigo-200 ${deleting ? 'opacity-50' : 'opacity-100'} transform hover:-translate-y-1`}>
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-lg font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{word.word}</h4>
          <div className="flex items-center gap-2 mt-2 text-sm flex-wrap">
            {word.partOfSpeech && (
              <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-full text-xs font-semibold">{word.partOfSpeech}</span>
            )}
            {isNew && <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-xs uppercase font-bold">✨ new</span>}
          </div>
        </div>

        {onDelete ? (
          <button
            className="text-gray-300 hover:text-red-500 transition-colors transform hover:scale-125 duration-200"
            onClick={handleDelete}
            disabled={deleting}
            aria-label={`Remove ${word.word} from your list`}
            title="Remove word"
          >
            <span className="text-2xl leading-none">×</span>
          </button>
        ) : null}
      </div>

      <p className="mt-4 text-sm text-gray-700 leading-relaxed line-clamp-2">{word.definition}</p>

      {word.example && <p className="mt-3 text-sm text-gray-500 italic border-l-4 border-indigo-300 pl-3">"{word.example}"</p>}

      <div className="mt-4 flex items-center justify-between text-xs gap-2">
        <span className={`font-bold px-3 py-1 rounded-full ${isDue ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
          {isDue ? '🔔 Due now' : formatDueDate(word.nextReviewAt)}
        </span>
        <span className="text-gray-500 font-medium">{word.reviewCount} 📖</span>
      </div>
    </li>
  );
}

export default memo(WordCard);
