/**
 * Formats image URLs, converting Google Drive view and uc links to direct image links.
 * @param {string} url - The original image URL.
 * @returns {string} The formatted image URL.
 */
export function formatImageUrl(url) {
    if (!url) return "/placeholder.jpg";
    
    // Check if it's a google drive view or uc link
    // Matches: https://drive.google.com/file/d/{ID}/view OR https://drive.google.com/uc?id={ID}...
    const driveFileRegex = /(?:https?:\/\/)?(?:www\.)?drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
    const driveUcRegex = /(?:https?:\/\/)?(?:www\.)?drive\.google\.com\/uc\?(?:.*&)?id=([a-zA-Z0-9_-]+)/;
    
    let match = url.match(driveFileRegex);
    if (!match) {
        match = url.match(driveUcRegex);
    }

    if (match && match[1]) {
        return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    
    return url;
}
