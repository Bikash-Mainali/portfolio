import {estimateReadTime, formatDate} from "../../util/dateUtil.js";
import {CATEGORY_COLORS_DARK, CATEGORY_COLORS_LIGHT} from "../constants/BlogConstants.js";

export default function BlogCard({post, onClick}) {
    const coverImage = post.post_images?.[0]?.url;
    const categoryName = post.categories?.name;
    const tags = post.post_tags?.map(pt => pt.tags) || [];

    // You'll need to handle category colors differently - either:
    // 1. Use CSS variables
    // 2. Create a mapping that includes dark: classes
    // 3. Use inline styles with dark mode detection
    const lightColor = CATEGORY_COLORS_LIGHT[categoryName] || "bg-stone-100 text-stone-600 border-stone-200";
    const darkColor = CATEGORY_COLORS_DARK[categoryName] || "dark:bg-zinc-500/10 dark:text-zinc-400 dark:border-zinc-500/20";
    const categoryColor = `${lightColor} ${darkColor}`;

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

    return (
        <div
            onClick={() => onClick(post)}
            className="group flex gap-4 sm:gap-6 lg:gap-10 border rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer p-3 sm:p-4 bg-white border-stone-200 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100/50 dark:bg-zinc-900/60 dark:border-dark dark:hover:border-zinc-600 dark:hover:shadow-xl dark:hover:shadow-black/20"
        >
            {/* Thumbnail */}
            <div className="shrink-0 rounded-xl overflow-hidden w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 bg-stone-100 dark:bg-zinc-800">
                {coverImage ? (
                    <img
                        src={coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl text-stone-300 dark:text-zinc-700">
                        📄
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 min-w-0">
                {/* Title */}
                <h2
                    className="font-bold text-base sm:text-lg leading-snug mb-1.5 transition-colors line-clamp-2 text-amber-700 group-hover:text-amber-600 dark:text-amber-400 dark:group-hover:text-amber-300"
                    style={{fontFamily: "'Georgia', serif"}}
                >
                    {post.title}
                </h2>

                {/* Date */}
                <div className="flex items-center gap-1.5 text-xs mb-2 text-stone-400 dark:text-zinc-500">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>{formatDate(post.created_at)}</span>
                    <span className="text-stone-300 dark:text-zinc-700">·</span>
                    <span>{estimateReadTime(post.content)} min read</span>
                </div>

                {/* Excerpt */}
                <p className="text-sm leading-relaxed line-clamp-2 mb-3 flex-1 text-stone-500 dark:text-zinc-400">
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
                              className="text-xs px-2 py-0.5 rounded-full text-stone-400 bg-stone-100 dark:text-zinc-600 dark:bg-zinc-800">
                            #{tag.name}
                        </span>
                    ))}
                    {tags.length > 3 && (
                        <span className="text-xs text-stone-400 dark:text-zinc-700">+{tags.length - 3} more</span>
                    )}
                </div>
            </div>
        </div>
    );
}
