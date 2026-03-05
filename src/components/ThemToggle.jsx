import {useEffect, useState} from "react";
import {THEMES} from "./constants/BlogConstants.js";

export default function ThemeToggle() {
    const [toggled, setToggled] = useState(false)
    const [theme, setTheme] = useState(() => {
        const stored = localStorage.getItem('theme')
        if (stored === THEMES.LIGHT || stored === THEMES.DARK) return stored

        // Fallback to system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.DARK : THEMES.LIGHT
    })

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === THEMES.DARK)
    }, [theme])
    const onToggle = () => {
        const newTheme = theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT
        localStorage.setItem('theme', newTheme)
        setTheme(newTheme)
        setToggled(!toggled)
    }

    return (
        <button
            onClick={onToggle}
            aria-label="Toggle theme"
            className={`
                relative w-14 h-7 rounded-full transition-all duration-300  dark:bg-zinc-700  bg-amber-100 "
            }
            `}
        >
            <span className={`
                absolute top-0.5 left-0.5 w-6 h-6 rounded-full flex items-center justify-center text-sm transition-all duration-300 shadow-md dark:translate-x-7 dark:bg-zinc-900 dark:text-amber-400 translate-x-0 bg-white text-amber-500"
            }
            `}>
                {theme === THEMES.DARK ? "🌙" : "☀️"}
            </span>
        </button>
    );
}