import {useState, useEffect} from "react";
import {supabase} from "../util/supabaseClient.js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {Link} from "react-router";

// Strip markdown for plain text excerpts
function stripMarkdown(text = "") {
    return text
        .replace(/#{1,6}\s+/g, "")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/`{1,3}[^`]*`{1,3}/g, "")
        .replace(/!\[.*?\]\(.*?\)/g, "")
        .replace(/\[(.+?)\]\(.*?\)/g, "$1")
        .replace(/[-*_]{3,}/g, "")
        .replace(/>\ +/g, "")
        .replace(/\n+/g, " ")
        .trim();
}

const CATEGORY_COLORS_DARK = {
    Technology: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Travel: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Lifestyle: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    Food: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    Music: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    Fashion: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    Health: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    Sports: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Education: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    Finance: "bg-green-500/10 text-green-400 border-green-500/20",
};

const CATEGORY_COLORS_LIGHT = {
    Technology: "bg-blue-100 text-blue-700 border-blue-200",
    Travel: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Lifestyle: "bg-purple-100 text-purple-700 border-purple-200",
    Food: "bg-orange-100 text-orange-700 border-orange-200",
    Music: "bg-pink-100 text-pink-700 border-pink-200",
    Fashion: "bg-rose-100 text-rose-700 border-rose-200",
    Health: "bg-teal-100 text-teal-700 border-teal-200",
    Sports: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Education: "bg-indigo-100 text-indigo-700 border-indigo-200",
    Finance: "bg-green-100 text-green-700 border-green-200",
};

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function estimateReadTime(content) {
    if (!content) return 1;
    return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
}

// ─── Theme Toggle Button ───────────────────────────────────────────────────────
function ThemeToggle({isDark, onToggle}) {
    return (
        <button
            onClick={onToggle}
            aria-label="Toggle theme"
            className={`
                relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
                ${isDark
                ? "bg-zinc-700 focus:ring-offset-zinc-950"
                : "bg-amber-200 focus:ring-offset-amber-50"
            }
            `}
        >
            <span className={`
                absolute top-0.5 left-0.5 w-6 h-6 rounded-full flex items-center justify-center text-sm transition-all duration-300 shadow-md
                ${isDark
                ? "translate-x-7 bg-zinc-900 text-amber-400"
                : "translate-x-0 bg-white text-amber-500"
            }
            `}>
                {isDark ? "🌙" : "☀️"}
            </span>
        </button>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard({isDark}) {
    return (
        <div className={`
            flex gap-4 border rounded-2xl p-4 animate-pulse
            ${isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-stone-200 shadow-sm"}
        `}>
            <div
                className={`shrink-0 w-28 h-28 sm:w-36 sm:h-36 rounded-xl ${isDark ? "bg-zinc-800" : "bg-stone-200"}`}/>
            <div className="flex-1 space-y-3 py-1">
                <div className={`h-5 rounded-lg w-3/4 ${isDark ? "bg-zinc-800" : "bg-stone-200"}`}/>
                <div className={`h-3 rounded w-24 ${isDark ? "bg-zinc-800" : "bg-stone-200"}`}/>
                <div className={`h-4 rounded-lg w-full ${isDark ? "bg-zinc-800" : "bg-stone-200"}`}/>
                <div className={`h-4 rounded-lg w-5/6 ${isDark ? "bg-zinc-800" : "bg-stone-200"}`}/>
                <div className="flex gap-2 pt-1">
                    <div className={`h-5 w-16 rounded-full ${isDark ? "bg-zinc-800" : "bg-stone-200"}`}/>
                    <div className={`h-5 w-12 rounded-full ${isDark ? "bg-zinc-800" : "bg-stone-200"}`}/>
                </div>
            </div>
        </div>
    );
}

// ─── Blog Card ────────────────────────────────────────────────────────────────
function BlogCard({post, onClick, isDark}) {
    const coverImage = post.post_images?.[0]?.url;
    const categoryName = post.categories?.name;
    const tags = post.post_tags?.map(pt => pt.tags) || [];
    const COLORS = isDark ? CATEGORY_COLORS_DARK : CATEGORY_COLORS_LIGHT;
    const categoryColor = COLORS[categoryName] || (isDark
        ? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
        : "bg-stone-100 text-stone-600 border-stone-200");

    return (
        <div
            onClick={() => onClick(post)}
            className={`
                group flex gap-4 sm:gap-6 lg:gap-10 border rounded-2xl overflow-hidden
                transition-all duration-300 cursor-pointer p-3 sm:p-4
                ${isDark
                ? "bg-zinc-900/60 border-gray-600 hover:border-zinc-600 hover:shadow-xl hover:shadow-black/20"
                : "bg-white border-stone-200 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100/50"
            }
            `}
        >
            {/* Thumbnail */}
            <div className={`
                shrink-0 rounded-xl overflow-hidden
                w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-64 lg:h-64
                ${isDark ? "bg-zinc-800" : "bg-stone-100"}
            `}>
                {coverImage ? (
                    <img
                        src={coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div
                        className={`w-full h-full flex items-center justify-center text-3xl ${isDark ? "text-zinc-700" : "text-stone-300"}`}>
                        📄
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 min-w-0">
                {/* Title */}
                <h2
                    className={`
                        font-bold text-base sm:text-lg leading-snug mb-1.5 transition-colors line-clamp-2
                        ${isDark ? "text-amber-400 group-hover:text-amber-300" : "text-amber-700 group-hover:text-amber-600"}
                    `}
                    style={{fontFamily: "'Georgia', serif"}}
                >
                    {post.title}
                </h2>

                {/* Date */}
                <div
                    className={`flex items-center gap-1.5 text-xs mb-2 ${isDark ? "text-zinc-500" : "text-stone-400"}`}>
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>{formatDate(post.created_at)}</span>
                    <span className={isDark ? "text-zinc-700" : "text-stone-300"}>·</span>
                    <span>{estimateReadTime(post.content)} min read</span>
                </div>

                {/* Excerpt */}
                <p className={`text-sm leading-relaxed line-clamp-2 mb-3 flex-1 ${isDark ? "text-zinc-400" : "text-stone-500"}`}>
                    {stripMarkdown(post.content)}
                </p>

                {/* Footer: category + tags */}
                <div className="flex flex-wrap items-center gap-1.5">
                    {categoryName && (
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${categoryColor}`}>
                            {categoryName}
                        </span>
                    )}
                    {tags.slice(0, 3).map((tag) => (
                        <span key={tag.id}
                              className={`text-xs px-2 py-0.5 rounded-full ${isDark ? "text-zinc-600 bg-zinc-800" : "text-stone-400 bg-stone-100"}`}>
                            #{tag.name}
                        </span>
                    ))}
                    {tags.length > 3 && (
                        <span
                            className={`text-xs ${isDark ? "text-zinc-700" : "text-stone-400"}`}>+{tags.length - 3} more</span>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Blog Modal ───────────────────────────────────────────────────────────────
function BlogModal({post, onClose, isDark}) {
    if (!post) return null;

    const coverImage = post.post_images?.[0]?.url;
    const categoryName = post.categories?.name;
    const tags = post.post_tags?.map(pt => pt.tags) || [];
    const COLORS = isDark ? CATEGORY_COLORS_DARK : CATEGORY_COLORS_LIGHT;
    const categoryColor = COLORS[categoryName] || (isDark
        ? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
        : "bg-stone-100 text-stone-600 border-stone-200");

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4"
            onClick={onClose}
        >
            <div
                className={`
                    border rounded-2xl w-full sm:max-w-7xl max-h-[92vh] overflow-y-auto shadow-2xl
                    [&::-webkit-scrollbar]:w-1
                    [&::-webkit-scrollbar-track]:rounded-full
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    ${isDark
                    ? "bg-zinc-900 border-gray-600 [&::-webkit-scrollbar-track]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:bg-zinc-500 hover:[&::-webkit-scrollbar-thumb]:bg-zinc-400"
                    : "bg-white border-stone-200 [&::-webkit-scrollbar-track]:bg-stone-100 [&::-webkit-scrollbar-thumb]:bg-amber-400 hover:[&::-webkit-scrollbar-thumb]:bg-amber-500"
                }
                `}
                onClick={(e) => e.stopPropagation()}
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
                                ${isDark ? "text-zinc-400 hover:text-white" : "text-stone-400 hover:text-stone-800"}
                            `}
                        >
                            &times;
                        </button>
                    </div>

                    <h1
                        className={`text-xl sm:text-2xl font-bold mb-2 leading-snug ${isDark ? "text-white" : "text-stone-900"}`}
                        style={{fontFamily: "'Georgia', serif"}}
                    >
                        {post.title}
                    </h1>

                    <div
                        className={`flex items-center gap-3 text-xs mb-6 ${isDark ? "text-zinc-500" : "text-stone-400"}`}>
                        <span>{formatDate(post.created_at)}</span>
                        <span>·</span>
                        <span>{estimateReadTime(post.content)} min read</span>
                    </div>

                    <div
                        className={`markdown-body leading-relaxed text-sm sm:text-base mb-6 ${isDark ? "text-zinc-300" : "text-stone-700"}`}>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({node, ...props}) => <h1
                                    className={`text-xl sm:text-2xl font-bold mt-6 mb-3 ${isDark ? "text-white" : "text-stone-900"}`}
                                    style={{fontFamily: "'Georgia',serif"}} {...props} />,
                                h2: ({node, ...props}) => <h2
                                    className={`text-lg sm:text-xl font-bold mt-5 mb-2 ${isDark ? "text-white" : "text-stone-900"}`}
                                    style={{fontFamily: "'Georgia',serif"}} {...props} />,
                                h3: ({node, ...props}) => <h3
                                    className={`text-base sm:text-lg font-semibold mt-4 mb-2 ${isDark ? "text-zinc-200" : "text-stone-800"}`} {...props} />,
                                p: ({node, ...props}) => <p
                                    className={`mb-4 leading-relaxed ${isDark ? "text-zinc-300" : "text-stone-600"}`} {...props} />,
                                a: ({node, ...props}) => <a
                                    className={`underline underline-offset-2 ${isDark ? "text-amber-400 hover:text-amber-300" : "text-amber-600 hover:text-amber-500"}`}
                                    target="_blank" rel="noopener noreferrer" {...props} />,
                                strong: ({node, ...props}) => <strong
                                    className={`font-semibold ${isDark ? "text-white" : "text-stone-900"}`} {...props} />,
                                em: ({node, ...props}) => <em
                                    className={`italic ${isDark ? "text-zinc-300" : "text-stone-500"}`} {...props} />,
                                code: ({node, inline, ...props}) =>
                                    inline
                                        ? <code
                                            className={`px-1.5 py-0.5 rounded text-sm font-mono ${isDark ? "bg-zinc-800 text-amber-400" : "bg-amber-50 text-amber-700 border border-amber-200"}`} {...props} />
                                        : <code
                                            className={`block p-4 rounded-xl text-sm font-mono overflow-x-auto mb-4 ${isDark ? "bg-zinc-800/80 text-amber-300 border border-zinc-700" : "bg-stone-50 text-amber-700 border border-stone-200"}`} {...props} />,
                                pre: ({node, ...props}) => <pre className="mb-4" {...props} />,
                                ul: ({node, ...props}) => <ul
                                    className={`list-disc list-inside mb-4 space-y-1 pl-2 ${isDark ? "text-zinc-300" : "text-stone-600"}`} {...props} />,
                                ol: ({node, ...props}) => <ol
                                    className={`list-decimal list-inside mb-4 space-y-1 pl-2 ${isDark ? "text-zinc-300" : "text-stone-600"}`} {...props} />,
                                li: ({node, ...props}) => <li
                                    className={isDark ? "text-zinc-300" : "text-stone-600"} {...props} />,
                                blockquote: ({node, ...props}) => <blockquote
                                    className={`border-l-4 pl-4 italic my-4 ${isDark ? "border-amber-500/50 text-zinc-400" : "border-amber-400 text-stone-500 bg-amber-50/50 py-2 rounded-r-lg"}`} {...props} />,
                                table: ({node, ...props}) => <div className="overflow-x-auto mb-4">
                                    <table className="w-full text-sm border-collapse" {...props} />
                                </div>,
                                th: ({node, ...props}) => <th
                                    className={`text-left font-semibold border-b px-3 py-2 ${isDark ? "text-zinc-300 border-zinc-700 bg-zinc-800/50" : "text-stone-700 border-stone-200 bg-stone-50"}`} {...props} />,
                                td: ({node, ...props}) => <td
                                    className={`border-b px-3 py-2 ${isDark ? "text-zinc-400 border-zinc-800" : "text-stone-500 border-stone-100"}`} {...props} />,
                                hr: ({node, ...props}) => <hr
                                    className={`my-6 ${isDark ? "border-zinc-800" : "border-stone-200"}`} {...props} />,
                                img: ({node, ...props}) => <img className="rounded-xl max-w-full my-4" {...props} />,
                            }}
                        >
                            {post.content}
                        </ReactMarkdown>
                    </div>

                    {tags.length > 0 && (
                        <div
                            className={`flex flex-wrap gap-2 pt-4 border-t ${isDark ? "border-zinc-800" : "border-stone-100"}`}>
                            {tags.map((tag) => (
                                <span key={tag.id}
                                      className={`text-xs px-3 py-1 rounded-full ${isDark ? "text-zinc-500 bg-zinc-800" : "text-stone-400 bg-stone-100"}`}>
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Blogs() {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [selectedPost, setSelectedPost] = useState(null);
    const [isDark, setIsDark] = useState(true);

    // Fetch categories once on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const {data, error} = await supabase
                    .from('categories')
                    .select('id, name')
                    .order('name');
                if (error) throw error;
                setCategories(data);
            } catch (err) {
                console.error("Categories fetch error:", err);
            }
        };
        fetchCategories();
    }, []);

    // Fetch posts — re-runs when activeCategory changes
    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            setError(null);
            try {
                let query = supabase
                    .from('posts')
                    .select(`
                        *,
                        categories(id, name),
                        post_images(id, url),
                        post_tags(
                            tags(id, name)
                        )
                    `)
                    .order('created_at', {ascending: false});

                if (activeCategory !== "All") {
                    const cat = categories.find(c => c.name === activeCategory);
                    if (cat) query = query.eq('category_id', cat.id);
                }

                const {data, error} = await query;
                if (error) throw error;
                setPosts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [activeCategory, categories]);

    // Client-side search filter
    const filtered = posts.filter(
        (post) =>
            post.title?.toLowerCase().includes(search.toLowerCase()) ||
            post.content?.toLowerCase().includes(search.toLowerCase()) ||
            post.categories?.name?.toLowerCase().includes(search.toLowerCase()) ||
            post.post_tags?.some(pt => pt.tags?.name?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div
            className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-zinc-950 text-zinc-100" : "bg-amber-50 text-stone-900"}`}
            style={{fontFamily: "'Georgia', serif"}}
        >
            {/* Top Nav Bar */}
            <div
                className={`flex items-center justify-between px-3 sm:px-4 py-2 border-b ${isDark ? "border-zinc-800/60 bg-zinc-950/80" : "border-amber-100 bg-amber-50/80"} backdrop-blur-sm sticky top-0 z-40`}>
                <Link
                    to="/"
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-colors duration-200"
                >
                    ← Home
                </Link>
                <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)}/>
            </div>

            {/* Hero */}
            <div
                className={`border-b py-10 sm:py-16 px-4 sm:px-6 text-center ${isDark ? "border-zinc-800/60" : "border-amber-100"}`}>
                <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 ${isDark ? "text-white" : "text-stone-900"}`}>
                    The Blog
                </h1>
                <p className={`text-base sm:text-lg max-w-xl mx-auto ${isDark ? "text-zinc-500" : "text-stone-500"}`}>
                    Thoughts, stories, and ideas on technology, travel, and everything in between.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-10">
                {/* Search & Filters */}
                <div className="flex flex-col gap-3 sm:gap-4 mb-8 sm:mb-10">
                    {/* Search */}
                    <div className="relative">
                        <svg
                            className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-zinc-500" : "text-stone-400"}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search posts…"
                            className={`
                                w-full border text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none transition-colors
                                ${isDark
                                ? "bg-zinc-900 border-gray-600 text-zinc-200 placeholder-zinc-600 focus:border-zinc-500"
                                : "bg-white border-stone-300 text-stone-800 placeholder-stone-400 focus:border-amber-400 shadow-sm"
                            }
                            `}
                        />
                    </div>

                    {/* Category filters — scrollable on mobile */}
                    <div className="flex gap-2 flex-wrap sm:flex-wrap overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                        <button
                            onClick={() => setActiveCategory("All")}
                            className={`
                                shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all border whitespace-nowrap
                                ${activeCategory === "All"
                                ? "bg-amber-500 border-amber-500 text-zinc-950"
                                : isDark
                                    ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                                    : "bg-white border-stone-300 text-stone-500 hover:border-amber-300 hover:text-stone-800"
                            }
                            `}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.name)}
                                className={`
                                    shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all border whitespace-nowrap
                                    ${activeCategory === cat.name
                                    ? "bg-amber-500 border-amber-500 text-zinc-950"
                                    : isDark
                                        ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                                        : "bg-white border-stone-300 text-stone-500 hover:border-amber-300 hover:text-stone-800"
                                }
                                `}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results count */}
                {!loading && !error && (
                    <p className={`text-xs mb-4 sm:mb-6 ${isDark ? "text-zinc-600" : "text-stone-400"}`}>
                        {filtered.length} post{filtered.length !== 1 ? "s" : ""}
                        {activeCategory !== "All" && ` in ${activeCategory}`}
                        {search && ` matching "${search}"`}
                    </p>
                )}

                {/* Error */}
                {error && (
                    <div className="text-center py-16 sm:py-24">
                        <p className="text-red-400 mb-4 text-sm sm:text-base">{error}</p>
                        <button
                            onClick={() => setActiveCategory(activeCategory)}
                            className="text-sm text-amber-500 hover:text-amber-400 transition-colors"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Skeletons */}
                {loading && (
                    <div className="flex flex-col gap-4">
                        {Array.from({length: 4}).map((_, i) => (
                            <SkeletonCard key={i} isDark={isDark}/>
                        ))}
                    </div>
                )}

                {/* Posts List */}
                {!loading && !error && filtered.length > 0 && (
                    <div className="flex flex-col gap-4">
                        {filtered.map((post) => (
                            <BlogCard key={post.id} post={post} onClick={setSelectedPost} isDark={isDark}/>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && filtered.length === 0 && (
                    <div className="text-center py-16 sm:py-24">
                        <p className={`text-base sm:text-lg mb-4 ${isDark ? "text-zinc-600" : "text-stone-400"}`}>No
                            posts found.</p>
                        <button
                            onClick={() => {
                                setSearch("");
                                setActiveCategory("All");
                            }}
                            className="text-sm text-amber-500 hover:text-amber-400 transition-colors"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>

            {/* Post Modal */}
            <BlogModal post={selectedPost} onClose={() => setSelectedPost(null)} isDark={isDark}/>
        </div>
    );
}
