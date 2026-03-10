import {useState, useRef, useCallback, useEffect} from "react";
import {Link} from "react-router";
import {supabase} from "../../util/supabaseClient.js";
import {LeftArrow} from "../../icons/index.jsx";
import {CATEGORIES, FONT_FAMILIES, FONT_SIZES, TAGS_BY_CATEGORY} from "../constants/BlogConstants.js";
import TBtn from "./TBtn.jsx";
import {v4 as uuidv4} from 'uuid';

const BLOCK_TAGS = new Set(["p", "h1", "h2", "h3", "h4", "pre", "blockquote", "div"]);

// ─── Slash command menu items ─────────────────────────────────────────────────
const SLASH_COMMANDS = [
    {
        id: "text",
        label: "Text",
        description: "Start writing with plain text",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M4 7V4h16v3M9 20h6M12 4v16"/>
            </svg>
        ),
        action: (range, editor) => formatBlock("p", range, editor),
    },
    {
        id: "h1",
        label: "Heading 1",
        description: "Big heading",
        icon: <span className="text-sm font-black">H1</span>,
        action: (range, editor) => formatBlock("h1", range, editor),
    },
    {
        id: "h2",
        label: "Heading 2",
        description: "Medium heading",
        icon: <span className="text-sm font-black">H2</span>,
        action: (range, editor) => formatBlock("h2", range, editor),
    },
    {
        id: "h3",
        label: "Heading 3",
        description: "Small heading",
        icon: <span className="text-sm font-black">H3</span>,
        action: (range, editor) => formatBlock("h3", range, editor),
    },
    {
        id: "bullet",
        label: "Bullet List",
        description: "Create a simple bullet list",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/>
                <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/>
                <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/>
                <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/>
            </svg>
        ),
        action: (range, editor) => insertList("ul", range, editor),
    },
    {
        id: "numbered",
        label: "Numbered List",
        description: "Create a numbered list",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/>
                <path d="M4 6h1v4M4 10h2M4 15.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1L4 18h2" strokeLinecap="round"/>
            </svg>
        ),
        action: (range, editor) => insertList("ol", range, editor),
    },
    {
        id: "quote",
        label: "Quote",
        description: "Capture a quote",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
            </svg>
        ),
        action: (range, editor) => formatBlock("blockquote", range, editor),
    },
    {
        id: "code",
        label: "Code",
        description: "Capture a code snippet",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
        ),
        action: (range, editor) => formatBlock("pre", range, editor),
    },
    {
        id: "divider",
        label: "Divider",
        description: "Visually divide blocks",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <line x1="3" y1="12" x2="21" y2="12"/>
            </svg>
        ),
        action: (range, editor) => insertDivider(range, editor),
    },
];

// ─── DOM → Markdown serializer ────────────────────────────────────────────────

// Extracts pure plain text from a node — used inside <pre> so no ** or ` leaks in
function nodeToPlainText(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    if (node.tagName.toLowerCase() === "br") return "\n";
    return Array.from(node.childNodes).map(nodeToPlainText).join("");
}

function nodeToMarkdown(node, insideList = false) {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const tag = node.tagName.toLowerCase();
    // <pre> must use plain text only — never process child strong/em/etc.
    if (tag === "pre") return "```\n" + nodeToPlainText(node) + "\n```\n\n";
    const inner = Array.from(node.childNodes).map(n => nodeToMarkdown(n, insideList || tag === "li" || tag === "ul" || tag === "ol")).join("");
    const align = node.style?.textAlign;
    const wrapAlign = (md) => align ? `<div style="text-align:${align}">\n\n${md.trim()}\n\n</div>\n\n` : md;
    switch (tag) {
        case "h1": return wrapAlign(`# ${inner}\n\n`);
        case "h2": return wrapAlign(`## ${inner}\n\n`);
        case "h3": return wrapAlign(`### ${inner}\n\n`);
        case "h4": return wrapAlign(`#### ${inner}\n\n`);
        case "p": return wrapAlign(`${inner}\n\n`);
        case "br": return "\n";
        case "strong": case "b": return `**${inner}**`;
        case "em": case "i": return `*${inner}*`;
        case "code":
            if (node.parentElement?.tagName?.toLowerCase() === "pre") return inner;
            if (insideList) return inner;
            return `\`${inner}\``;
        case "ul": return Array.from(node.children).map(li => `- ${nodeToMarkdown(li, true).trim()}`).join("\n") + "\n\n";
        case "ol": return Array.from(node.children).map((li, i) => `${i + 1}. ${nodeToMarkdown(li, true).trim()}`).join("\n") + "\n\n";
        case "li": return inner;
        case "a": return `[${inner}](${node.getAttribute("href") || ""})`;
        case "img": return `![${node.getAttribute("alt") || ""}](${node.getAttribute("src") || ""})\n\n`;
        case "hr": return `---\n\n`;
        case "blockquote": return inner.split("\n").filter(Boolean).map(l => `> ${l}`).join("\n") + "\n\n";
        case "span": return inner;
        default: return inner + "\n";
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
    if (ancestor) { unwrapNode(ancestor); return; }
    const fragment = range.extractContents();
    const strong = document.createElement("strong");
    strong.appendChild(fragment);
    range.insertNode(strong);
    const newRange = document.createRange();
    newRange.selectNodeContents(strong);
    applyRange(newRange);
}

function toggleItalic(range) {
    if (!range || range.collapsed) return;
    const ancestor = findAncestor(range.commonAncestorContainer, "em");
    if (ancestor) { unwrapNode(ancestor); return; }
    const fragment = range.extractContents();
    const em = document.createElement("em");
    em.appendChild(fragment);
    range.insertNode(em);
    const newRange = document.createRange();
    newRange.selectNodeContents(em);
    applyRange(newRange);
}

function toggleInlineCode(range) {
    if (!range || range.collapsed) return;
    const ancestor = findAncestor(range.commonAncestorContainer, "code");
    if (ancestor && ancestor.parentElement?.tagName?.toLowerCase() !== "pre") {
        unwrapNode(ancestor); return;
    }
    const fragment = range.extractContents();
    const code = document.createElement("code");
    code.appendChild(fragment);
    range.insertNode(code);
    const newRange = document.createRange();
    newRange.selectNodeContents(code);
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
        newBlock.appendChild(range.collapsed ? document.createTextNode("\u200B") : range.extractContents());
        range.insertNode(newBlock);
        const newRange = document.createRange();
        newRange.selectNodeContents(newBlock);
        newRange.collapse(false);
        applyRange(newRange);
    }
}

function insertList(listTag, range, editorEl) {
    if (!range) return;
    const block = getBlockAncestor(range.commonAncestorContainer, editorEl);
    const list = document.createElement(listTag);
    const li = document.createElement("li");
    li.appendChild(document.createTextNode(block?.innerText || "\u200B"));
    list.appendChild(li);
    if (block) {
        block.replaceWith(list);
    } else {
        range.insertNode(list);
    }
    const newRange = document.createRange();
    newRange.selectNodeContents(li);
    newRange.collapse(false);
    applyRange(newRange);
}

function insertDivider(range, editorEl) {
    const targetRange = range ?? (() => {
        const r = document.createRange();
        r.selectNodeContents(editorEl);
        r.collapse(false);
        return r;
    })();
    const hr = document.createElement("hr");
    const p = document.createElement("p");
    p.appendChild(document.createTextNode("\u200B"));
    targetRange.collapse(false);
    targetRange.insertNode(p);
    targetRange.insertNode(hr);
    const newRange = document.createRange();
    newRange.selectNodeContents(p);
    newRange.collapse(false);
    applyRange(newRange);
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

function alignBlock(alignment, editorEl) {
    if (!editorEl) return;

    // Read cursor position directly from DOM — don't rely on saved range
    const sel = window.getSelection();
    let node = null;

    if (sel && sel.rangeCount > 0) {
        node = sel.getRangeAt(0).commonAncestorContainer;
    }

    // Fall back to any focused element inside editor
    if (!node) node = document.activeElement;
    if (!node) return;

    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;

    // Walk up to find all elements inside editorEl
    const ancestors = [];
    let current = node;
    while (current && current !== editorEl) {
        ancestors.push(current);
        current = current.parentElement;
    }

    if (ancestors.length === 0) return;

    // Clear text-align on ALL ancestors
    ancestors.forEach(el => { if (el.style) el.style.textAlign = ""; });

    // Target = the direct child of editorEl (outermost block)
    const target = ancestors[ancestors.length - 1];
    if (!target) return;

    if (target.style.textAlign === alignment) {
        target.style.textAlign = "";
    } else {
        target.style.textAlign = alignment;
    }
}

function insertImageAtRange(src, range, editorEl) {
    const targetRange = range ?? (() => {
        const r = document.createRange();
        r.selectNodeContents(editorEl);
        r.collapse(false);
        return r;
    })();
    const img = document.createElement("img");
    img.src = src; img.alt = "";
    const p = document.createElement("p");
    p.appendChild(img);
    targetRange.collapse(false);
    targetRange.insertNode(p);
    const newRange = document.createRange();
    newRange.setStartAfter(p);
    newRange.collapse(true);
    applyRange(newRange);
}

// ─── Floating toolbar ─────────────────────────────────────────────────────────
function FloatingToolbar({ position, onBold, onItalic, onInlineCode, onLink }) {
    if (!position) return null;
    return (
        <div
            className="fixed z-50 flex items-center gap-0.5 bg-stone-900 dark:bg-stone-950 rounded-lg shadow-xl border border-stone-700 px-1.5 py-1"
            style={{ top: position.top, left: position.left, transform: "translateX(-50%)" }}
        >
            <button onMouseDown={(e) => { e.preventDefault(); onBold(); }}
                    className="p-1.5 text-white hover:bg-stone-700 rounded text-sm font-bold w-7 h-7 flex items-center justify-center transition-colors" title="Bold">B</button>
            <button onMouseDown={(e) => { e.preventDefault(); onItalic(); }}
                    className="p-1.5 text-white hover:bg-stone-700 rounded text-sm italic w-7 h-7 flex items-center justify-center transition-colors" title="Italic">I</button>
            <div className="w-px h-4 bg-stone-600 mx-0.5" />
            <button onMouseDown={(e) => { e.preventDefault(); onInlineCode(); }}
                    className="p-1.5 text-white hover:bg-stone-700 rounded font-mono text-xs w-7 h-7 flex items-center justify-center transition-colors" title="Inline Code">{"`"}</button>
            <button onMouseDown={(e) => { e.preventDefault(); onLink(); }}
                    className="p-1.5 text-white hover:bg-stone-700 rounded text-xs w-7 h-7 flex items-center justify-center transition-colors" title="Link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
            </button>
        </div>
    );
}

// ─── Slash Command Menu ───────────────────────────────────────────────────────
function SlashMenu({ position, query, onSelect, onClose }) {
    const [activeIdx, setActiveIdx] = useState(0);
    const filtered = SLASH_COMMANDS.filter(c =>
        !query || c.label.toLowerCase().includes(query.toLowerCase()) || c.description.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => { setActiveIdx(0); }, [query]);

    useEffect(() => {
        const handler = (e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filtered.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
            else if (e.key === "Enter") { e.preventDefault(); if (filtered[activeIdx]) onSelect(filtered[activeIdx]); }
            else if (e.key === "Escape") { onClose(); }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [filtered, activeIdx, onSelect, onClose]);

    if (!position || filtered.length === 0) return null;

    return (
        <div
            className="fixed z-50 bg-white dark:bg-stone-900 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden w-64"
            style={{ top: position.top, left: position.left }}
        >
            <div className="px-3 py-2 border-b border-stone-100 dark:border-stone-800">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Insert block</span>
            </div>
            <div className="py-1 max-h-72 overflow-y-auto">
                {filtered.map((cmd, i) => (
                    <button
                        key={cmd.id}
                        onMouseDown={(e) => { e.preventDefault(); onSelect(cmd); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                            i === activeIdx
                                ? "bg-amber-50 dark:bg-stone-800"
                                : "hover:bg-stone-50 dark:hover:bg-stone-800/60"
                        }`}
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                            i === activeIdx
                                ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400"
                                : "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400"
                        }`}>
                            {cmd.icon}
                        </div>
                        <div>
                            <div className="text-sm font-medium text-stone-800 dark:text-stone-200">{cmd.label}</div>
                            <div className="text-xs text-stone-400 dark:text-stone-500">{cmd.description}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PostEditor() {
    const editorRef = useRef(null);
    const titleRef = useRef(null);
    const fileInputRef = useRef(null);
    const savedRangeRef = useRef(null);
    const slashStartRef = useRef(null);

    const [title, setTitle] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [selectedTags, setSelectedTags] = useState([]);
    const [isPublishing, setIsPublishing] = useState(false);
    const [published, setPublished] = useState(false);
    const [error, setError] = useState(null);
    const [wordCount, setWordCount] = useState(0);
    const [categories, setCategories] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);
    // First image inserted in the editor is used as cover
    const [coverFile, setCoverFile] = useState(null);

    // Slash menu state
    const [slashMenuPos, setSlashMenuPos] = useState(null);
    const [slashQuery, setSlashQuery] = useState("");

    // Floating toolbar state
    const [floatingPos, setFloatingPos] = useState(null);

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
        if (!sel || sel.rangeCount === 0) { setFloatingPos(null); return; }
        const range = sel.getRangeAt(0);
        if (!editorRef.current?.contains(range.commonAncestorContainer)) { setFloatingPos(null); return; }
        savedRangeRef.current = range.cloneRange();

        if (!sel.isCollapsed && sel.toString().trim().length > 0) {
            const rect = range.getBoundingClientRect();
            setFloatingPos({
                top: rect.top + window.scrollY - 48,
                left: rect.left + window.scrollX + rect.width / 2,
            });
        } else {
            setFloatingPos(null);
        }
    }, []);

    const handleInput = useCallback(() => {
        const text = editorRef.current?.innerText || "";
        setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    }, []);

    // Allowed tags to keep structure; everything else gets its content preserved but tag stripped
    const KEEP_TAGS = new Set(["p","h1","h2","h3","h4","h5","h6","br","hr","ul","ol","li","blockquote","pre","code","strong","b","em","i","u","a","img","figure","figcaption","table","thead","tbody","tr","th","td"]);

    const cleanNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) return node.cloneNode();
        if (node.nodeType !== Node.ELEMENT_NODE) return null;

        const tag = node.tagName.toLowerCase();

        // Always drop scripts, styles, meta etc.
        if (["script","style","meta","link","head","noscript","iframe"].includes(tag)) return null;

        const frag = document.createDocumentFragment();
        node.childNodes.forEach(child => {
            const cleaned = cleanNode(child);
            if (cleaned) frag.appendChild(cleaned);
        });

        if (!KEEP_TAGS.has(tag)) {
            // Unknown tag: unwrap — just keep its children
            return frag;
        }

        const el = document.createElement(tag === "h5" || tag === "h6" ? "h4" : tag);

        // Only preserve safe attributes — explicitly NO style/class/id
        if (tag === "a") {
            const href = node.getAttribute("href");
            if (href && !href.startsWith("javascript:")) {
                el.setAttribute("href", href);
                el.setAttribute("target", "_blank");
                el.setAttribute("rel", "noopener noreferrer");
            }
        }
        if (tag === "img") {
            const src = node.getAttribute("src");
            const alt = node.getAttribute("alt") || "";
            if (src) { el.setAttribute("src", src); el.setAttribute("alt", alt); }
        }
        if (tag === "td" || tag === "th") {
            ["colspan","rowspan"].forEach(attr => {
                if (node.hasAttribute(attr)) el.setAttribute(attr, node.getAttribute(attr));
            });
        }
        // Explicitly ensure no text-align or any style leaks through
        el.removeAttribute("style");
        el.removeAttribute("class");
        el.removeAttribute("id");
        el.appendChild(frag);
        return el;
    };

    const handlePaste = useCallback((e) => {
        e.preventDefault();
        const clipData = e.clipboardData;
        if (!clipData) return;

        const html = clipData.getData("text/html");
        const text = clipData.getData("text/plain");

        // Strip text-align from every element in a fragment
        const stripAlignment = (frag) => {
            const tmp = document.createElement("div");
            tmp.appendChild(frag);
            tmp.querySelectorAll("*").forEach(el => {
                el.style.textAlign = "";
                el.style.removeProperty("text-align");
                // Also remove align attribute (old HTML)
                el.removeAttribute("align");
            });
            const result = document.createDocumentFragment();
            while (tmp.firstChild) result.appendChild(tmp.firstChild);
            return result;
        };

        let fragment;

        if (html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            fragment = document.createDocumentFragment();
            doc.body.childNodes.forEach(child => {
                const cleaned = cleanNode(child);
                if (cleaned) fragment.appendChild(cleaned);
            });

            if (!fragment.textContent.trim()) {
                fragment = null;
            } else {
                fragment = stripAlignment(fragment);
            }
        }

        if (!fragment) {
            fragment = document.createDocumentFragment();
            const lines = text.split(/\n/);
            lines.forEach((line, i) => {
                if (line.trim() === "" && i > 0 && i < lines.length - 1) return;
                const p = document.createElement("p");
                p.textContent = line || "\u200B";
                fragment.appendChild(p);
            });
        }

        // Insert at current cursor position
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(fragment);

        // Move cursor to end of inserted content
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
        savedRangeRef.current = range.cloneRange();
        handleInput();
    }, [handleInput]);

    const handleKeyDown = useCallback((e) => {
        // Ctrl/Cmd shortcuts
        if (e.ctrlKey || e.metaKey) {
            if (e.key === "z" || e.key === "y" || (e.key === "Z")) {
                editorRef.current?.focus();
                return; // let native undo/redo fire
            }
            if (e.key === "b") {
                e.preventDefault();
                withRange((range) => toggleBold(range));
                return;
            }
            if (e.key === "i") {
                e.preventDefault();
                withRange((range) => toggleItalic(range));
                return;
            }
        }

        // Handle slash command trigger
        if (e.key === "/" && !slashMenuPos) {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return;
            const range = sel.getRangeAt(0);
            if (!editorRef.current?.contains(range.commonAncestorContainer)) return;

            // Only trigger if at line start or after whitespace
            const before = range.startContainer.textContent?.slice(0, range.startOffset) || "";
            if (before === "" || before.endsWith(" ") || before.endsWith("\n")) {
                const rect = range.getBoundingClientRect();
                slashStartRef.current = range.cloneRange();
                setSlashQuery("");
                setSlashMenuPos({ top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX });
            }
            return;
        }

        if (slashMenuPos) {
            if (e.key === "Backspace") {
                if (slashQuery.length > 0) {
                    setSlashQuery(q => q.slice(0, -1));
                } else {
                    closeSlashMenu();
                }
            } else if (e.key === " " || e.key === "Escape") {
                closeSlashMenu();
            } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                setSlashQuery(q => q + e.key);
            }
        }

        // Tab in list items — indent
        if (e.key === "Tab") {
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
                const li = findAncestor(sel.getRangeAt(0).commonAncestorContainer, "li");
                if (li) {
                    e.preventDefault();
                    document.execCommand("indent");
                }
            }
        }

        // Enter key — always produce clean <p> blocks
        if (e.key === "Enter" && !e.shiftKey) {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return;
            const range = sel.getRangeAt(0);
            if (!editorRef.current?.contains(range.commonAncestorContainer)) return;

            const li    = findAncestor(range.commonAncestorContainer, "li");
            const pre   = findAncestor(range.commonAncestorContainer, "pre");
            const bq    = findAncestor(range.commonAncestorContainer, "blockquote");

            // Inside <pre>: let the browser insert a newline naturally
            if (pre) return;

            // Inside <li>: if the li is empty, break out of the list into a <p>
            if (li) {
                const liText = li.textContent.replace(/\u200B/g, "").trim();
                if (liText === "") {
                    e.preventDefault();
                    const list = li.parentElement;
                    const p = document.createElement("p");
                    p.appendChild(document.createTextNode("\u200B"));
                    // Insert the <p> after the list if li is the last item, else split
                    if (!li.nextElementSibling) {
                        list.parentNode.insertBefore(p, list.nextSibling);
                    } else {
                        // Split the list
                        const newList = document.createElement(list.tagName.toLowerCase());
                        while (li.nextElementSibling) newList.appendChild(li.nextElementSibling);
                        list.parentNode.insertBefore(p, list.nextSibling);
                        if (newList.children.length > 0) p.parentNode.insertBefore(newList, p.nextSibling);
                    }
                    li.remove();
                    if (list.children.length === 0) list.remove();
                    const newRange = document.createRange();
                    newRange.selectNodeContents(p);
                    newRange.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(newRange);
                    savedRangeRef.current = newRange.cloneRange();
                }
                return; // otherwise let browser handle normal list Enter
            }

            // Inside <blockquote>: Enter breaks out into a new <p> after
            if (bq) {
                e.preventDefault();
                const p = document.createElement("p");
                p.appendChild(document.createTextNode("\u200B"));
                bq.parentNode.insertBefore(p, bq.nextSibling);
                const newRange = document.createRange();
                newRange.selectNodeContents(p);
                newRange.collapse(false);
                sel.removeAllRanges();
                sel.addRange(newRange);
                savedRangeRef.current = newRange.cloneRange();
                return;
            }

            // Default: insert a clean <p> instead of <div> or <br>
            e.preventDefault();
            range.deleteContents();

            // Check if we're inside a block already
            const block = getBlockAncestor(range.commonAncestorContainer, editorRef.current);
            const p = document.createElement("p");
            p.appendChild(document.createTextNode("\u200B"));

            if (block) {
                // Split the block at cursor
                const afterRange = document.createRange();
                afterRange.setStart(range.endContainer, range.endOffset);
                afterRange.setEndAfter(block.lastChild || block);
                const afterFrag = afterRange.extractContents();
                // Put remaining content into new p
                if (afterFrag.textContent.replace(/\u200B/g, "").trim()) {
                    p.innerHTML = "";
                    p.appendChild(afterFrag);
                }
                block.parentNode.insertBefore(p, block.nextSibling);
            } else {
                // Cursor is a top-level text node — wrap it
                const insertRef = range.endContainer;
                const parent = insertRef.nodeType === Node.TEXT_NODE ? insertRef.parentNode : insertRef;
                parent.appendChild(p);
            }

            const newRange = document.createRange();
            newRange.selectNodeContents(p);
            newRange.collapse(false);
            sel.removeAllRanges();
            sel.addRange(newRange);
            savedRangeRef.current = newRange.cloneRange();
            handleInput();
        }
    }, [slashMenuPos, slashQuery, withRange]);

    const closeSlashMenu = () => {
        setSlashMenuPos(null);
        setSlashQuery("");
        slashStartRef.current = null;
    };

    const handleSlashSelect = useCallback((cmd) => {
        closeSlashMenu();
        // Delete the typed "/" and query text from editor
        if (slashStartRef.current) {
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
                const curRange = sel.getRangeAt(0);
                // Delete from slash start to current
                try {
                    const delRange = document.createRange();
                    delRange.setStart(slashStartRef.current.startContainer, slashStartRef.current.startOffset);
                    delRange.setEnd(curRange.endContainer, curRange.endOffset);
                    delRange.deleteContents();
                    savedRangeRef.current = getActiveRange();
                } catch {}
            }
        }
        setTimeout(() => {
            withRange((range, editor) => cmd.action(range, editor));
        }, 0);
    }, [withRange]);

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // First image uploaded becomes the cover
        if (!coverFile) setCoverFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => {
            editorRef.current?.focus();
            insertImageAtRange(ev.target.result, savedRangeRef.current, editorRef.current);
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const {data} = await supabase.from('categories').select('*').order('name');
                setCategories(data || []);
            } catch (err) { setError(err.message); }
        };
        fetchCategories();
    }, []);

    // Initialize editor with a <p> so first keypress is always inside a paragraph
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML === "") {
            const p = document.createElement("p");
            p.appendChild(document.createTextNode(""));
            editorRef.current.appendChild(p);
        }
    }, []);

    useEffect(() => {
        document.addEventListener("selectionchange", handleSelectionChange);
        return () => document.removeEventListener("selectionchange", handleSelectionChange);
    }, [handleSelectionChange]);

    // Close slash menu on outside click
    useEffect(() => {
        if (!slashMenuPos) return;
        const handler = (e) => {
            if (!editorRef.current?.contains(e.target)) closeSlashMenu();
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [slashMenuPos]);

    const fetchTagsByCategoryId = async (categoryIdStr) => {
        setSelectedTags([]); setAvailableTags([]);
        if (!categoryIdStr) return;
        try {
            const {data} = await supabase.from('tags').select('*').eq('category_id', categoryIdStr).order('name', {ascending: true});
            setAvailableTags(Array.isArray(data) ? data : []);
        } catch (err) { setError(err?.message || String(err)); }
    };

    const uploadCoverFile = async (file) => {
        if (!file) return null;
        const bucket = 'blog-images';
        try {
            const id = uuidv4();
            const ext = (file.type && file.type.split('/')[1]) || 'png';
            const filename = `${id}.${ext}`;
            const {error: uploadError} = await supabase.storage.from(bucket).upload(filename, file, {upsert: false});
            if (uploadError) { setError(uploadError.message); return null; }
            const {data: publicData} = supabase.storage.from(bucket).getPublicUrl(filename);
            return {filename, publicUrl: publicData?.publicUrl || null, id};
        } catch (err) { setError(err?.message); return null; }
    };

    const handlePublish = async () => {
        setIsPublishing(true); setError(null);
        try {
            async function dataURLtoBlob(dataURL) {
                const parts = dataURL.split(',');
                const mime = (parts[0].match(/:(.*?);/) || [])[1] || 'image/png';
                const bstr = atob(parts[1]);
                let n = bstr.length;
                const u8 = new Uint8Array(n);
                while (n--) u8[n] = bstr.charCodeAt(n);
                return new Blob([u8], {type: mime});
            }
            async function uploadEmbeddedImages(editorEl) {
                if (!editorEl) return;
                const imgs = Array.from(editorEl.querySelectorAll('img'));
                for (const img of imgs) {
                    const src = img.getAttribute('src') || '';
                    if (!src.startsWith('data:')) continue;
                    const blob = await dataURLtoBlob(src);
                    const ext = (blob.type && blob.type.split('/')[1]) || 'png';
                    const filename = `blogs/${Date.now()}-${uuidv4()}.${ext}`;
                    const {error} = await supabase.storage.from('blog-images').upload(filename, blob, {upsert: false});
                    if (error) { console.error(error); continue; }
                    const {data: publicData} = supabase.storage.from('blog-images').getPublicUrl(filename);
                    if (publicData?.publicUrl) img.setAttribute('src', publicData.publicUrl);
                }
            }
            await uploadEmbeddedImages(editorRef.current);
            const markdown = serializeToMarkdown(editorRef.current);
            const {data: post, error: postError} = await supabase.from("posts").insert({title: title.replace(/\n/g, " ").trim(), content: markdown, category_id: Number(categoryId)}).select().single();
            if (postError) throw postError;
            if (selectedTags.length > 0) {
                await supabase.from("post_tags").insert(selectedTags.map((t) => ({post_id: post.id, tag_id: t.id})));
            }
            if (coverFile) {
                const uploadRes = await uploadCoverFile(coverFile);
                if (uploadRes?.filename) {
                    await supabase.from("post_images").insert({post_id: post.id, url: uploadRes.filename, is_cover: true});
                }
            }
            setPublished(true);
        } catch (err) { setError(err.message); }
        finally { setIsPublishing(false); }
    };

    const handleReset = () => {
        setTitle("");
        setCoverFile(null);
        if (titleRef.current) titleRef.current.innerHTML = "";
        if (editorRef.current) {
            editorRef.current.innerHTML = "";
            const p = document.createElement("p");
            p.appendChild(document.createTextNode(""));
            editorRef.current.appendChild(p);
        }
        setCategoryId(""); setSelectedTags([]); setPublished(false); setError(null); setWordCount(0); savedRangeRef.current = null;
    };

    const toggleTag = (tag) => setSelectedTags(prev => prev.find(t => t.id === tag.id) ? prev.filter(t => t.id !== tag.id) : [...prev, tag]);
    const isPublishable = title.trim() && wordCount > 0 && categoryId && !isPublishing;

    const handleLink = () => {
        const url = prompt("Enter URL:");
        if (!url) return;
        withRange((range) => {
            if (!range || range.collapsed) return;
            const fragment = range.extractContents();
            const a = document.createElement("a");
            a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer";
            a.appendChild(fragment);
            range.insertNode(a);
        });
    };

    if (published) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center max-w-sm p-8">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-5">
                        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-1">Published!</h2>
                    <p className="text-stone-500 dark:text-slate-400 text-sm mb-6">"{title}" is now live.</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={handleReset} className="px-5 py-2.5 bg-white dark:bg-navy-900 border border-stone-200 dark:border-dark text-stone-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors">Write Another</button>
                        <Link to="/blogs" className="px-5 py-2.5 bg-amber-600 dark:bg-primary-weak text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors">View All Posts</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-navy-950">
            {/* Floating toolbar */}
            <FloatingToolbar
                position={floatingPos}
                onBold={() => withRange((range) => toggleBold(range))}
                onItalic={() => withRange((range) => toggleItalic(range))}
                onInlineCode={() => withRange((range) => toggleInlineCode(range))}
                onLink={handleLink}
            />

            {/* Slash menu */}
            <SlashMenu
                position={slashMenuPos}
                query={slashQuery}
                onSelect={handleSlashSelect}
                onClose={closeSlashMenu}
            />

            <div className="w-full px-6 py-8">

                {/* ── Top Bar ── */}
                <header className="sticky top-0 z-30 bg-white dark:bg-navy-900 border-b border-stone-200 dark:border-dark shadow-sm">
                    <div className="w-full px-4 h-13 flex items-center justify-between gap-4 py-2">
                        <div className="flex items-center text-stone-900 dark:text-white">
                            <Link to="/" className="p-1.5 hover:text-stone-700 dark:hover:text-slate-300 transition-colors rounded">
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
                                className="px-4 py-2 bg-amber-600 dark:bg-primary-weak text-white text-sm font-semibold rounded-lg hover:bg-amber-700 dark:hover:bg-teal-600 disabled:bg-stone-200 dark:disabled:bg-gray-700 disabled:text-stone-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                            >
                                {isPublishing ? "Publishing…" : "Publish"}
                            </button>
                        </div>
                    </div>
                </header>

                <div className="w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-[85fr_15fr] gap-6">

                    {/* ── Editor Card ── */}
                    <div className="bg-white dark:bg-navy-900 rounded-xl border border-stone-200 dark:border-dark shadow-sm overflow-hidden">

                        {/* Toolbar */}
                        <div
                            className="border-b border-stone-100 dark:border-dark px-3 py-2 flex flex-wrap items-center gap-1 bg-stone-50 dark:bg-navy-900"
                            onMouseDown={saveRange}
                        >
                            {/* Undo / Redo */}
                            <TBtn
                                onAction={() => { editorRef.current?.focus(); document.execCommand("undo"); }}
                                title="Undo (Ctrl+Z)"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                    <path d="M3 7v6h6"/><path d="M3 13C5.4 7.8 10.8 4 17 4c5 0 8 3 8 7s-3 7-8 7H9"/>
                                </svg>
                            </TBtn>
                            <TBtn
                                onAction={() => { editorRef.current?.focus(); document.execCommand("redo"); }}
                                title="Redo (Ctrl+Y)"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                    <path d="M21 7v6h-6"/><path d="M21 13C18.6 7.8 13.2 4 7 4c-5 0-8 3-8 7s3 7 8 7h8"/>
                                </svg>
                            </TBtn>

                            <div className="w-px h-5 bg-stone-200 dark:bg-gray-600 mx-0.5"/>

                            <select
                                defaultValue=""
                                onChange={(e) => { const val = e.target.value; e.target.value = ""; if (val) withRange((range, editor) => formatBlock(val, range, editor)); }}
                                className="text-xs text-stone-600 dark:text-slate-300 bg-white dark:bg-navy-950 border border-stone-200 dark:border-dark rounded-md px-2 py-1.5 outline-none cursor-pointer hover:bg-stone-50 dark:hover:bg-navy-900 transition-colors"
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
                                onChange={(e) => { const val = e.target.value; e.target.value = ""; if (val) withRange((range) => applySpanStyle("fontFamily", val, range)); }}
                                className="text-xs text-stone-600 dark:text-slate-300 bg-white dark:bg-navy-950 border border-stone-200 dark:border-dark rounded-md px-2 py-1.5 outline-none cursor-pointer hover:bg-stone-50 dark:hover:bg-navy-900 transition-colors"
                            >
                                <option value="" disabled>Font</option>
                                {FONT_FAMILIES.map((f) => <option key={f.value} value={f.value} style={{fontFamily: f.value}}>{f.label}</option>)}
                            </select>

                            <select
                                defaultValue=""
                                onChange={(e) => { const val = e.target.value; e.target.value = ""; if (val) withRange((range) => applySpanStyle("fontSize", val, range)); }}
                                className="text-xs text-stone-600 dark:text-slate-300 bg-white dark:bg-navy-950 border border-stone-200 dark:border-dark rounded-md px-2 py-1.5 outline-none cursor-pointer hover:bg-stone-50 dark:hover:bg-navy-900 transition-colors"
                            >
                                <option value="" disabled>Size</option>
                                {FONT_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>

                            <div className="w-px h-5 bg-stone-200 dark:bg-gray-600 mx-0.5"/>

                            <TBtn onAction={() => withRange((range) => toggleBold(range))} title="Bold"><b>B</b></TBtn>
                            <TBtn onAction={() => withRange((range) => toggleItalic(range))} title="Italic"><i>I</i></TBtn>
                            <TBtn onAction={() => withRange((range) => toggleInlineCode(range))} title="Inline Code">
                                <span className="font-mono text-xs">`</span>
                            </TBtn>

                            <div className="w-px h-5 bg-stone-200 dark:bg-gray-600 mx-0.5"/>

                            {/* Alignment — onMouseDown+preventDefault keeps editor selection intact */}
                            <button
                                title="Align Left"
                                onMouseDown={(e) => { e.preventDefault(); alignBlock("left", editorRef.current); }}
                                className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/>
                                </svg>
                            </button>
                            <button
                                title="Align Center"
                                onMouseDown={(e) => { e.preventDefault(); alignBlock("center", editorRef.current); }}
                                className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                    <line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
                                </svg>
                            </button>
                            <button
                                title="Align Right"
                                onMouseDown={(e) => { e.preventDefault(); alignBlock("right", editorRef.current); }}
                                className="p-1.5 rounded hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                    <line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/>
                                </svg>
                            </button>

                            <div className="w-px h-5 bg-stone-200 dark:bg-gray-600 mx-0.5"/>

                            {/* Bullet list */}
                            <TBtn onAction={() => withRange((range, editor) => insertList("ul", range, editor))} title="Bullet List">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                    <line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/>
                                    <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/>
                                    <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/>
                                    <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/>
                                </svg>
                            </TBtn>

                            {/* Numbered list */}
                            <TBtn onAction={() => withRange((range, editor) => insertList("ol", range, editor))} title="Numbered List">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                    <line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/>
                                    <text x="2" y="8" fontSize="8" fill="currentColor" stroke="none" fontWeight="700">1.</text>
                                    <text x="2" y="14" fontSize="8" fill="currentColor" stroke="none" fontWeight="700">2.</text>
                                    <text x="2" y="20" fontSize="8" fill="currentColor" stroke="none" fontWeight="700">3.</text>
                                </svg>
                            </TBtn>

                            {/* Blockquote */}
                            <TBtn onAction={() => withRange((range, editor) => formatBlock("blockquote", range, editor))} title="Blockquote">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
                                </svg>
                            </TBtn>

                            <div className="w-px h-5 bg-stone-200 dark:bg-gray-600 mx-0.5"/>

                            <TBtn onAction={() => withRange((range, editor) => formatBlock("pre", range, editor))} title="Code Block">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                                </svg>
                            </TBtn>

                            {/* Divider */}
                            <TBtn onAction={() => withRange((range, editor) => insertDivider(range, editor))} title="Divider">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                    <line x1="3" y1="12" x2="21" y2="12"/>
                                </svg>
                            </TBtn>

                            <div className="w-px h-5 bg-stone-200 dark:bg-gray-600 mx-0.5"/>

                            <TBtn onAction={() => fileInputRef.current?.click()} title="Upload Image">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 inline">
                                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                    <polyline points="21 15 16 10 5 21"/>
                                </svg>
                                <span className="ml-1 text-xs">Image</span>
                            </TBtn>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload}/>
                        </div>

                        {/* Slash hint */}
                        <div className="px-8 pt-3 pb-1">
                            <span className="text-xs text-stone-400 dark:text-stone-600 select-none">
                                Type <kbd className="px-1 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-mono text-[10px] text-stone-500">/</kbd> to insert a block
                            </span>
                        </div>

                        <div className="px-8 pt-3 pb-4">
                            <div className="pt-2">
                                <div
                                    ref={titleRef}
                                    contentEditable
                                    suppressContentEditableWarning
                                    data-placeholder="Post title…"
                                    onInput={(e) => setTitle(e.currentTarget.innerText)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            // Insert a real newline at cursor position
                                            const sel = window.getSelection();
                                            if (!sel || sel.rangeCount === 0) return;
                                            const range = sel.getRangeAt(0);
                                            range.deleteContents();
                                            const br1 = document.createElement("br");
                                            const br2 = document.createElement("br");
                                            range.insertNode(br2);
                                            range.insertNode(br1);
                                            // Move cursor after the first br
                                            const newRange = document.createRange();
                                            newRange.setStartAfter(br1);
                                            newRange.collapse(true);
                                            sel.removeAllRanges();
                                            sel.addRange(newRange);
                                        }
                                    }}
                                    className="w-full text-3xl font-bold text-stone-900 dark:text-white outline-none bg-transparent border-b-2 border-transparent focus:border-amber-200 dark:focus:border-teal-400/30 pb-2 transition-colors whitespace-pre-wrap"
                                    style={{fontFamily: "Georgia, serif", lineHeight: "1.3", minHeight: "2.6rem"}}
                                />
                            </div>
                        </div>

                        <div
                            ref={editorRef}
                            contentEditable
                            suppressContentEditableWarning
                            onInput={handleInput}
                            onKeyDown={handleKeyDown}
                            onPaste={handlePaste}
                            data-placeholder="Start writing your post… or type / for commands"
                            className="px-8 pb-16 pt-2 min-h-[480px] outline-none text-stone-800 dark:text-slate-200"
                            style={{fontFamily: "Georgia, serif", fontSize: "17px", lineHeight: "1.8"}}
                        />
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-navy-900 rounded-xl border border-stone-200 dark:border-dark shadow-sm p-4">
                            <h3 className="text-xs font-semibold text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-3">Category</h3>
                            <select
                                value={categoryId}
                                onChange={(e) => { const cidStr = e.target.value; setCategoryId(cidStr); fetchTagsByCategoryId(cidStr); }}
                                className="w-full bg-white border border-stone-200 dark:border-dark text-stone-700 dark:text-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400 dark:focus:border-teal-400 transition-colors"
                            >
                                <option value="">Select…</option>
                                {categories.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                            </select>

                            {availableTags.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="text-xs font-semibold text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-2">Tags</h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {availableTags.map((tag) => {
                                            const sel = selectedTags.find(t => t.id === tag.id);
                                            return (
                                                <button key={tag.id} onClick={() => toggleTag(tag)}
                                                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${sel ? "bg-amber-600 dark:bg-primary-weak border-amber-600 dark:border-primary-weak text-white" : "bg-white dark:bg-navy-950 border-stone-200 dark:border-dark text-stone-600 dark:text-slate-400 hover:border-amber-300 dark:hover:border-teal-400"}`}>
                                                    {tag.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white dark:bg-navy-900 rounded-xl border border-stone-200 dark:border-dark shadow-sm p-4">
                            <h3 className="text-xs font-semibold text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-3">Stats</h3>
                            <div className="space-y-2">
                                {[
                                    ["Words", wordCount || "—"],
                                    ["Read time", wordCount ? `~${Math.max(1, Math.ceil(wordCount / 200))} min` : "—"],
                                    ["Category", categoryId ? CATEGORIES.find(c => c.id === Number(categoryId))?.name : "—"],
                                    ["Tags", selectedTags.length || "—"],
                                ].map(([label, val]) => (
                                    <div key={label} className="flex justify-between">
                                        <span className="text-xs text-stone-400 dark:text-slate-500">{label}</span>
                                        <span className="text-xs font-medium text-stone-700 dark:text-slate-300">{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick insert panel */}
                        <div className="bg-white dark:bg-navy-900 rounded-xl border border-stone-200 dark:border-dark shadow-sm p-4">
                            <h3 className="text-xs font-semibold text-stone-500 dark:text-slate-400 uppercase tracking-wide mb-3">Quick Insert</h3>
                            <div className="grid grid-cols-2 gap-1.5">
                                {SLASH_COMMANDS.map(cmd => (
                                    <button
                                        key={cmd.id}
                                        onMouseDown={(e) => { e.preventDefault(); saveRange(); setTimeout(() => withRange((range, editor) => cmd.action(range, editor)), 0); }}
                                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-stone-600 dark:text-slate-400 hover:bg-stone-50 dark:hover:bg-stone-800 border border-stone-100 dark:border-stone-800 transition-colors"
                                    >
                                        <span className="text-stone-400 dark:text-stone-500 flex-shrink-0">{cmd.icon}</span>
                                        {cmd.label}
                                    </button>
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
                .dark [contenteditable][data-placeholder]:empty:before { color: #475569; }
                [contenteditable] h1 { font-size: 2rem; font-weight: 800; margin: 1.25rem 0 0.5rem; color: #111827; }
                .dark [contenteditable] h1 { color: #f8fafc; }
                [contenteditable] h2 { font-size: 1.5rem; font-weight: 700; margin: 1rem 0 0.5rem; color: #1f2937; }
                .dark [contenteditable] h2 { color: #e2e8f0; }
                [contenteditable] h3 { font-size: 1.25rem; font-weight: 600; margin: 0.75rem 0 0.4rem; color: #374151; }
                .dark [contenteditable] h3 { color: #cbd5e1; }
                [contenteditable] h4 { font-size: 1.1rem; font-weight: 600; margin: 0.5rem 0 0.3rem; color: #4b5563; }
                .dark [contenteditable] h4 { color: #94a3b8; }
                [contenteditable] p { margin: 0 0 0.75rem; }
                [contenteditable] ul { list-style: disc; padding-left: 1.5rem; margin: 0.75rem 0; }
                [contenteditable] ol { list-style: decimal; padding-left: 1.5rem; margin: 0.75rem 0; }
                [contenteditable] li { margin: 0.25rem 0; }
                [contenteditable] blockquote {
                    border-left: 4px solid #f59e0b;
                    padding: 0.75rem 1.25rem;
                    margin: 1rem 0;
                    background: #fffbeb;
                    border-radius: 0 0.5rem 0.5rem 0;
                    color: #78350f;
                    font-style: italic;
                }
                .dark [contenteditable] blockquote {
                    border-left-color: #d97706;
                    background: #1c1917;
                    color: #a16207;
                }
                [contenteditable] pre {
                    background: #1e293b; color: #e2e8f0;
                    padding: 1rem 1.25rem; border-radius: 0.5rem;
                    font-family: 'Courier New', monospace; font-size: 0.875rem;
                    margin: 1rem 0; overflow-x: auto; white-space: pre-wrap;
                }
                .dark [contenteditable] pre { background: #0f172a; color: #cbd5e1; }
                [contenteditable] code {
                    background: #f1f5f9;
                    color: #be185d;
                    padding: 0.1em 0.4em;
                    border-radius: 0.25rem;
                    font-family: 'Courier New', monospace;
                    font-size: 0.875em;
                }
                .dark [contenteditable] code { background: #1e293b; color: #f472b6; }
                [contenteditable] pre code { background: transparent; color: inherit; padding: 0; }
                [contenteditable] hr {
                    border: none;
                    border-top: 2px solid #e5e7eb;
                    margin: 2rem 0;
                }
                .dark [contenteditable] hr { border-top-color: #374151; }
                [contenteditable] a { color: #d97706; text-decoration: underline; }
                .dark [contenteditable] a { color: #fbbf24; }
                [contenteditable] img { max-width: 100%; border-radius: 0.5rem; margin: 0.75rem 0; border: 1px solid #e5e7eb; display: block; }
                .dark [contenteditable] img { border-color: #374151; }
                [contenteditable]:focus { outline: none; }
                `}</style>
            </div>
        </div>
    );
}