export default function Footer() {
  return (
    <footer className="py-10 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="font-display text-3xl font-bold text-white/50">
          BM
        </div>
        <p className="font-mono text-xs text-slate-600 text-center">
          © {new Date().getFullYear()} Bikash Mainali · Designed &amp; Built by{' '}
          <span className="text-teal-400/70">Bikash Mainali</span>
        </p>
        <a
          href="#hero"
          className="font-mono text-xs text-slate-500 hover:text-teal-400 transition-colors flex items-center gap-2"
        >
          Back to top ↑
        </a>
      </div>
    </footer>
  )
}
