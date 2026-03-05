import {useState, useEffect} from "react";
import {supabase} from "../util/supabaseClient.js";
import {Link} from "react-router";
import BlogCard from "./blogs/BlogCard.jsx";
import BlogModal from "./blogs/BlogModal.jsx";

function SkeletonCard() {
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
            className="min-h-screen transition-colors duration-300 bg-amber-50 text-stone-900 dark:bg-zinc-950 dark:text-zinc-100"
            style={{fontFamily: "'Georgia', serif"}}
        >
            {/* Top Nav Bar */}
            <div
                className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-amber-100 bg-amber-50/80 dark:border-zinc-800/60 dark:bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-40">
                <Link
                    to="/"
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-colors duration-200"
                >
                    ← Home
                </Link>
            </div>

            {/* Hero */}
            <div className="border-b border-amber-100 dark:border-zinc-800/60 py-10 sm:py-16 px-4 sm:px-6 text-center">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 text-stone-900 dark:text-white">
                    The Blog
                </h1>
                <p className="text-base sm:text-lg max-w-xl mx-auto text-stone-500 dark:text-zinc-500">
                    Thoughts, stories, and ideas on technology, travel, and everything in between.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-10">
                {/* Search & Filters */}
                <div className="flex flex-col gap-3 sm:gap-4 mb-8 sm:mb-10">
                    {/* Search */}
                    <div className="relative">
                        <svg
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-zinc-500"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search posts…"
                            className="w-full border text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none transition-colors bg-white border-stone-300 text-stone-800 placeholder-stone-400 focus:border-amber-400 shadow-sm dark:bg-zinc-900 dark:border-gray-600 dark:text-zinc-200 dark:placeholder-zinc-600 dark:focus:border-zinc-500"
                        />
                    </div>

                    {/* Category filters */}
                    <div className="flex gap-2 flex-wrap sm:flex-wrap overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                        <button
                            onClick={() => setActiveCategory("All")}
                            className={`shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all border whitespace-nowrap ${
                                activeCategory === "All"
                                    ? "bg-amber-500 border-amber-500 text-zinc-950"
                                    : "bg-white border-stone-300 text-stone-500 hover:border-amber-300 hover:text-stone-800 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
                            }`}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.name)}
                                className={`shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all border whitespace-nowrap ${
                                    activeCategory === cat.name
                                        ? "bg-amber-500 border-amber-500 text-zinc-950"
                                        : "bg-white border-stone-300 text-stone-500 hover:border-amber-300 hover:text-stone-800 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results count */}
                {!loading && !error && (
                    <p className="text-xs mb-4 sm:mb-6 text-stone-400 dark:text-zinc-600">
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
                            <SkeletonCard key={i}/>
                        ))}
                    </div>
                )}

                {/* Posts List */}
                {!loading && !error && filtered.length > 0 && (
                    <div className="flex flex-col gap-4">
                        {filtered.map((post) => (
                            <BlogCard key={post.id} post={post} onClick={setSelectedPost}/>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && filtered.length === 0 && (
                    <div className="text-center py-16 sm:py-24">
                        <p className="text-base sm:text-lg mb-4 text-stone-400 dark:text-zinc-600">No posts found.</p>
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

            {/* Blog Modal */}
            <BlogModal post={selectedPost} onClose={() => setSelectedPost(null)}/>
        </div>

    );
}
