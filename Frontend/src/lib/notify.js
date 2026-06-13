export function toast(detail) {
  try {
    const payload = {
      id: Date.now() + Math.random(),
      type: detail.type || 'info',
      message: detail.message || '',
      timeout: typeof detail.timeout === 'number' ? detail.timeout : 4000,
    };
    window.dispatchEvent(new CustomEvent('app-toast', { detail: payload }));
  } catch (err) {
    // best-effort; do not throw from notify
    // console.warn('toast failed', err);
  }
}

export function onToast(listener) {
  const handler = (e) => listener(e.detail);
  window.addEventListener('app-toast', handler);
  return () => window.removeEventListener('app-toast', handler);
}
