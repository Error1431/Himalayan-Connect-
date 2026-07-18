import { useTheme } from '../../context/ThemeContext';

export default function SettingsThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="flex items-center justify-between bg-surface-alt rounded-2xl p-4">
            <div>
                <p className="font-semibold text-ink-soft">Dark Mode</p>
                <p className="text-sm text-ink-soft-soft">Switch between light and dark appearance</p>
            </div>
            <button
                onClick={toggleTheme}
                aria-pressed={isDark}
                aria-label="Toggle dark mode"
                className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${isDark ? 'bg-green-600' : 'bg-surface-alt'}`}
            >
                <span
                    className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-surface shadow-md transition-transform duration-300 ${isDark ? 'translate-x-6' : 'translate-x-0'
                        }`}
                />
            </button>
        </div>
    );
}