import BrandName from "./BrandName.jsx";

export default function Footer() {
    return (
        <footer id="footer"
                className="max-w-7xl mx-auto px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32 lg:pt-40 pb-8 flex flex-col md:flex-row items-center md:items-center justify-between gap-6 md:gap-4 text-center md:text-left">
            {/* Brand */}
            <div className="flex justify-center md:justify-start w-full md:w-auto"><BrandName
                className="text-slate dark:text-slate-400"/>
            </div>
            {/* Copyright */}
            <p
                className="font-mono text-xs text-dark dark:text-slate"> © {new Date().getFullYear()} Bikash Mainali ·
                Designed by{" "}
                <span className="text-accent dark:text-primary-weak"> Bikash Mainali </span>
            </p>
            {/* Back to top */}
            <a href="#home"
               className="font-mono text-sm md:text-base text-slate dark:text-slate hover:text-primary-weak transition-colors"> Back
                to top ↑
            </a>
        </footer>
    )
}
