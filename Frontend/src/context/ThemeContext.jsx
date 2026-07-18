import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const themes = ['default', 'light', 'dark'];

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'default';
    });

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove(...themes);
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => {
            const index = themes.indexOf(prev);
            return themes[(index + 1) % themes.length];
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);