import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    const icons = {
        default: '✨',
        light: '☀️',
        dark: '🌙'
    };

    return (
        <button
            onClick={toggleTheme}
            className="ml-3 rounded-full p-2 bg-surface border border-outline text-ink hover:scale-105 transition-all duration-200"
            aria-label="Toggle theme"
        >
            {icons[theme]}
        </button>
    );
}