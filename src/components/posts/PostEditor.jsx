import {useState, useRef, useCallback} from "react";
import {Link} from "react-router";
import {supabase} from "../../util/supabaseClient.js";
import {LeftArrow} from "../../icons/index.jsx";
import {CATEGORIES, FONT_FAMILIES, FONT_SIZES, TAGS_BY_CATEGORY} from "../constants/BlogConstants.js";
import TBtn from "./TBtn.jsx";

const BLOCK_TAGS = new Set(["p", "h1", "h2", "h3", "h4", "pre", "blockquote", "div"]);

// ─── DOM → Markdown serializer ────────────────────────────────────────────────
function nodeToMarkdown(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const tag = node.tagName.toLowerCase();
    const inner = Array.from(node.childNodes).map(nodeToMarkdown).join("");
    switch (tag) {
        case "h1":
            return `# ${inner}\n\n`;
        case "h2":
            return `## ${inner}\n\n`;
        case "h3":
            return `### ${inner}\n\n`;
        case "h4":
            return `#### ${inner}\n\n`;
        case "p":
            return `${inner}\n\n`;
        case "br":
            return "\n";
        case "strong":
        case "b":
            return `**${inner}**`;
        case "em":
        case "i":
            return `*${inner}*`;
        case "code":
            return node.parentElement?.tagName?.toLowerCase() === "pre" ? inner : `\`${inner}\``;
        case "pre":
            return "```\n" + inner + "\n```\n\n";
        case "ul":
            return Array.from(node.children).map(li => `- ${nodeToMarkdown(li).trim()}`).join("\n") + "\n\n";
        case "ol":
            return Array.from(node.children).map((li, i) => `${i + 1}. ${nodeToMarkdown(li).trim()}`).join("\n") + "\n\n";
        case "li":
            return inner;
        case "a":
            return `[${inner}](${node.getAttribute("href") || ""})`;
        case "img":
            return `![${node.getAttribute("alt") || ""}](${node.getAttribute("src") || ""})\n\n`;
        case "hr":
            return `---\n\n`;
        case "blockquote":
            return inner.split("\n").filter(Boolean).map(l => `> ${l}`).join("\n") + "\n\n";
        case "span":
            return inner;
        default:
            return inner + "\n";
    }
}

function serializeToMarkdown(el) {
    if (!el) return "";
    return Array.from(el.childNodes)
        .map(nodeToMarkdown)
        .join("")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

// ─── Selection / Range helpers ────────────────────────────────────────────────

function getActiveRange() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    return sel.getRangeAt(0).cloneRange();
}

function applyRange(range) {
    if (!range) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

function getBlockAncestor(node, editorEl) {
    let current = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    while (current && current !== editorEl) {
        if (BLOCK_TAGS.has(current.tagName.toLowerCase()) && current.parentElement === editorEl) {
            return current;
        }
        current = current.parentElement;
    }
    return null;
}

function findAncestor(node, tagName) {
    let current = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    while (current) {
        if (current.tagName?.toLowerCase() === tagName) return current;
        current = current.parentElement;
    }
    return null;
}

function unwrapNode(node) {
    const parent = node.parentNode;
    while (node.firstChild) parent.insertBefore(node.firstChild, node);
    parent.removeChild(node);
}

// ─── Core editing operations ──────────────────────────────────────────────────

function toggleBold(range) {
    if (!range || range.collapsed) return;

    const ancestor = findAncestor(range.commonAncestorContainer, "strong");
    if (ancestor) {
        unwrapNode(ancestor);
        return;
    }

    const fragment = range.extractContents();
    const strong = document.createElement("strong");
    strong.appendChild(fragment);
    range.insertNode(strong);

    const newRange = document.createRange();
    newRange.selectNodeContents(strong);
    applyRange(newRange);
}

function formatBlock(tag, range, editorEl) {
    if (!range) return;

    const block = getBlockAncestor(range.commonAncestorContainer, editorEl);

    if (block) {
        const newBlock = document.createElement(tag);
        newBlock.innerHTML = block.innerHTML;
        block.replaceWith(newBlock);

        const newRange = document.createRange();
        newRange.selectNodeContents(newBlock);
        newRange.collapse(false);
        applyRange(newRange);
    } else {
        const newBlock = document.createElement(tag);
        newBlock.appendChild(
            range.collapsed
                ? document.createTextNode("\u200B")
                : range.extractContents()
        );
        range.insertNode(newBlock);

        const newRange = document.createRange();
        newRange.selectNodeContents(newBlock);
        newRange.collapse(false);
        applyRange(newRange);
    }
}

function applySpanStyle(styleKey, styleValue, range) {
    if (!range || range.collapsed) return;

    const existingSpan = findAncestor(range.commonAncestorContainer, "span");
    if (existingSpan && existingSpan.style[styleKey]) {
        existingSpan.style[styleKey] = styleValue;
        return;
    }

    const fragment = range.extractContents();
    const span = document.createElement("span");
    span.style[styleKey] = styleValue;
    span.appendChild(fragment);
    range.insertNode(span);

    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    applyRange(newRange);
}

function insertImageAtRange(src, range, editorEl) {
    const targetRange = range ?? (() => {
        const r = document.createRange();
        r.selectNodeContents(editorEl);
        r.collapse(false);
        return r;
    })();

    const img = document.createElement("img");
    img.src = src;
    img.alt = "";

    const p = document.createElement("p");
    p.appendChild(img);

    targetRange.collapse(false);
    targetRange.insertNode(p);

    const newRange = document.createRange();
    newRange.setStartAfter(p);
    newRange.collapse(true);
    applyRange(newRange);
}

//─── Main Component ──────────────────────────────────────────────────────────
export default function PostEditor() {
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);
    const savedRangeRef = useRef(null);

    const [title, setTitle] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [selectedTags, setSelectedTags] = useState([]);
    const [isPublishing, setIsPublishing] = useState(false);
    const [published, setPublished] = useState(false);
    const [error, setError] = useState(null);
    const [wordCount, setWordCount] = useState(0);

    const availableTags = categoryId ? TAGS_BY_CATEGORY[parseInt(categoryId)] || [] : [];

    const saveRange = useCallback(() => {
        savedRangeRef.current = getActiveRange();
    }, []);

    const withRange = useCallback((fn) => {
        applyRange(savedRangeRef.current);
        fn(savedRangeRef.current, editorRef.current);
        editorRef.current?.focus();
        savedRangeRef.current = getActiveRange();
    }, []);

    const handleSelectionChange = useCallback(() => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            if (editorRef.current?.contains(range.commonAncestorContainer)) {
                savedRangeRef.current = range.cloneRange();
            }
        }
    }, []);

    const handleInput = () => {
        const text = editorRef.current?.innerText || "";
        setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            editorRef.current?.focus();
            insertImageAtRange(ev.target.result, savedRangeRef.current, editorRef.current);
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const handlePublish = async () => {
        setIsPublishing(true);
        setError(null);
        try {
            const markdown = serializeToMarkdown(editorRef.current);
            const {data: post, error: postError} = await supabase
                .from("posts")
                .insert({title, content: markdown, category_id: parseInt(categoryId)})
                .select()
                .single();
            if (postError) throw postError;

            if (selectedTags.length > 0) {
                const {error: tagError} = await supabase
                    .from("post_tags")
                    .insert(selectedTags.map((t) => ({post_id: post.id, tag_id: t.id})));
                if (tagError) throw tagError;
            }
            setPublished(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsPublishing(false);
        }
    };

    const handleReset = () => {
        setTitle("");
        if (editorRef.current) editorRef.current.innerHTML = "";
        setCategoryId("");
        setSelectedTags([]);
        setPublished(false);
        setError(null);
        setWordCount(0);
        savedRangeRef.current = null;
    };

    const toggleTag = (tag) =>
        setSelectedTags((prev) =>
            prev.find((t) => t.id === tag.id) ? prev.filter((t) => t.id !== tag.id) : [...prev, tag]
        );

    const isPublishable = title.trim() && wordCount > 0 && categoryId && !isPublishing;

    if (published) {
        return (
            <div className="min-h-screen bg-stone-50 dark:bg-navy-950 flex items-center justify-center">
                <div className="text-center max-w-sm p-8">
                    <div
                        className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-5">
                        <svg className="w-8 h-8 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-1">Published!</h2>
                    <p className="text-stone-500 dark:text-slate-400 text-sm mb-6">"{title}" is now live.</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={handleReset}
                                className="px-5 py-2.5 bg-white dark:bg-navy-800 border border-stone-200 dark:border-gray-600 text-stone-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-stone-50 dark:hover:bg-navy-700 transition-colors">
                            Write Another
                        </button>
                        <Link to="/blogs"
                              className="px-5 py-2.5 bg-amber-600 dark:bg-teal-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 dark:hover:bg-teal-600 transition-colors">
                            View All Posts
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-navy-950">

            {/* ── Top Bar ── */}
            <header
                className="sticky top-0 z-30 bg-white dark:bg-navy-900 border-b border-stone-200 dark:border-gray-700 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 h-13 flex items-center justify-between gap-4 py-2">
                    <div className="flex items-center text-stone-900 dark:text-white">
                        <Link to="/"
                              className="p-1.5 hover:text-stone-700 dark:hover:text-slate-300 transition-colors rounded">
                            <LeftArrow/>
                        </Link>
                        Back
                    </div>
                    <div className="text-xl font-semibold text-stone-800 dark:text-white">New Post</div>

                    <div className="flex items-center gap-3">
                        {wordCount > 0 && (
                            <span className="text-xs text-stone-400 dark:text-slate-500 hidden sm:block">
                                {wordCount} words · ~{Math.max(1, Math.ceil(wordCount / 200))} min read
                            </span>
                        )}
                        {error && <p className="text-xs text-red-500 max-w-xs truncate">{error}</p>}
                        <button
                            onClick={handlePublish}
                            disabled={!isPublishable}
                            className="px-4 py-2 bg-amber-600 dark:bg-teal-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 dark:hover:bg-teal-600 disabled:bg-stone-200 dark:disabled:bg-gray-700 disabled:text-stone-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                        >
                            {isPublishing ? "Publishing…" : "Publish"}
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_256px] gap-6">

                {/* ── Editor Card ── */}
                <div
                    className="bg-white dark:bg-navy-900 rounded-xl border border-stone-200 dark:border-gray-700 shadow-sm overflow-hidden">

                    <div
                        className="border-b border-stone-100 dark:border-gray-700 px-3 py-2 flex flex-wrap items-center gap-1 bg-stone-50 dark:bg-navy-800"
                        onMouseDown={saveRange}
                    >
                        <select
                            defaultValue=""
                            onChange={(e) => {
                                const val = e.target.value;
                                e.target.value = "";
                                if (val) withRange((range, editor) => formatBlock(val, range, editor));
                            }}
                            className="text-xs text-stone-600 dark:text-slate-300 bg-white dark:bg-navy-950 border border-stone-200 dark:border-gray-600 rounded-md px-2 py-1.5 outline-none cursor-pointer hover:bg-stone-50 dark:hover:bg-navy-900 transition-colors"
                        >
                            <option value="" disabled>Heading</option>
                            <option value="p">Normal</option>
                            <option value="h1">Heading 1</option>
                            <option value="h2">Heading 2</option>
                            <option value="h3">Heading 3</option>
                            <option value="h4">Heading 4</option>
                        </select>

                        <select
                            defaultValue=""
                            onChange={(e) => {
                                const val = e.target.value;
                                e.target.value = "";
                                if (val) withRange((range) => applySpanStyle("fontFamily", val, range));
                            }}
                            className="text-xs text-stone-600 dark:text-slate-300 bg-white dark:bg-navy-950 border border-stone-200 dark:border-gray-600 rounded-md px-2 py-1.5 outline-none cursor-pointer hover:bg-stone-50 dark:hover:bg-navy-900 transition-colors"
                        >
                            <option value="" disabled>Font</option>
                            {FONT_FAMILIES.map((f) => (
                                <option key={f.value} value={f.value} style={{fontFamily: f.value}}>{f.label}</option>
                            ))}
                        </select>

                        <select
                            defaultValue=""
                            onChange={(e) => {
                                const val = e.target.value;
                                e.target.value = "";
                                if (val) withRange((range) => applySpanStyle("fontSize", val, range));
                            }}
                            className="text-xs text-stone-600 dark:text-slate-300 bg-white dark:bg-navy-950 border border-stone-200 dark:border-gray-600 rounded-md px-2 py-1.5 outline-none cursor-pointer hover:bg-stone-50 dark:hover:bg-navy-900 transition-colors"
                        >
                            <option value="" disabled>Size</option>
                            {FONT_SIZES.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>

                        <div className="w-px h-5 bg-stone-200 dark:bg-gray-600 mx-0.5"/>

                        <TBtn
                            onAction={() => withRange((range) => toggleBold(range))}
                            title="Bold"
                        >
                            <b>B</b>
                        </TBtn>

                        <div className="w-px h-5 bg-stone-200 dark:bg-gray-600 mx-0.5"/>

                        <TBtn
                            onAction={() => withRange((range, editor) => formatBlock("pre", range, editor))}
                            title="Code Block"
                        >
                            <span className="font-mono text-xs">&lt;/&gt;</span>
                        </TBtn>

                        <div className="w-px h-5 bg-stone-200 dark:bg-gray-600 mx-0.5"/>

                        <TBtn
                            onAction={() => fileInputRef.current?.click()}
                            title="Upload Image"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                 className="w-4 h-4 inline">
                                <rect x="3" y="3" width="18" height="18" rx="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21 15 16 10 5 21"/>
                            </svg>
                            <span className="ml-1 text-xs">Image</span>
                        </TBtn>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                        />
                    </div>

                    <div className="px-8 pt-8 pb-4">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Post title…"
                            className="w-full text-3xl font-bold text-stone-900 dark:text-white placeholder-stone-300 dark:placeholder-slate-600 outline-none bg-transparent border-b-2 border-transparent focus:border-amber-200 dark:focus:border-teal-400/30 pb-2 transition-colors"
                            style={{fontFamily: "Georgia, serif"}}
                        />
                    </div>

                    <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={handleInput}
                        onKeyUp={handleSelectionChange}
                        onMouseUp={handleSelectionChange}
                        data-placeholder="Start writing your post…"
                        className="px-8 pb-16 pt-2 min-h-[480px] outline-none text-stone-800 dark:text-slate-200"
                        style={{fontFamily: "Georgia, serif", fontSize: "17px", lineHeight: "1.8"}}
                    />
                </div>

                {/* ── Sidebar ── */}
                <div className="space-y-4">
                    <div
                        className="bg-white dark:bg-navy-900 rounded-xl border border-stone-200 dark:border-gray-700 shadow-sm p-4">
                        <h3 className="text-xs font-semibold text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-3">Category</h3>
                        <select
                            value={categoryId}
                            onChange={(e) => {
                                setCategoryId(e.target.value);
                                setSelectedTags([]);
                            }}
                            className="w-full bg-stone-50 dark:bg-navy-950 border border-stone-200 dark:border-gray-600 text-stone-700 dark:text-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400 dark:focus:border-teal-400 transition-colors"
                        >
                            <option value="">Select…</option>
                            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>

                        {availableTags.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-xs font-semibold text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-2">Tags</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {availableTags.map((tag) => {
                                        const sel = selectedTags.find((t) => t.id === tag.id);
                                        return (
                                            <button
                                                key={tag.id}
                                                onClick={() => toggleTag(tag)}
                                                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                                                    sel
                                                        ? "bg-amber-600 dark:bg-teal-500 border-amber-600 dark:border-teal-500 text-white"
                                                        : "bg-white dark:bg-navy-950 border-stone-200 dark:border-gray-600 text-stone-600 dark:text-slate-400 hover:border-amber-300 dark:hover:border-teal-400"
                                                }`}
                                            >
                                                {tag.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div
                        className="bg-white dark:bg-navy-900 rounded-xl border border-stone-200 dark:border-gray-700 shadow-sm p-4">
                        <h3 className="text-xs font-semibold text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-3">Stats</h3>
                        <div className="space-y-2">
                            {[
                                ["Words", wordCount || "—"],
                                ["Read time", wordCount ? `~${Math.max(1, Math.ceil(wordCount / 200))} min` : "—"],
                                ["Category", categoryId ? CATEGORIES.find(c => c.id == categoryId)?.name : "—"],
                                ["Tags", selectedTags.length || "—"],
                            ].map(([label, val]) => (
                                <div key={label} className="flex justify-between">
                                    <span className="text-xs text-stone-400 dark:text-slate-500">{label}</span>
                                    <span
                                        className="text-xs font-medium text-stone-700 dark:text-slate-300">{val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                [contenteditable][data-placeholder]:empty:before {
                    content: attr(data-placeholder);
                    color: #d1d5db;
                    pointer-events: none;
                }
                .dark [contenteditable][data-placeholder]:empty:before {
                    color: #475569;
                }
                [contenteditable] h1 { font-size: 2rem; font-weight: 800; margin: 1.25rem 0 0.5rem; color: #111827; }
                .dark [contenteditable] h1 { color: #f8fafc; }
                [contenteditable] h2 { font-size: 1.5rem; font-weight: 700; margin: 1rem 0 0.5rem; color: #1f2937; }
                .dark [contenteditable] h2 { color: #e2e8f0; }
                [contenteditable] h3 { font-size: 1.25rem; font-weight: 600; margin: 0.75rem 0 0.4rem; color: #374151; }
                .dark [contenteditable] h3 { color: #cbd5e1; }
                [contenteditable] h4 { font-size: 1.1rem; font-weight: 600; margin: 0.5rem 0 0.3rem; color: #4b5563; }
                .dark [contenteditable] h4 { color: #94a3b8; }
                [contenteditable] p  { margin: 0 0 0.75rem; }
                [contenteditable] pre {
                    background: #1e293b; color: #e2e8f0;
                    padding: 1rem 1.25rem; border-radius: 0.5rem;
                    font-family: 'Courier New', monospace; font-size: 0.875rem;
                    margin: 1rem 0; overflow-x: auto; white-space: pre-wrap;
                }
                .dark [contenteditable] pre {
                    background: #0f172a; color: #cbd5e1;
                }
                [contenteditable] img { max-width: 100%; border-radius: 0.5rem; margin: 0.75rem 0; border: 1px solid #e5e7eb; display: block; }
                .dark [contenteditable] img { border-color: #374151; }
                [contenteditable]:focus { outline: none; }
            `}</style>
        </div>
    );
}
