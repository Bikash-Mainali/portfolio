export default function ({className = ''}) {
    return (
        <div className="space-y-1">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className={`w-6 h-6 text-primary ${className}`}
            >
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
        </div>
    )
}