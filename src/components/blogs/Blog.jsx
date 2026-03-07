import React, {useEffect, useState} from 'react';
import {formatDate, estimateReadTime} from "../../util/dateUtil.js";
import {supabase} from "../../util/supabaseClient.js";
import {useParams, useNavigate} from "react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {CATEGORY_COLORS_DARK, CATEGORY_COLORS_LIGHT, THEMES} from "../constants/BlogConstants.js";
import BrandName from "../shared/BrandName.jsx";
import ThemeToggle from "../ThemToggle.jsx";
import {LeftArrow} from "../../icons/index.jsx";
import {getS3ImageUrl} from "../../util/s3Util.js";

export default function Blog() {
    const [post, setPost] = React.useState(null);
    const {postId} = useParams();
    const navigate = useNavigate();
    // goBack: try to navigate back in history, fallback to /blogs
    const goBack = () => {
        try {
            if (window.history.length > 1) {
                navigate(-1);
            } else {
                navigate('/blogs');
            }
        } catch (e) {
            navigate('/blogs');
        }
    }
    const [loading, setLoading] = useState(true);
    const [categoryName, setCategoryName] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [tags, setTags] = useState([]);
    const isDark = localStorage.getItem("theme") === THEMES.DARK;
    const COLORS = isDark ? CATEGORY_COLORS_DARK : CATEGORY_COLORS_LIGHT;
    const categoryColor = COLORS[categoryName] || (isDark
        ? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
        : "bg-stone-100 text-stone-600 border-stone-200");

    useEffect(() => {
        setLoading(true);
        let mounted = true;

        const fetchPostById = async () => {
            try {
                const {data, error} = await supabase
                    .from('posts')
                    .select(`
                        *,
                        categories(id, name),
                        post_images(id, url),
                        post_tags(
                            tags(id, name)
                        )
                `)
                    .eq('id', postId)
                    .single();

                setCategoryName(data.categories?.name || '');
                setCoverImage(data.post_images?.[0]?.url || '');
                setTags(data.post_tags?.map(pt => pt.tags) || []);

                if (mounted) {
                    debugger
                    if(data.post_images.length > 0) {
                        const imageUrl = await getS3ImageUrl(data.post_images[0].url);
                        setCoverImage(prev => imageUrl);
                    }
                    setPost(data || {});
                }
            } catch (err) {
                console.error("Post fetch by id error:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchPostById();
        return () => {
            mounted = false;
        };
    }, [postId]);

    // loading state is used to show a placeholder until post is fetched
    if (loading && !post) {
        return (
            <div className="min-h-[40vh] flex items-center justify-center p-8">
                <div className="text-stone-500 dark:text-zinc-400">Loading…</div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen py-5 max-w-7xl   px-10 sm:px-5 mx-auto relative  transition-colors duration-300 text-stone-900  dark:text-zinc-100"
            style={{fontFamily: "'Georgia', serif"}}>
            <div
                className="sticky top-0 z-50 px-10 border-b bg-white dark:border-dark border-light sm:px-5 py-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <BrandName to={'/'} className="text-amber-600 dark:text-white text-lg"/>
                    </div>
                    <ThemeToggle/>
                </div>
            </div>

            <div
                className="mx-auto mt-20 border dark:border-dark rounded-2xl border-light overflow-hidden">
                <button
                    onClick={goBack}
                    className={`m-4 cursor-pointer text-stone-700 dark:text-zinc-300 text-sm transition-colors 'cursor-pointer hover:text-amber-600 dark:hover:text-teal-400'}`}
                    aria-label="Go back"
                >
                    <LeftArrow size={25}/>
                </button>

                {post && (
                    <div className="sm:px-20 px-10">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            {categoryName && (
                                <span
                                    className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border ${categoryColor}`}>
                                            {categoryName}
                                        </span>
                            )}

                        </div>
                        {coverImage && (
                            <div className="overflow-hidden py-10 bg-cover bg-center rounded-3xl">
                                <img src={coverImage} alt={post.title} className="w-full h-full object-cover"/>
                            </div>
                        )}

                        <h1
                            className={`text-2xl sm:text-3xl font-bold mb-2 leading-snug dark:text-white text-stone-900`}
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
                                        className={`text-2xl sm:text-3xl font-bold mt-6 mb-3 dark:text-white text-stone-900`}
                                        style={{fontFamily: "'Georgia',serif"}} {...props} />,
                                    h2: ({node, ...props}) => <h2
                                        className="text-xl sm:text-2xl font-bold mt-5 mb-2 text-stone-900 dark:text-white"
                                        style={{fontFamily: "'Georgia',serif"}} {...props} />,
                                    h3: ({node, ...props}) => <h3
                                        className="text-lg sm:text-xl font-semibold mt-4 mb-2 text-stone-800 dark:text-zinc-200" {...props} />,
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
                                    img: ({node, ...props}) => {
                                        const alt = props.alt || post?.title || '';
                                        return <img className="rounded-xl max-w-full my-4"
                                                    alt={alt} {...props} />;
                                    },
                                }}
                            >
                                {post.content}
                            </ReactMarkdown>
                        </div>

                        {tags.length > 0 && (
                            <div
                                className="flex flex-wrap gap-2 py-4 border-t border-stone-100 dark:border-zinc-800">
                                {tags.map((tag) => (
                                    <span key={tag.id}
                                          className="text-xs px-3 py-1 rounded-full text-stone-400 bg-stone-100 dark:text-zinc-500 dark:bg-zinc-800">
                                            #{tag.name}
                                        </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

}
