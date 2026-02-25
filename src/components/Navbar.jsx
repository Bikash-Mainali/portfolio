import { useState, useEffect } from 'react'

const links = [
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#resume', label: 'Resume' },
  { href: '#portfolio', label: 'Portfolio' },
  { href: '#contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-navy-950/90 backdrop-blur-md border-b border-white/5 shadow-xl shadow-black/20' : ''}`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#hero" className="font-display  text-3xl font-bold text-white hover:text-teal-400 transition-colors">
          BM
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setActive(l.href)}
              className={`nav-link ${active === l.href ? 'text-teal-400' : ''} text-lg`}
            >
             {l.label}
            </a>
          ))}
          <a href="/BIKASH MAINALI-Resume-v2.pdf" target="_blank" className="btn-outline text-lg py-2 px-4">
            Resume
          </a>
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`w-6 h-0.5 bg-teal-400 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`w-6 h-0.5 bg-teal-400 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`w-6 h-0.5 bg-teal-400 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <nav className="bg-navy-900/95 backdrop-blur-xl border-t border-white/5 px-6 py-6 flex flex-col gap-5">
          {links.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => { setMenuOpen(false); setActive(l.href); }}
              className="nav-link text-base"
            >
              <span className="text-teal-400 mr-2">0{i + 1}.</span>{l.label}
            </a>
          ))}
          <a href="/BIKASH MAINALI-Resume-v2.pdf" target="_blank" className="btn-outline text-sm py-2 px-4 w-fit">
            Resume
          </a>
        </nav>
      </div>
    </header>
  )
}
