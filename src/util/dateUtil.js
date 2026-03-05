export function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export function estimateReadTime(content) {
    if (!content) return 1;
    return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
}