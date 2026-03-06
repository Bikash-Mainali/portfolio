export default function SkeletonCard() {
    return (
        <div className={`
            flex gap-4 border rounded-2xl p-4 animate-pulse dark:bg-zinc-900/60 dark:border-zinc-800 bg-white border-stone-200 shadow-sm`}>
            <div
                className={`shrink-0 w-28 h-28 sm:w-36 sm:h-36 rounded-xl  dark:bg-zinc-800 bg-stone-200`}/>
            <div className="flex-1 space-y-3 py-1">
                <div className={`h-5 rounded-lg w-3/4 dark:bg-zinc-800 bg-stone-200`}/>
                <div className={`h-3 rounded w-24 dark:bg-zinc-800 bg-stone-200`}/>
                <div className={`h-4 rounded-lg w-full dark:bg-zinc-800 bg-stone-200`}/>
                <div className={`h-4 rounded-lg w-5/6 dark:bg-zinc-800 bg-stone-200`}/>
                <div className="flex gap-2 pt-1">
                    <div className={`h-5 w-16 rounded-full dark:bg-zinc-800 bg-stone-200`}/>
                    <div className={`h-5 w-12 rounded-full dark:bg-zinc-800 bg-stone-200`}/>
                </div>
            </div>
        </div>
    );
}