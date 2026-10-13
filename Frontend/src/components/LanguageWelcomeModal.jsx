import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'himalayan_connect_preferred_language';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'global', label: 'Continue in Global / Other Language' },
];

// Shown once, on the homepage, the first time someone lands on the site
// (whether they came via a shared link or a search engine result).
// Note: this only stores a language preference used by the AI assistant —
// it does not translate the rest of the site's text.
export default function LanguageWelcomeModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) setVisible(true);
  }, []);

  const choose = (code) => {
    localStorage.setItem(STORAGE_KEY, code);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-soft rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl">
        <h2 className="text-lg font-bold text-ink-soft dark:text-ink-soft mb-1">Welcome to Himalaya Connect</h2>
        <p className="text-sm text-gray-500 dark:text-ink-soft-soft mb-5">
          Choose a language for your Pahadi Mitra AI assistant.
        </p>
        <div className="flex flex-col gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => choose(l.code)}
              className="w-full py-2.5 rounded-lg border border-gray-200 dark:border-white/10 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 text-sm font-medium text-ink-soft dark:text-ink-soft transition"
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
