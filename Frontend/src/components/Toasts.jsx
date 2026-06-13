import { useEffect, useState } from 'react';
import { onToast } from '../lib/notify.js';
import './Toasts.css';

export default function Toasts() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const off = onToast((t) => {
      setToasts((s) => [...s, t]);
      setTimeout(() => {
        setToasts((s) => s.filter((x) => x.id !== t.id));
      }, t.timeout + 50);
    });

    return off;
  }, []);

  const removeToast = (id) => setToasts((s) => s.filter((x) => x.id !== id));

  if (!toasts.length) return null;

  return (
    <div className="toasts-container" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type} toast-enter`}>
          <div className="toast__message">{t.message}</div>
          <button
            className="toast__close"
            onClick={() => removeToast(t.id)}
            aria-label="Dismiss notification"
            title="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
