export default function Error () {
    return (
        <div className="min-h-screen bg-site flex items-center justify-center p-6">
            <div className="text-center">
                <h1 className="text-8xl font-bold text-stone-300 dark:text-slate-700 mb-2">500</h1>
                <p className="text-2xl font-semibold text-amber-600 dark:text-teal-400 mb-2">Internal Server Error</p>
                <p className="text-stone-600 dark:text-slate-400 mb-8">
                    Something went wrong on our end. Please try again later.
                </p>
            </div>
        </div>
    );
}