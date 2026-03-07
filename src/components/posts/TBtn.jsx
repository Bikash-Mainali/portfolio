export default function TBtn({onAction, title, children}) {
    return (
        <button
            onMouseDown={(e) => {
                e.preventDefault();
                onAction();
            }}
            title={title}
            className="px-2.5 py-1.5 rounded text-sm font-medium transition-colors select-none text-stone-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-navy-900 hover:text-stone-900 dark:hover:text-white border border-transparent"
        >
            {children}
        </button>
    );
}