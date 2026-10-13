import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext();

// 'default' follows the operating system; 'light' and 'dark' are explicit
// user overrides that stick across reloads.
const themes = ['default', 'light', 'dark'];

/** Resolve the stored preference down to the two states the UI can paint. */
const resolve = (theme, systemPrefersDark) =>
    theme === 'dark' || (theme === 'default' && systemPrefersDark) ? 'dark' : 'light';

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'default');

    // Tracked so the 'default' setting repaints live when the OS flips at
    // sunset, instead of only on the next page load.
    const [systemPrefersDark, setSystemPrefersDark] = useState(
        () => window.matchMedia('(prefers-color-scheme: dark)').matches
    );

    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const sync = (e) => setSystemPrefersDark(e.matches);
        mq.addEventListener('change', sync);
        return () => mq.removeEventListener('change', sync);
    }, []);

    const resolved = resolve(theme, systemPrefersDark);
    const isDark = resolved === 'dark';

    useEffect(() => {
        const root = document.documentElement;

        // Keep the raw preference as a class (some styles key off 'default'),
        // and *also* apply the resolved value so Tailwind's class-based
        // `dark:` variants work even while the setting is 'default'.
        root.classList.remove(...themes);
        root.classList.add(theme);
        root.classList.toggle('dark', isDark);
        root.classList.toggle('light', !isDark);

        // Lets the browser paint native controls, scrollbars and form fields
        // in the matching scheme rather than always-light.
        root.style.colorScheme = resolved;

        // Suppress the transition during the switch-over frame would defeat
        // the point here — the cross-fade is handled in index.css instead.
        localStorage.setItem('theme', theme);
    }, [theme, isDark, resolved]);

    const toggleTheme = () => {
        setTheme((prev) => themes[(themes.indexOf(prev) + 1) % themes.length]);
    };

    const value = useMemo(
        () => ({
            theme,          // raw preference: 'default' | 'light' | 'dark'
            resolved,       // what is actually painted: 'light' | 'dark'
            // Both names are exported because the codebase reads it each way:
            // `darkMode` in the inline-styled sections, `isDark` in Navbar.
            darkMode: isDark,
            isDark,
            setTheme,
            toggleTheme,
        }),
        [theme, resolved, isDark]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
