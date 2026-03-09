import {useState, useEffect} from 'react'
import Login from "./Login.jsx";
import {Link, useNavigate} from "react-router";
import ThemeToggle from "./ThemToggle.jsx";
import BrandName from "./shared/BrandName.jsx";
import {Close, Hamburger} from "../icons/index.jsx";

const links = [
    {href: '#home', label: 'Home'},
    {href: '#about', label: 'About'},
    {href: '#skills', label: 'Skills'},
    {href: '#experience', label: 'Experience'},
    {href: '#projects', label: 'Projects'},
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
            // robustly set scrollTop on multiple possible scroll containers
            const setTopImmediate = () => {
                try { document.scrollingElement && (document.scrollingElement.scrollTop = 0); } catch (e) {}
                try { document.documentElement && (document.documentElement.scrollTop = 0); } catch (e) {}
                try { document.body && (document.body.scrollTop = 0); } catch (e) {}
                // also attempt to scroll <main> if that's the app scroll container
                try {
                    const main = document.querySelector('main');
                    if (main && main.scrollTop !== undefined) main.scrollTop = 0;
                } catch (e) {}
            };

            // force top immediately then attempt smooth (keeps UX consistent but guarantees top)
            try { setTopImmediate(); } catch (e) {}
            try { window.scrollTo({top: 0, behavior: 'smooth'}); } catch (e) {}

            // short fallback: re-apply immediate top after any potential layout/animation
            setTimeout(() => { try { setTopImmediate(); } catch (e) {} }, 250);
            return true;
        }
        const el = document.getElementById(id);
        if (!el) return false;
        const header = document.querySelector('header');
        const offset = header ? header.offsetHeight : 0;
        // use offsetTop for reliable document position
        const top = el.offsetTop - offset - 8; // small gap

        // If the page uses a custom scroll container (rare), try to scroll it; otherwise scroll the window.
        const scrollable = document.scrollingElement || document.documentElement || document.body;
        try {
            if (scrollable && typeof scrollable.scrollTo === 'function') {
                scrollable.scrollTo({top: Math.max(0, top), behavior: 'smooth'});
            } else {
                window.scrollTo({top: Math.max(0, top), behavior: 'smooth'});
            }
        } catch (e) {
            try { window.scrollTo(0, Math.max(0, top)); } catch (err) {}
        }

        // set focus for accessibility after a short delay
        setTimeout(() => {
            try {
                el.focus && el.focus({preventScroll: true});
            } catch (e) {
            }
        }, 300);
        return true;
    };

    const ensureNavigationThenScroll = (hash) => {
        if (!hash) return;
        const id = hash.startsWith('#') ? hash.slice(1) : hash;

        const scrollHomeNow = () => {
            // immediate top on every plausible scroll root
            const setTopImmediate = () => {
                try { document.scrollingElement && (document.scrollingElement.scrollTop = 0); } catch (e) {}
                try { document.documentElement && (document.documentElement.scrollTop = 0); } catch (e) {}
                try { document.body && (document.body.scrollTop = 0); } catch (e) {}
                try {
                    const main = document.querySelector('main');
                    if (main && main.scrollTop !== undefined) main.scrollTop = 0;
                } catch (e) {}
            };

            // Force immediate (non-smooth) scroll on all likely scroll roots first to avoid race with browser's anchor handling
            try {
                const roots = [document.scrollingElement, document.documentElement, document.body, document.querySelector('main')].filter(Boolean);
                roots.forEach(r => {
                    try {
                        if (typeof r.scrollTo === 'function') r.scrollTo({top: 0, behavior: 'auto'});
                        else r.scrollTop = 0;
                    } catch (e) {}
                });
            } catch (e) {}

            // then attempt a smooth scroll for UX
            try { window.scrollTo({top: 0, behavior: 'smooth'}); } catch (e) { try { window.scrollTo(0, 0); } catch (err) {} }

            // Retry immediate resets a couple of times in case something else moves scroll in the meantime
            [50, 200, 500].forEach((d) => setTimeout(() => { try { setTopImmediate(); } catch (e) {} }, d));

            try {
                history.replaceState(null, '', '/#home');
            } catch (e) {
            }
        };

        // If not on home, navigate first then try scrolling until element exists or timeouts
        if (window.location.pathname !== '/') {
            navigate('/');
            let attempts = 0;
            const maxAttempts = 50; // give up after ~5s
            const tryScroll = () => {
                attempts++;
                if (id === 'home') {
                    scrollHomeNow();
                    // stop if already at top
                    if ((document.scrollingElement && document.scrollingElement.scrollTop <= 2) || window.scrollY <= 2 || attempts >= maxAttempts) return;
                    setTimeout(tryScroll, 100);
                    return;
                }
                if (scrollToId(id) || attempts >= maxAttempts) return;
                setTimeout(tryScroll, 100);
            };
            // small delay for route change to mount
            setTimeout(tryScroll, 220);
        } else {
            // already on home
            if (id === 'home') {
                scrollHomeNow();
            } else {
                scrollToId(id);
            }
        }
    };

    // Updated: close mobile menu first when requested so layout settles, then perform navigation/scroll
    const handleNavClick = (href, opts = {}) => (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setActive(href);

        const doNavigation = () => {
            if (href && href.startsWith('#')) {
                ensureNavigationThenScroll(href);
            } else if (href) {
                // fallback navigation for non-hash links
                try {
                    navigate(href);
                } catch (err) {
                }
            }
        };

        if (opts.closeMenu) {
            // close menu first so header/menu height is correct when we compute offsets
            setMenuOpen(false);
            // Wait a bit for the CSS transition/layout to settle before scrolling.
            // Use requestAnimationFrame + timeout fallback for reliability across browsers.
            requestAnimationFrame(() => setTimeout(doNavigation, 200));
        } else {
            doNavigation();
        }
    };

    return (
        <div className="navbar">
            <header
                className={`fixed top-0 z-50 w-full transition-all duration-300 border-b border-light dark:border-dark ${scrolled ? "backdrop-blur-2xl bg-white/70 dark:bg-black/60 shadow-md" : "bg-transparent"}`}>
                <div
                    className="flex max-w-7xl mx-auto px-6 lg:px-8 py-3 sm:py-4  items-center justify-between">
                    {/* Logo */}
                    <a href="#home" onClick={(e) => {
                        if (e && e.preventDefault) e.preventDefault();
                        // ensure mobile menu is closed when navigating home
                        setActive("#home");
                        if (menuOpen) {
                            setMenuOpen(false);
                            // wait for the mobile menu to close and layout to settle
                            requestAnimationFrame(() => setTimeout(() => ensureNavigationThenScroll("#home"), 200));
                        } else {
                            ensureNavigationThenScroll("#home");
                        }
                    }} aria-label="Home" className="flex items-center">
                        <BrandName className="text-black dark:text-white"/> </a>
                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center flex-wrap gap-4 lg:gap-6">

                        {links.map((l) => (
                            <a
                                key={l.href}
                                href={l.href}
                                onClick={handleNavClick(l.href)}
                                className={`nav-link whitespace-nowrap text-sm lg:text-base ${
                                    active === l.href ? "text-primary" : ""
                                }`}
                            >
                                {l.label}
                            </a>
                        ))}

                        <Link
                            to="/blogs"
                            className="nav-link whitespace-nowrap text-sm lg:text-base"
                        >
                            Blogs
                        </Link>

                        <a
                            href="/BIKASH MAINALI-Resume-v2.pdf"
                            target="_blank"
                            className="btn-outline whitespace-nowrap text-sm py-2 px-3 lg:px-4"
                        >
                            Resume
                        </a>

                        <button
                            onClick={() => setShowLogin(true)
                            }
                            className="bg-primary-weak hover:bg-primary text-white py-2 px-4 rounded-lg transition-colors whitespace-nowrap"
                        >
                            Login
                        </button>

                        <ThemeToggle/>

                    </nav>

                    {/* Mobile Controls */}
                    <div className="md:hidden flex items-center gap-3"><ThemeToggle/>
                        <button className="p-2" onClick={() => setMenuOpen(!menuOpen)}
                                aria-label="Toggle menu"> {menuOpen ? <Close/> : <Hamburger/>} </button>
                    </div>
                </div>
                {/* Mobile Menu */}
                <div
                    className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${menuOpen ? "max-h-[70vh] opacity-100" : "max-h-0 opacity-0"}`}>
                    <nav
                        className="bg-white dark:bg-navy-900 px-6 py-6 flex flex-col gap-5 border-t border-light dark:border-dark">
                        {links.map((l) => (
                            <a
                                key={l.href}
                                href={l.href}
                                onClick={(e) => { handleNavClick(l.href, {closeMenu: true})(e); }}
                                className={`nav-link text-lg ${active === l.href ? "text-primary" : ""}`}
                            >
                                {l.label}
                            </a>
                        ))}
                        <Link to="/blogs" className="nav-link text-lg" onClick={() => setMenuOpen(false)}> Blogs </Link>
                        <a href="/BIKASH MAINALI-Resume-v2.pdf" target="_blank"
                           className="btn-outline text-sm py-1.5 px-3 w-fit"
                           onClick={() => setMenuOpen(false)}> Resume </a>
                        <button onClick={() => {
                            setShowLogin(true);
                            setMenuOpen(false);
                        }}
                                className="bg-primary-weak hover:bg-primary text-white py-1.5 px-5 w-fit rounded-lg transition-colors"> Login
                        </button>
                    </nav>
                </div>
            </header>
            {/* Login Modal */} {showLogin && <Login displayLoginModal={displayLoginModal}/>} </div>
    )
}