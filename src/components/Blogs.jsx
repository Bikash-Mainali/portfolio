import {useState, useEffect} from "react";
import {supabase} from "../util/supabaseClient.js";
import {Link, useNavigate} from "react-router";
import BlogCard from "./blogs/BlogCard.jsx";
import Error from "./Error.jsx";
import SkeletonCard from "./blogs/LoaderSkeleton.jsx";
import BrandName from "./shared/BrandName.jsx";
import ThemeToggle from "./ThemToggle.jsx";
import {getS3ImageUrl} from "../util/s3Util.js";
import {Search} from "../icons/index.jsx";

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
        <section
            className="relative section-title min-h-screen max-w-7xl px-10 sm:px-5 mx-auto   transition-colors duration-300 text-stone-900  dark:text-zinc-100"
            style={{fontFamily: "'Georgia', serif"}}
        >

            {error ? <Error message={error}/> :
                <>
                    {/* Sticky header: BrandName (left) + ThemeToggle (right) */}
                    <div className="sticky top-0 z-50 border-b dark:border-dark border-light">
                        <div className="max-w-7xl mx-auto px-10 sm:px-5 flex items-center justify-between py-3">
                            <Link to="/" className="flex items-center gap-2">
                                <BrandName className="text-black dark:text-white"/>
                            </Link>
                            <ThemeToggle/>
                        </div>

                        {/* Hero (kept inside header so it's always visible) */}

                    </div>
                    <div className="max-w-7xl mx-auto px-10 mt-20 sm:px-5 text-center pb-3">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 text-dark dark:text-light">
                            Bikash's Blog
                        </h1>
                        <p className="text-base sm:text-lg max-w-xl mx-auto text-slate">
                            Thoughts, stories, and ideas on technology, travel, and everything in between.
                        </p>
                    </div>
                    {/* Sticky search & category bar below header */}
                    <div className="border-b dark:border-dark border-light">
                        <div className="max-w-7xl mx-auto px-10 sm:px-5 py-3">
                            {/* Search & Filters (moved into sticky bar) */}
                            <div className="flex flex-col gap-3 sm:gap-4 ">
                                {/* Search */}
                                <div className="relative flex items-center">
                                    <Search className="absolute left-3 w-4 h-4 text-stone-400 pointer-events-none"/>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search posts…"
                                        className="w-full border text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none transition-colors bg-white dark:bg-dark border-light  placeholder-light focus:border-slate shadow-sm dark:focus:border-primary-weak  dark:border-slate"
                                    />
                                </div>

                                {/* Category filters */}
                                <div
                                    className="flex gap-2 flex-wrap sm:flex-wrap overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                                    <button
                                        onClick={() => setActiveCategory("All")}
                                        className={`shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all border border-slate whitespace-nowrap ${
                                            activeCategory === "All"
                                                ? "bg-primary-weak border-primary text-black "
                                                : "bg-white text-black "
                                        }`}
                                    >
                                        All
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setActiveCategory(cat.name)}
                                            className={`shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all border border-slate whitespace-nowrap ${
                                                activeCategory === cat.name
                                                    ? "bg-primary-weak border-primary text-black "
                                                    : "bg-white text-black "}`}
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
                            <p className="text-xs mb-4 sm:mb-6 text-slate">
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
                                <p className="text-base sm:text-lg mb-4 text-slate">No posts
                                    found.</p>
                                <button
                                    onClick={() => {
                                        setSearch("");
                                        setActiveCategory("All");
                                    }}
                                    className="text-sm cursor-pointer text-slate hover:text-primary-weak transition-colors"
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}
                    </div>
                </>
            }
        </section>
    );
}
