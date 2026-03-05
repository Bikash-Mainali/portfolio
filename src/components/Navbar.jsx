import {useState, useEffect} from 'react'
import Login from "./Login.jsx";
import {Link} from "react-router";
import ThemeToggle from "./ThemToggle.jsx";

const links = [
    {href: '#home', label: 'Home'},
    {href: '#about', label: 'About'},
    {href: '#skills', label: 'Skills'},
    {href: '#experience', label: 'Experience'},
    {href: '#portfolio', label: 'Projects'},
    {href: '#contact', label: 'Contact'},
]

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [active, setActive] = useState('')
    const [showLogin, setShowLogin] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const displayLoginModal = (showModal) => {
        setShowLogin(showModal)
    }

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    scrolled
                        ? 'bg-white/90 dark:bg-navy-950/90 backdrop-blur-md border-b border-stone-300/50 dark:border-white/5 shadow-xl shadow-black/5 dark:shadow-black/20'
                        : ''
                }`}
            >
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Logo */}
                    <a
                        href="#home"
                        className="font-display text-3xl font-bold text-stone-900 dark:text-white hover:text-amber-600 dark:hover:text-teal-400 transition-colors"
                    >
                        BM
                    </a>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8 py-3">
                        {links.map((l) => (
                            <a
                                key={l.href}
                                href={l.href}
                                onClick={() => setActive(l.href)}
                                className={`nav-link ${active === l.href ? 'text-amber-600 dark:text-teal-400' : ''} text-lg`}
                            >
                                {l.label}
                            </a>
                        ))}
                        <Link to={'/blogs'} className="nav-link text-lg">
                            Blogs
                        </Link>
                        <a
                            href="/BIKASH MAINALI-Resume-v2.pdf"
                            target="_blank"
                            className="btn-outline text-lg py-2 px-4"
                        >
                            Resume
                        </a>
                        <button
                            onClick={() => setShowLogin(true)}
                            className="bg-amber-600 hover:bg-amber-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white text-sm py-3 px-7 rounded-lg transition-colors"
                        >
                            Login
                        </button>
                        <ThemeToggle/>
                    </nav>

                    {/* Mobile Controls */}
                    <div className="md:hidden flex items-center gap-3">
                        <ThemeToggle/>
                        <button
                            className="flex flex-col gap-1.5 p-2"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Toggle menu"
                        >
                            <span
                                className={`w-6 h-0.5 bg-amber-600 dark:bg-teal-400 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}
                            ></span>
                            <span
                                className={`w-6 h-0.5 bg-amber-600 dark:bg-teal-400 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}
                            ></span>
                            <span
                                className={`w-6 h-0.5 bg-amber-600 dark:bg-teal-400 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}
                            ></span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden transition-all duration-300 overflow-hidden">
                        <nav
                            className="bg-stone-100 dark:bg-navy-800 backdrop-blur-xl border-y border-stone-300 dark:border-gray-500 px-6 py-6 flex flex-col gap-5"
                            onClick={() => setMenuOpen(false)}
                        >
                            {links.map((l) => (
                                <a
                                    key={l.href}
                                    href={l.href}
                                    onClick={() => {
                                        setMenuOpen(false);
                                        setActive(l.href);
                                    }}
                                    className={`nav-link ${active === l.href ? 'text-amber-600 dark:text-teal-400' : ''} text-lg`}
                                >
                                    {l.label}
                                </a>
                            ))}
                            <Link to={'/blogs'} className="nav-link text-lg">
                                Blogs
                            </Link>
                            <a
                                href="/BIKASH MAINALI-Resume-v2.pdf"
                                target="_blank"
                                className="btn-outline text-sm py-2 px-4 w-fit"
                            >
                                Resume
                            </a>
                            <button
                                onClick={() => {
                                    setShowLogin(true);
                                    setMenuOpen(false);
                                }}
                                className="bg-amber-600 hover:bg-amber-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white text-sm py-3 px-7 rounded-lg transition-colors w-fit"
                            >
                                Login
                            </button>
                        </nav>
                    </div>
                )}
            </header>

            {/* Login Modal */}
            {showLogin && (
                <Login displayLoginModal={displayLoginModal}/>
            )}
        </>
    )
}
