import {useState, useEffect} from "react";
import {supabase} from "../util/supabaseClient.js";
import {Link, useNavigate} from "react-router";
import BlogCard from "./blogs/BlogCard.jsx";
import Error from "./Error.jsx";
import SkeletonCard from "./blogs/LoaderSkeleton.jsx";
import BrandName from "./shared/BrandName.jsx";
import ThemeToggle from "./ThemToggle.jsx";
import {getS3ImageUrl} from "../util/s3Util.js";

export default function Blogs() {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const navigate = useNavigate();

    // Fetch categories once on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const {data, error} = await supabase
                    .from('categories')
                    .select('id, name')
                    .order('name');
                setCategories(data);
            } catch (err) {
                setError(err.message)
            }
        };
        fetchCategories();
    }, []);

    // Fetch posts — re-runs when activeCategory changes
    useEffect(() => {
        if (error) return;
        const fetchPosts = async () => {
            setLoading(true);
            try {
                setTimeout(() => 4000);
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

                const res = await query;
                if (res.error) {
                    setError(res.error.message || String(res.error));
                    setPosts([]);
                    setLoading(false);
                    return;
                }
                const data = res.data;
                // Resolve any stored filenames in post_images to public URLs.
                const postsWithPublicImages = await Promise.all((Array.isArray(data) ? data : []).map(async (p) => {
                    if (p.post_images && Array.isArray(p.post_images)) {
                        const resolved = await Promise.all(p.post_images.map(async (img) => {
                            if (!img || !img.url) return img;
                            // if url already looks like a public URL, keep it
                            if (String(img.url).startsWith('http')) return img;
                            // otherwise treat img.url as filename in storage and get public URL
                            try {
                                const fullImageUrl = await getS3ImageUrl(img.url);
                                return {...img, url: fullImageUrl || img.url};
                            } catch (e) {
                                return img;
                            }
                        }));
                        p.post_images = resolved;
                    }
                    return p;
                }));

                setPosts(postsWithPublicImages);
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
            className="min-h-screen max-w-7xl px-10 sm:px-5 mx-auto relative  transition-colors duration-300 text-stone-900  dark:text-zinc-100"
            style={{fontFamily: "'Georgia', serif"}}
        >

            {error ? <Error message={error}/> :
                <>
                    {/* Sticky header: BrandName (left) + ThemeToggle (right) */}
                    <div className="sticky top-0 z-50 bg-site border-b dark:border-gray-700 border-gray-200">
                        <div className="max-w-7xl mx-auto px-10 sm:px-5 flex items-center justify-between py-3">
                            <Link to="/" className="flex items-center gap-2">
                                <BrandName className="text-amber-600 dark:text-white text-lg"/>
                            </Link>
                            <ThemeToggle/>
                        </div>

                        {/* Hero (kept inside header so it's always visible) */}

                    </div>
                    <div className="max-w-7xl mx-auto px-10 mt-20 sm:px-5 text-center pb-3">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 text-stone-900 dark:text-white">
                            Bikash's Blog
                        </h1>
                        <p className="text-base sm:text-lg max-w-xl mx-auto text-stone-500 dark:text-zinc-500">
                            Thoughts, stories, and ideas on technology, travel, and everything in between.
                        </p>
                    </div>
                    {/* Sticky search & category bar below header */}
                    <div className="bg-site border-b border-stone-100 dark:border-zinc-800/60">
                        <div className="max-w-7xl mx-auto px-10 sm:px-5 py-3">
                            {/* Search & Filters (moved into sticky bar) */}
                            <div className="flex flex-col gap-3 sm:gap-4">
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
                                <div
                                    className="flex gap-2 flex-wrap sm:flex-wrap overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
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
                        </div>
                    </div>

                    {/* Main content area */}
                    <div className="mx-auto sm:py-20 py-10 max-w-7xl px-10 sm:px-5">
                        {/* Results count */}
                        {!loading && !error && (
                            <p className="text-xs mb-4 sm:mb-6 text-stone-400 dark:text-zinc-600">
                                {filtered.length} post{filtered.length !== 1 ? "s" : ""}
                                {activeCategory !== "All" && ` in ${activeCategory}`}
                                {search && ` matching "${search}"`}
                            </p>
                        )}

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
                                    <BlogCard key={post.id} post={post} onClick={() => {
                                        navigate(`/blogs/${post.id}`);
                                    }}/>
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && !error && filtered.length === 0 && (
                            <div className="text-center py-16 sm:py-24">
                                <p className="text-base sm:text-lg mb-4 text-stone-400 dark:text-zinc-600">No posts
                                    found.</p>
                                <button
                                    onClick={() => {
                                        setSearch("");
                                        setActiveCategory("All");
                                    }}
                                    className="text-sm cursor-pointer text-amber-500 hover:text-amber-400 transition-colors"
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}
                    </div>
                </>
            }
        </div>
    );
}
