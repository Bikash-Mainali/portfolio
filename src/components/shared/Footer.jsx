import BrandName from "./BrandName.jsx";

export default function Footer() {
    return (
        <footer id="footer" className="flex justify-between max-w-7xl mx-auto px-6 sm:mt-28 mt-25 sm:py-8 py-5 sm:px-0 border-t border-light dark:border-dark">
            <BrandName className="text-slate"/>
            <p className="font-mono text-xs text-dark dark:text-slate text-center">
                © {new Date().getFullYear()} Bikash Mainali · Designed by {' '}
                <span className="text-accent dark:text-primary-weak">Bikash Mainali</span>
            </p>
            <a
                href="#home"
                className="font-mono text-md text-dark dark:text-slate hover:text-primary-weak transition-colors"
            >
                Back to top ↑
            </a>
        </footer>
    )
}
