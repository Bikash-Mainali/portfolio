export default function NotFound() {
    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
            <div className="text-center">
                <h1 className="text-8xl font-bold text-zinc-600 mb-2">404</h1>
                <p className="text-2xl font-semibold text-red-500 mb-2">Page Not Found</p>
                <p className="text-zinc-500 mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>
            </div>
        </div>
    );
}