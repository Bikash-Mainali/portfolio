export default function NotFound() {
    return (
        <div className="min-h-screen bg-stone-50 dark:bg-navy-950 flex items-center justify-center p-6">
            <div className="text-center">
                <h1 className="text-8xl font-bold text-stone-300 dark:text-slate-700 mb-2">404</h1>
                <p className="text-2xl font-semibold text-amber-600 dark:text-teal-400 mb-2">Page Not Found</p>
                <p className="text-stone-600 dark:text-slate-400 mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>
            </div>
        </div>
    );
}
