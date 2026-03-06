import {useState, useEffect} from 'react'
import Login from "./Login.jsx";
import {Link, useNavigate} from "react-router";
import ThemeToggle from "./ThemToggle.jsx";
import BrandName from "./shared/BrandName.jsx";

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
    const navigate = useNavigate();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // Close mobile menu on resize to desktop
    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth >= 768) setMenuOpen(false)
        }
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    const displayLoginModal = (showModal) => {
        setShowLogin(showModal)
    }

    // Scroll helper: scroll to an element id (without leading '#') with header offset
    const scrollToId = (id) => {
        if (!id) return false;
        // special case: home -> scroll to top
        if (id === 'home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return true;
        }
        const el = document.getElementById(id);
        if (!el) return false;
        const header = document.querySelector('header');
        const offset = header ? header.offsetHeight : 0;
        // use offsetTop for reliable document position
        const top = el.offsetTop - offset - 8; // small gap
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        // set focus for accessibility after a short delay
        setTimeout(() => {
            try { el.focus && el.focus({ preventScroll: true }); } catch (e) {}
        }, 300);
        return true;
    };

    const ensureNavigationThenScroll = (hash) => {
        if (!hash) return;
        const id = hash.startsWith('#') ? hash.slice(1) : hash;

        const scrollHomeNow = () => {
            try {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (e) {
                try { window.scrollTo(0, 0); } catch (err) {}
            }
            try { history.replaceState(null, '', '/#home'); } catch (e) {}
        };

        // If not on home, navigate first then try scrolling until element exists or timeouts
        if (window.location.pathname !== '/') {
            navigate('/');
            let attempts = 0;
            const maxAttempts = 40; // give up after ~4s
            const tryScroll = () => {
                attempts++;
                if (id === 'home') {
                    scrollHomeNow();
                    // stop if already at top
                    if (window.scrollY <= 2 || attempts >= maxAttempts) return;
                    setTimeout(tryScroll, 100);
                    return;
                }
                if (scrollToId(id) || attempts >= maxAttempts) return;
                setTimeout(tryScroll, 100);
            };
            setTimeout(tryScroll, 200);
        } else {
            // already on home
            if (id === 'home') {
                scrollHomeNow();
            } else {
                scrollToId(id);
            }
        }
    };

    const handleNavClick = (href, opts = {}) => (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setActive(href);
        if (href && href.startsWith('#')) {
            ensureNavigationThenScroll(href);
        } else if (href) {
            // fallback navigation for non-hash links
            try { navigate(href); } catch (err) {}
        }
        if (opts.closeMenu) setMenuOpen(false);
    };

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    scrolled
                        ? 'bg-white/90 dark:bg-navy-950/90 backdrop-blur-md border-b border-stone-300/50 dark:border-white/5 shadow-xl shadow-black/5 dark:shadow-black/20'
                        : ''
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                    {/* Logo */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setActive('#home');
                            ensureNavigationThenScroll('#home');
                        }}
                        aria-label="Home"
                        className="bg-transparent p-0 m-0"
                    >
                        <BrandName className="text-stone-900 dark:text-white"/>
                    </button>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6 lg:gap-8 py-3">
                        {links.map((l) => (
                            <a
                                key={l.href}
                                href={l.href}
                                onClick={handleNavClick(l.href)}
                                className={`nav-link ${active === l.href ? 'text-amber-600 dark:text-teal-400' : ''} text-base lg:text-lg`}
                            >
                                {l.label}
                            </a>
                        ))}
                        <Link to={'/blogs'} className="nav-link text-base lg:text-lg">
                            Blogs
                        </Link>
                        <a
                            href="/BIKASH MAINALI-Resume-v2.pdf"
                            target="_blank"
                            className="btn-outline text-base lg:text-lg py-2 px-3 lg:px-4"
                        >
                            Resume
                        </a>
                        <button
                            onClick={() => setShowLogin(true)}
                            className="bg-amber-600 hover:bg-amber-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white text-sm py-2.5 lg:py-3 px-5 lg:px-7 rounded-lg transition-colors"
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
                <div
                    className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
                        menuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                    <nav
                        className="bg-stone-100 dark:bg-navy-800 backdrop-blur-xl border-y border-stone-300 dark:border-gray-500 px-6 py-6 flex flex-col gap-5"
                    >
                        {links.map((l) => (
                            <a
                                key={l.href}
                                href={l.href}
                                onClick={(e) => { handleNavClick(l.href, { closeMenu: true })(e); }}
                                className={`nav-link ${active === l.href ? 'text-amber-600 dark:text-teal-400' : ''} text-lg`}
                            >
                                {l.label}
                            </a>
                        ))}
                        <Link
                            to={'/blogs'}
                            className="nav-link text-lg"
                            onClick={() => setMenuOpen(false)}
                        >
                            Blogs
                        </Link>
                        <a
                            href="/BIKASH MAINALI-Resume-v2.pdf"
                            target="_blank"
                            className="btn-outline text-sm py-2 px-4 w-fit"
                            onClick={() => setMenuOpen(false)}
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
            </header>

            {/* Login Modal */}
            {showLogin && (
                <Login displayLoginModal={displayLoginModal}/>
            )}
        </>
    )
}