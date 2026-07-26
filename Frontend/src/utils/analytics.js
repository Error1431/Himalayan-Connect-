import api from './api';

// A lightweight, anonymous per-browser id (not a cookie, not tied to any
// personal info) used only to estimate unique visitors — persisted in
// localStorage so repeat visits from the same browser count as one visitor.
function getSessionId() {
  const KEY = 'hc_session_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}

/**
 * Fire-and-forget page view tracker. Called once per route change (see
 * App.js). Never throws and never blocks the UI — analytics failing
 * silently is always better than analytics breaking the app.
 */
export function trackPageView(path) {
  try {
    api.post('/analytics/track', {
      path,
      sessionId: getSessionId(),
      referrer: document.referrer || '',
    }).catch(() => {});
  } catch (e) {
    // no-op
  }
}
