import { useState, useRef, useCallback } from "react";
import { Link } from "react-router";
import { supabase } from "../util/supabaseClient.js";

// ─── Static Data ──────────────────────────────────────────────────────────────
const CATEGORIES = [
    { id: 1, name: "Technology" }, { id: 2, name: "Lifestyle" },
    { id: 3, name: "Travel" },     { id: 4, name: "Music" },
    { id: 5, name: "Food" },       { id: 6, name: "Fashion" },
    { id: 7, name: "Health" },     { id: 8, name: "Sports" },
    { id: 9, name: "Education" },  { id: 10, name: "Finance" },
];

const TAGS_BY_CATEGORY = {
    1: [{ id:1,name:"Java"},{ id:2,name:"Python"},{ id:3,name:"JavaScript"},{ id:4,name:"React"},{ id:5,name:"Node.js"},{ id:6,name:"Docker"}],
    2: [{ id:7,name:"Wellness"},{ id:8,name:"Minimalism"},{ id:9,name:"Productivity"}],
    3: [{ id:10,name:"Adventure"},{ id:11,name:"Backpacking"},{ id:12,name:"Budget Travel"}],
    4: [{ id:13,name:"Indie"},{ id:14,name:"Jazz"},{ id:15,name:"Classical"}],
    5: [{ id:16,name:"Recipes"},{ id:17,name:"Vegan"},{ id:18,name:"Street Food"}],
    6: [{ id:19,name:"Trends"},{ id:20,name:"Sustainable"},{ id:21,name:"Vintage"}],
    7: [{ id:22,name:"Fitness"},{ id:23,name:"Mental Health"},{ id:24,name:"Nutrition"}],
    8: [{ id:25,name:"Football"},{ id:26,name:"Basketball"},{ id:27,name:"Running"}],
    9: [{ id:28,name:"Online Learning"},{ id:29,name:"Tutorials"},{ id:30,name:"Research"}],
    10:[{ id:31,name:"Investing"},{ id:32,name:"Crypto"},{ id:33,name:"Budgeting"}],
};

const FONT_FAMILIES = [
    { label: "Default",    value: "Georgia, serif" },
    { label: "Sans-serif", value: "Arial, sans-serif" },
    { label: "Monospace",  value: "'Courier New', monospace" },
    { label: "Serif",      value: "'Times New Roman', serif" },
    { label: "Modern",     value: "'Trebuchet MS', sans-serif" },
];

const FONT_SIZES = [
    { label: "Small",   value: "13px" },
    { label: "Normal",  value: "17px" },
    { label: "Medium",  value: "20px" },
    { label: "Large",   value: "24px" },
    { label: "X-Large", value: "30px" },
    { label: "Huge",    value: "38px" },
];

const BLOCK_TAGS = new Set(["p", "h1", "h2", "h3", "h4", "pre", "blockquote", "div"]);

// ─── DOM → Markdown serializer ────────────────────────────────────────────────
function nodeToMarkdown(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const tag = node.tagName.toLowerCase();
    const inner = Array.from(node.childNodes).map(nodeToMarkdown).join("");
    switch (tag) {
        case "h1": return `# ${inner}\n\n`;
        case "h2": return `## ${inner}\n\n`;
        case "h3": return `### ${inner}\n\n`;
        case "h4": return `#### ${inner}\n\n`;
        case "p":  return `${inner}\n\n`;
        case "br": return "\n";
        case "strong": case "b": return `**${inner}**`;
        case "em": case "i":     return `*${inner}*`;
        case "code": return node.parentElement?.tagName?.toLowerCase() === "pre" ? inner : `\`${inner}\``;
        case "pre":  return "```\n" + inner + "\n```\n\n";
        case "ul":   return Array.from(node.children).map(li => `- ${nodeToMarkdown(li).trim()}`).join("\n") + "\n\n";
        case "ol":   return Array.from(node.children).map((li, i) => `${i+1}. ${nodeToMarkdown(li).trim()}`).join("\n") + "\n\n";
        case "li":   return inner;
        case "a":    return `[${inner}](${node.getAttribute("href") || ""})`;
        case "img":  return `![${node.getAttribute("alt") || ""}](${node.getAttribute("src") || ""})\n\n`;
        case "hr":   return `---\n\n`;
        case "blockquote": return inner.split("\n").filter(Boolean).map(l => `> ${l}`).join("\n") + "\n\n";
        case "span": return inner; // strip span wrappers, they don't map to markdown
        default:     return inner + "\n";
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

/** Snapshot the current browser selection as a cloned Range */
function getActiveRange() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    return sel.getRangeAt(0).cloneRange();
}

/** Make a previously saved Range the active browser selection */
function applyRange(range) {
    if (!range) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

/**
 * Walk up the DOM to find the nearest block-level element
 * whose direct parent is the editor root.
 */
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

/** Walk up to find the nearest ancestor with a given tag name */
function findAncestor(node, tagName) {
    let current = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    while (current) {
        if (current.tagName?.toLowerCase() === tagName) return current;
        current = current.parentElement;
    }
    return null;
}

/** Replace a node with its own children (remove wrapper, keep contents) */
function unwrapNode(node) {
    const parent = node.parentNode;
    while (node.firstChild) parent.insertBefore(node.firstChild, node);
    parent.removeChild(node);
}

// ─── Core editing operations ──────────────────────────────────────────────────

/**
 * BOLD — toggle <strong> on the current selection.
 * Already bold → unwrap. Not bold → wrap in <strong>.
 */
function toggleBold(range) {
    if (!range || range.collapsed) return;

    const ancestor = findAncestor(range.commonAncestorContainer, "strong");
    if (ancestor) {
        // Remove bold: replace <strong> with its children
        unwrapNode(ancestor);
        return;
    }

    // Add bold: pull out selected nodes, wrap in <strong>, re-insert
    const fragment = range.extractContents();
    const strong = document.createElement("strong");
    strong.appendChild(fragment);
    range.insertNode(strong);

    // Restore selection around new <strong>
    const newRange = document.createRange();
    newRange.selectNodeContents(strong);
    applyRange(newRange);
}

/**
 * FORMAT BLOCK — change the block tag wrapping the cursor.
 * <p>Hello</p>  →  <h2>Hello</h2>
 */
function formatBlock(tag, range, editorEl) {
    if (!range) return;

    const block = getBlockAncestor(range.commonAncestorContainer, editorEl);

    if (block) {
        // Swap the tag, keep inner HTML
        const newBlock = document.createElement(tag);
        newBlock.innerHTML = block.innerHTML;
        block.replaceWith(newBlock);

        // Move cursor to end of new block
        const newRange = document.createRange();
        newRange.selectNodeContents(newBlock);
        newRange.collapse(false);
        applyRange(newRange);
    } else {
        // No block ancestor found — wrap selected content directly
        const newBlock = document.createElement(tag);
        newBlock.appendChild(
            range.collapsed
                ? document.createTextNode("\u200B") // zero-width space so cursor has somewhere to land
                : range.extractContents()
        );
        range.insertNode(newBlock);

        const newRange = document.createRange();
        newRange.selectNodeContents(newBlock);
        newRange.collapse(false);
        applyRange(newRange);
    }
}

/**
 * SPAN STYLE — apply font-family or font-size to the selected text.
 * Wraps selection in <span style="...">. If already wrapped, updates in place.
 * styleKey: "fontFamily" | "fontSize"
 */
function applySpanStyle(styleKey, styleValue, range) {
    if (!range || range.collapsed) return;

    // If the selection is already inside a styled span, just update it
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

/**
 * INSERT IMAGE — place an <img> wrapped in a <p> at the cursor position.
 */
function insertImageAtRange(src, range, editorEl) {
    // Fall back to end of editor if no range saved
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

    // Move cursor to after the image paragraph
    const newRange = document.createRange();
    newRange.setStartAfter(p);
    newRange.collapse(true);
    applyRange(newRange);
}

// ─── Toolbar Button ───────────────────────────────────────────────────────────
function TBtn({ onAction, title, children }) {
    return (
        <button
            onMouseDown={(e) => {
                e.preventDefault(); // keeps editor focused & selection intact
                onAction();
            }}
            title={title}
            className="px-2.5 py-1.5 rounded text-sm font-medium transition-colors select-none text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent"
        >
            {children}
        </button>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PostEditor() {
    const editorRef     = useRef(null);
    const fileInputRef  = useRef(null);
    const savedRangeRef = useRef(null); // persists selection across toolbar interactions

    const [title, setTitle]               = useState("");
    const [categoryId, setCategoryId]     = useState("");
    const [selectedTags, setSelectedTags] = useState([]);
    const [isPublishing, setIsPublishing] = useState(false);
    const [published, setPublished]       = useState(false);
    const [error, setError]               = useState(null);
    const [wordCount, setWordCount]       = useState(0);

    const availableTags = categoryId ? TAGS_BY_CATEGORY[parseInt(categoryId)] || [] : [];

    // Called on the toolbar wrapper's onMouseDown — saves selection before focus moves away
    const saveRange = useCallback(() => {
        savedRangeRef.current = getActiveRange();
    }, []);

    // Restore saved range, run the operation, then refocus the editor
    const withRange = useCallback((fn) => {
        applyRange(savedRangeRef.current);
        fn(savedRangeRef.current, editorRef.current);
        editorRef.current?.focus();
        savedRangeRef.current = getActiveRange();
    }, []);

    // Keep savedRangeRef fresh while the user moves the cursor inside the editor
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

    // ── Image upload → base64 → insert at saved cursor position ──────────────
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

    // ── Publish ───────────────────────────────────────────────────────────────
    const handlePublish = async () => {
        setIsPublishing(true);
        setError(null);
        try {
            const markdown = serializeToMarkdown(editorRef.current);
            const { data: post, error: postError } = await supabase
                .from("posts")
                .insert({ title, content: markdown, category_id: parseInt(categoryId) })
                .select()
                .single();
            if (postError) throw postError;

            if (selectedTags.length > 0) {
                const { error: tagError } = await supabase
                    .from("post_tags")
                    .insert(selectedTags.map((t) => ({ post_id: post.id, tag_id: t.id })));
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
        setCategoryId(""); setSelectedTags([]);
        setPublished(false); setError(null); setWordCount(0);
        savedRangeRef.current = null;
    };

    const toggleTag = (tag) =>
        setSelectedTags((prev) =>
            prev.find((t) => t.id === tag.id) ? prev.filter((t) => t.id !== tag.id) : [...prev, tag]
        );

    const isPublishable = title.trim() && wordCount > 0 && categoryId && !isPublishing;

    // ── Published screen ──────────────────────────────────────────────────────
    if (published) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-sm p-8">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Published!</h2>
                    <p className="text-gray-500 text-sm mb-6">"{title}" is now live.</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={handleReset} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                            Write Another
                        </button>
                        <Link to="/blogs" className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
                            View All Posts
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Top Bar ── */}
            <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 h-13 flex items-center justify-between gap-4 py-2">
                    <div className="flex items-center gap-2">
                        <Link to="/" className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors rounded">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                <path d="M15 19l-7-7 7-7"/>
                            </svg>
                        </Link>
                        <span className="text-sm font-semibold text-gray-800">New Post</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {wordCount > 0 && (
                            <span className="text-xs text-gray-400 hidden sm:block">
                                {wordCount} words · ~{Math.max(1, Math.ceil(wordCount / 200))} min read
                            </span>
                        )}
                        {error && <p className="text-xs text-red-500 max-w-xs truncate">{error}</p>}
                        <button
                            onClick={handlePublish}
                            disabled={!isPublishable}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {isPublishing ? "Publishing…" : "Publish"}
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_256px] gap-6">

                {/* ── Editor Card ── */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                    {/*
                        Toolbar — onMouseDown on the wrapper fires BEFORE the editor loses focus.
                        saveRange() snapshots the selection. Then each control calls withRange()
                        which restores it before running the operation.
                    */}
                    <div
                        className="border-b border-gray-100 px-3 py-2 flex flex-wrap items-center gap-1 bg-gray-50"
                        onMouseDown={saveRange}
                    >
                        {/* Heading / block format */}
                        <select
                            defaultValue=""
                            onChange={(e) => {
                                const val = e.target.value;
                                e.target.value = "";
                                if (val) withRange((range, editor) => formatBlock(val, range, editor));
                            }}
                            className="text-xs text-gray-600 bg-white border border-gray-200 rounded-md px-2 py-1.5 outline-none cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <option value="" disabled>Heading</option>
                            <option value="p">Normal</option>
                            <option value="h1">Heading 1</option>
                            <option value="h2">Heading 2</option>
                            <option value="h3">Heading 3</option>
                            <option value="h4">Heading 4</option>
                        </select>

                        {/* Font family */}
                        <select
                            defaultValue=""
                            onChange={(e) => {
                                const val = e.target.value;
                                e.target.value = "";
                                if (val) withRange((range) => applySpanStyle("fontFamily", val, range));
                            }}
                            className="text-xs text-gray-600 bg-white border border-gray-200 rounded-md px-2 py-1.5 outline-none cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <option value="" disabled>Font</option>
                            {FONT_FAMILIES.map((f) => (
                                <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
                            ))}
                        </select>

                        {/* Font size */}
                        <select
                            defaultValue=""
                            onChange={(e) => {
                                const val = e.target.value;
                                e.target.value = "";
                                if (val) withRange((range) => applySpanStyle("fontSize", val, range));
                            }}
                            className="text-xs text-gray-600 bg-white border border-gray-200 rounded-md px-2 py-1.5 outline-none cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <option value="" disabled>Size</option>
                            {FONT_SIZES.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>

                        <div className="w-px h-5 bg-gray-200 mx-0.5" />

                        {/* Bold */}
                        <TBtn
                            onAction={() => withRange((range) => toggleBold(range))}
                            title="Bold"
                        >
                            <b>B</b>
                        </TBtn>

                        <div className="w-px h-5 bg-gray-200 mx-0.5" />

                        {/* Code block */}
                        <TBtn
                            onAction={() => withRange((range, editor) => formatBlock("pre", range, editor))}
                            title="Code Block"
                        >
                            <span className="font-mono text-xs">&lt;/&gt;</span>
                        </TBtn>

                        <div className="w-px h-5 bg-gray-200 mx-0.5" />

                        {/* Image upload */}
                        <TBtn
                            onAction={() => fileInputRef.current?.click()}
                            title="Upload Image"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 inline">
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

                    {/* Title */}
                    <div className="px-8 pt-8 pb-4">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Post title…"
                            className="w-full text-3xl font-bold text-gray-900 placeholder-gray-300 outline-none bg-transparent border-b-2 border-transparent focus:border-indigo-200 pb-2 transition-colors"
                            style={{ fontFamily: "Georgia, serif" }}
                        />
                    </div>

                    {/* Content editable */}
                    <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={handleInput}
                        onKeyUp={handleSelectionChange}
                        onMouseUp={handleSelectionChange}
                        data-placeholder="Start writing your post…"
                        className="px-8 pb-16 pt-2 min-h-[480px] outline-none text-gray-800"
                        style={{ fontFamily: "Georgia, serif", fontSize: "17px", lineHeight: "1.8" }}
                    />
                </div>

                {/* ── Sidebar ── */}
                <div className="space-y-4">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Category</h3>
                        <select
                            value={categoryId}
                            onChange={(e) => { setCategoryId(e.target.value); setSelectedTags([]); }}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 transition-colors"
                        >
                            <option value="">Select…</option>
                            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>

                        {availableTags.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tags</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {availableTags.map((tag) => {
                                        const sel = selectedTags.find((t) => t.id === tag.id);
                                        return (
                                            <button
                                                key={tag.id}
                                                onClick={() => toggleTag(tag)}
                                                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                                                    sel
                                                        ? "bg-indigo-600 border-indigo-600 text-white"
                                                        : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"
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

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Stats</h3>
                        <div className="space-y-2">
                            {[
                                ["Words", wordCount || "—"],
                                ["Read time", wordCount ? `~${Math.max(1, Math.ceil(wordCount / 200))} min` : "—"],
                                ["Category", categoryId ? CATEGORIES.find(c => c.id == categoryId)?.name : "—"],
                                ["Tags", selectedTags.length || "—"],
                            ].map(([label, val]) => (
                                <div key={label} className="flex justify-between">
                                    <span className="text-xs text-gray-400">{label}</span>
                                    <span className="text-xs font-medium text-gray-700">{val}</span>
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
                [contenteditable] h1 { font-size: 2rem; font-weight: 800; margin: 1.25rem 0 0.5rem; color: #111827; }
                [contenteditable] h2 { font-size: 1.5rem; font-weight: 700; margin: 1rem 0 0.5rem; color: #1f2937; }
                [contenteditable] h3 { font-size: 1.25rem; font-weight: 600; margin: 0.75rem 0 0.4rem; color: #374151; }
                [contenteditable] h4 { font-size: 1.1rem; font-weight: 600; margin: 0.5rem 0 0.3rem; color: #4b5563; }
                [contenteditable] p  { margin: 0 0 0.75rem; }
                [contenteditable] pre {
                    background: #1e293b; color: #e2e8f0;
                    padding: 1rem 1.25rem; border-radius: 0.5rem;
                    font-family: 'Courier New', monospace; font-size: 0.875rem;
                    margin: 1rem 0; overflow-x: auto; white-space: pre-wrap;
                }
                [contenteditable] img { max-width: 100%; border-radius: 0.5rem; margin: 0.75rem 0; border: 1px solid #e5e7eb; display: block; }
                [contenteditable]:focus { outline: none; }
            `}</style>
        </div>
    );
}