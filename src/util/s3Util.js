import {supabase} from "./supabaseClient.js";

export async function getS3ImageUrl(filename) {
    if (!filename) return null;
    const bucket = 'blog-images';
    const prefixes = ['', 'covers/', 'blogs/', 'posts/'];
    try {
        for (const prefix of prefixes) {
            const path = `${prefix}${filename}`;
            const res = supabase.storage.from(bucket).getPublicUrl(path);
            const publicUrl = res?.data?.publicUrl || res?.publicUrl || null;
            if (publicUrl) return publicUrl;
        }
        return null;
    } catch (e) {
        console.error('getS3ImageUrl error', e);
        return null;
    }
}