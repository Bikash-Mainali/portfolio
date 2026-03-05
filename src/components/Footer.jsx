export default function Footer() {
    return (
        <footer className="py-7 border-t border-stone-300 dark:border-white/5">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="font-display text-3xl font-bold text-stone-400 dark:text-white/50">
                    BM
                </div>
                <p className="font-mono text-xs text-stone-600 dark:text-slate-600 text-center">
                    © {new Date().getFullYear()} Bikash Mainali · Designed by {' '}
                    <span className="text-amber-600 dark:text-teal-400/70">Bikash Mainali</span>
                </p>
                <a
                    href="#home"
                    className="font-mono text-xs text-stone-500 dark:text-slate-500 hover:text-amber-600 dark:hover:text-teal-400 transition-colors flex items-center gap-2"
                >
                    Back to top ↑
                </a>
            </div>
        </footer>
    )
}
