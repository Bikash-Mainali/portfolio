export default function NotFound() {
    return (
        <div className="min-h-screen bg-site flex items-center justify-center p-6">
            <div className="text-center">
                <h1 className="text-6xl font-display font-bold text-stone-900 dark:text-white">404</h1>
                <p className="mt-4 text-stone-600 dark:text-zinc-400">Page not found.</p>
                <div className="mt-6">
                    <a href="/" className="btn-primary">Go home</a>
                </div>
            </div>
        </div>
    )
}
