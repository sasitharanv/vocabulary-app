import { useState, useRef } from 'react';

export default function WordEntryForm({ onAdd }) {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = value.trim();

    if (!trimmed) {
      setStatus('error');
      setMessage('Type a word first.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const newWord = await onAdd(trimmed);
      setStatus('success');
      setMessage(`Added "${newWord.word}" — due for review now.`);
      setValue('');
      inputRef.current?.focus();
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong. Try again.');
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex gap-3 flex-col sm:flex-row">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (status !== 'idle' && status !== 'loading') {
              setStatus('idle');
              setMessage('');
            }
          }}
          placeholder="e.g. ephemeral"
          aria-label="New vocabulary word"
          disabled={status === 'loading'}
          autoComplete="off"
          className="flex-1 px-5 py-3 rounded-lg border-2 border-indigo-200 text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-200 disabled:opacity-60 bg-white shadow-sm hover:border-indigo-300"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-6 py-3 sm:px-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white rounded-lg font-bold transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-md transform hover:scale-105 active:scale-95"
        >
          {status === 'loading' ? '⏳ Looking up…' : '✨ Add word'}
        </button>
      </div>

      {message && (
        <p
          className={`text-sm font-semibold px-4 py-3 rounded-lg animate-fadeIn ${
            status === 'error'
              ? 'text-red-700 bg-red-50 border-l-4 border-red-500'
              : status === 'success'
              ? 'text-green-700 bg-green-50 border-l-4 border-green-500'
              : 'text-gray-600 bg-gray-50'
          }`}
          role="status"
        >
          {status === 'error' ? '❌ ' : status === 'success' ? '✅ ' : ''}{message}
        </p>
      )}
    </form>
  );
}
