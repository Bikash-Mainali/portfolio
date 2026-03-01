import { useState, useEffect } from "react";
import { supabase } from "../util/supabaseClient.js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

const CATEGORY_COLORS = {
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="flex gap-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 animate-pulse">
            <div className="shrink-0 w-36 h-36 bg-zinc-800 rounded-xl" />
            <div className="flex-1 space-y-3 py-1">
                <div className="h-5 bg-zinc-800 rounded-lg w-3/4" />
                <div className="h-3 bg-zinc-800 rounded w-24" />
                <div className="h-4 bg-zinc-800 rounded-lg w-full" />
                <div className="h-4 bg-zinc-800 rounded-lg w-5/6" />
                <div className="flex gap-2 pt-1">
                    <div className="h-5 w-16 bg-zinc-800 rounded-full" />
                    <div className="h-5 w-12 bg-zinc-800 rounded-full" />
                </div>
            </div>
        </div>
    );
}

// ─── Blog Card ────────────────────────────────────────────────────────────────
function BlogCard({ post, onClick }) {
    const coverImage = post.post_images?.[0]?.url;
    const categoryName = post.categories?.name;
    const tags = post.post_tags?.map(pt => pt.tags) || [];
    const categoryColor = CATEGORY_COLORS[categoryName] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

    return (
        <div
            onClick={() => onClick(post)}
            className="group flex gap-10 bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-black/20 p-4"
        >
            {/* Thumbnail */}
            <div className="shrink-0 md:w-96 md:h-96 sm:w-32 sm:h-32 w-24 h-24  rounded-xl overflow-hidden bg-zinc-800">
                    <img
                        src={coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => (e.target.parentElement.classList.add("flex","items-center","justify-center"))}
                    />
                )
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 min-w-0">
                {/* Title */}
                <h2
                    className="text-amber-400 font-bold text-lg leading-snug mb-1.5 group-hover:text-amber-300 transition-colors line-clamp-2"
                    style={{ fontFamily: "'Georgia', serif" }}
                >
                    {post.title}
                </h2>

                {/* Date */}
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-2">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formatDate(post.created_at)}</span>
                    <span className="text-zinc-700">·</span>
                    <span>{estimateReadTime(post.content)} min read</span>
                </div>

                {/* Excerpt */}
                <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2 mb-3 flex-1">
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
                        <span key={tag.id} className="text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">
                            #{tag.name}
                        </span>
                    ))}
                    {tags.length > 3 && (
                        <span className="text-xs text-zinc-700">+{tags.length - 3} more</span>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Blog Modal ───────────────────────────────────────────────────────────────
function BlogModal({ post, onClose }) {
    if (!post) return null;

    const coverImage = post.post_images?.[0]?.url;
    const categoryName = post.categories?.name;
    const tags = post.post_tags?.map(pt => pt.tags) || [];
    const categoryColor = CATEGORY_COLORS[categoryName] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {coverImage && (
                    <div className="h-56 overflow-hidden rounded-t-2xl">
                        <img src={coverImage} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="p-8">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        {categoryName && (
                            <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border ${categoryColor}`}>
                                {categoryName}
                            </span>
                        )}
                        <button
                            onClick={onClose}
                            className="text-zinc-500 hover:text-white transition-colors text-2xl leading-none ml-auto"
                        >
                            &times;
                        </button>
                    </div>

                    <h1
                        className="text-2xl font-bold text-white mb-2 leading-snug"
                        style={{ fontFamily: "'Georgia', serif" }}
                    >
                        {post.title}
                    </h1>

                    <div className="flex items-center gap-3 text-xs text-zinc-500 mb-6">
                        <span>{formatDate(post.created_at)}</span>
                        <span>·</span>
                        <span>{estimateReadTime(post.content)} min read</span>
                    </div>

                    <div className="markdown-body text-zinc-300 leading-relaxed text-base mb-6">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-white mt-6 mb-3" style={{fontFamily:"'Georgia',serif"}} {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-xl font-bold text-white mt-5 mb-2" style={{fontFamily:"'Georgia',serif"}} {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-zinc-200 mt-4 mb-2" {...props} />,
                                p:  ({node, ...props}) => <p className="text-zinc-300 mb-4 leading-relaxed" {...props} />,
                                a:  ({node, ...props}) => <a className="text-amber-400 hover:text-amber-300 underline underline-offset-2" target="_blank" rel="noopener noreferrer" {...props} />,
                                strong: ({node, ...props}) => <strong className="text-white font-semibold" {...props} />,
                                em: ({node, ...props}) => <em className="text-zinc-300 italic" {...props} />,
                                code: ({node, inline, ...props}) =>
                                    inline
                                        ? <code className="bg-zinc-800 text-amber-400 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                                        : <code className="block bg-zinc-800/80 text-amber-300 p-4 rounded-xl text-sm font-mono overflow-x-auto mb-4 border border-zinc-700" {...props} />,
                                pre: ({node, ...props}) => <pre className="mb-4" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc list-inside text-zinc-300 mb-4 space-y-1 pl-2" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal list-inside text-zinc-300 mb-4 space-y-1 pl-2" {...props} />,
                                li: ({node, ...props}) => <li className="text-zinc-300" {...props} />,
                                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-amber-500/50 pl-4 italic text-zinc-400 my-4" {...props} />,
                                table: ({node, ...props}) => <div className="overflow-x-auto mb-4"><table className="w-full text-sm border-collapse" {...props} /></div>,
                                th: ({node, ...props}) => <th className="text-left text-zinc-300 font-semibold border-b border-zinc-700 px-3 py-2 bg-zinc-800/50" {...props} />,
                                td: ({node, ...props}) => <td className="text-zinc-400 border-b border-zinc-800 px-3 py-2" {...props} />,
                                hr: ({node, ...props}) => <hr className="border-zinc-800 my-6" {...props} />,
                                img: ({node, ...props}) => <img className="rounded-xl max-w-full my-4" {...props} />,
                            }}
                        >
                            {post.content}
                        </ReactMarkdown>
                    </div>

                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-800">
                            {tags.map((tag) => (
                                <span key={tag.id} className="text-xs text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full">
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

    // Fetch categories once on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data, error } = await supabase
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
                    .order('created_at', { ascending: false });

                if (activeCategory !== "All") {
                    const cat = categories.find(c => c.name === activeCategory);
                    if (cat) query = query.eq('category_id', cat.id);
                }

                const { data, error } = await query;
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
        <div className="min-h-screen bg-zinc-950 text-zinc-100" style={{ fontFamily: "'Georgia', serif" }}>
            {/* Hero */}
            <div className="border-b border-zinc-800/60 py-16 px-6 text-center">
                <h1 className="text-5xl font-bold text-white mb-3">The Blog</h1>
                <p className="text-zinc-500 text-lg max-w-xl mx-auto">
                    Thoughts, stories, and ideas on technology, travel, and everything in between.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                    <div className="relative flex-1">
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search posts…"
                            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-600 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-zinc-600 transition-colors"
                        />
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setActiveCategory("All")}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                                activeCategory === "All"
                                    ? "bg-amber-500 border-amber-500 text-zinc-950"
                                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                            }`}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.name)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                                    activeCategory === cat.name
                                        ? "bg-amber-500 border-amber-500 text-zinc-950"
                                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results count */}
                {!loading && !error && (
                    <p className="text-xs text-zinc-600 mb-6">
                        {filtered.length} post{filtered.length !== 1 ? "s" : ""}
                        {activeCategory !== "All" && ` in ${activeCategory}`}
                        {search && ` matching "${search}"`}
                    </p>
                )}

                {/* Error */}
                {error && (
                    <div className="text-center py-24">
                        <p className="text-red-400 mb-4">{error}</p>
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
                        {Array.from({ length: 4 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                )}

                {/* Posts List */}
                {!loading && !error && filtered.length > 0 && (
                    <div className="flex flex-col gap-4">
                        {filtered.map((post) => (
                            <BlogCard key={post.id} post={post} onClick={setSelectedPost} />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && filtered.length === 0 && (
                    <div className="text-center py-24">
                        <p className="text-zinc-600 text-lg mb-4">No posts found.</p>
                        <button
                            onClick={() => { setSearch(""); setActiveCategory("All"); }}
                            className="text-sm text-amber-500 hover:text-amber-400 transition-colors"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>

            {/* Post Modal */}
            <BlogModal post={selectedPost} onClose={() => setSelectedPost(null)} />
        </div>
    );
}