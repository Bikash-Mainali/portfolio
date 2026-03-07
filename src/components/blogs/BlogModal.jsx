import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {estimateReadTime, formatDate} from "../../util/dateUtil.js";
import {CATEGORY_COLORS_DARK, CATEGORY_COLORS_LIGHT, THEMES} from "../constants/BlogConstants.js";

export default function BlogModal({post, onClose}) {
    if (!post) return null;

    const coverImage = post.post_images?.[0]?.url;
    const categoryName = post.categories?.name;
    const tags = post.post_tags?.map(pt => pt.tags) || [];
    const isDark = localStorage.getItem("theme") === THEMES.DARK;
    const COLORS = isDark ? CATEGORY_COLORS_DARK : CATEGORY_COLORS_LIGHT;
    const categoryColor = COLORS[categoryName] || (isDark
        ? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
        : "bg-stone-100 text-stone-600 border-stone-200");

    const scrollbarStyle = isDark
        ? { scrollbarWidth: 'thin', scrollbarColor: '#757978 #0d1828' }
        : { scrollbarWidth: 'thin', scrollbarColor: '#5a5d5c #f6f2e1' };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4"
            onClick={onClose}
        >
            <div
                className="border rounded-2xl w-full sm:max-w-7xl max-h-[90vh] overflow-y-auto shadow-2xl dark:bg-zinc-900 dark:border-dark bg-white border-stone-200"
                onClick={(e) => e.stopPropagation()}
                style={scrollbarStyle}
            >
                {coverImage && (
                    <div className="h-48 sm:h-64 overflow-hidden rounded-t-2xl">
                        <img src={coverImage} alt={post.title} className="w-full h-full object-cover"/>
                    </div>
                )}

                <div className="p-5 sm:p-8">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        {categoryName && (
                            <span
                                className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border ${categoryColor}`}>
                                {categoryName}
                            </span>
                        )}
                        <button
                            onClick={onClose}
                            className={`
                                hover:scale-125 transition-all duration-300 text-3xl sm:text-4xl leading-none ml-auto
                                dark:text-zinc-400 dark:hover:text-white text-stone-400 hover:text-stone-800
                            `}
                        >
                            &times;
                        </button>
                    </div>

                    <h1
                        className={`text-xl sm:text-2xl font-bold mb-2 leading-snug dark:text-white text-stone-900`}
                        style={{fontFamily: "'Georgia', serif"}}
                    >
                        {post.title}
                    </h1>

                    <div
                        className="flex items-center gap-3 text-xs mb-6 text-stone-400 dark:text-zinc-500">
                        <span>{formatDate(post.created_at)}</span>
                        <span>·</span>
                        <span>{estimateReadTime(post.content)} min read</span>
                    </div>

                    <div
                        className="markdown-body leading-relaxed text-sm sm:text-base mb-6 text-stone-700 dark:text-zinc-300">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({node, ...props}) => <h1
                                    className={`text-xl sm:text-2xl font-bold mt-6 mb-3 dark:text-white text-stone-900`}
                                    style={{fontFamily: "'Georgia',serif"}} {...props} />,
                                h2: ({node, ...props}) => <h2
                                    className="text-lg sm:text-xl font-bold mt-5 mb-2 text-stone-900 dark:text-white"
                                    style={{fontFamily: "'Georgia',serif"}} {...props} />,
                                h3: ({node, ...props}) => <h3
                                    className="text-base sm:text-lg font-semibold mt-4 mb-2 text-stone-800 dark:text-zinc-200" {...props} />,
                                p: ({node, ...props}) => <p
                                    className="mb-4 leading-relaxed text-stone-600 dark:text-zinc-300" {...props} />,
                                a: ({node, ...props}) => <a
                                    className="underline underline-offset-2 text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300"
                                    target="_blank" rel="noopener noreferrer" {...props} />,
                                strong: ({node, ...props}) => <strong
                                    className="font-semibold text-stone-900 dark:text-white" {...props} />,
                                em: ({node, ...props}) => <em
                                    className="italic text-stone-500 dark:text-zinc-300" {...props} />,
                                code: ({node, inline, ...props}) =>
                                    inline
                                        ? <code
                                            className="px-1.5 py-0.5 rounded text-sm font-mono bg-amber-50 text-amber-700 border border-amber-200 dark:bg-zinc-800 dark:text-amber-400 dark:border-zinc-700" {...props} />
                                        : <code
                                            className="block p-4 rounded-xl text-sm font-mono overflow-x-auto mb-4 bg-stone-50 text-amber-700 border border-stone-200 dark:bg-zinc-800/80 dark:text-amber-300 dark:border-zinc-700" {...props} />,
                                pre: ({node, ...props}) => <pre className="mb-4" {...props} />,
                                ul: ({node, ...props}) => <ul
                                    className="list-disc list-inside mb-4 space-y-1 pl-2 text-stone-600 dark:text-zinc-300" {...props} />,
                                ol: ({node, ...props}) => <ol
                                    className="list-decimal list-inside mb-4 space-y-1 pl-2 text-stone-600 dark:text-zinc-300" {...props} />,
                                li: ({node, ...props}) => <li
                                    className="text-stone-600 dark:text-zinc-300" {...props} />,
                                blockquote: ({node, ...props}) => <blockquote
                                    className="border-l-4 pl-4 italic my-4 border-amber-400 text-stone-500 bg-amber-50/50 py-2 rounded-r-lg dark:border-amber-500/50 dark:text-zinc-400 dark:bg-transparent dark:py-0" {...props} />,
                                table: ({node, ...props}) => <div className="overflow-x-auto mb-4">
                                    <table className="w-full text-sm border-collapse" {...props} />
                                </div>,
                                th: ({node, ...props}) => <th
                                    className="text-left font-semibold border-b px-3 py-2 text-stone-700 border-stone-200 bg-stone-50 dark:text-zinc-300 dark:border-zinc-700 dark:bg-zinc-800/50" {...props} />,
                                td: ({node, ...props}) => <td
                                    className="border-b px-3 py-2 text-stone-500 border-stone-100 dark:text-zinc-400 dark:border-zinc-800" {...props} />,
                                hr: ({node, ...props}) => <hr
                                    className="my-6 border-stone-200 dark:border-zinc-800" {...props} />,
                                img: ({node, ...props}) => <img className="rounded-xl max-w-full my-4" {...props} />,
                            }}
                        >
                            {post.content}
                        </ReactMarkdown>
                    </div>

                    {tags.length > 0 && (
                        <div
                            className="flex flex-wrap gap-2 pt-4 border-t border-stone-100 dark:border-zinc-800">
                            {tags.map((tag) => (
                                <span key={tag.id}
                                      className="text-xs px-3 py-1 rounded-full text-stone-400 bg-stone-100 dark:text-zinc-500 dark:bg-zinc-800">
                                    #{tag.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
