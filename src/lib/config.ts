export const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export function fixImageUrl(url: string | undefined | null): string {
  if (!url) return "";

  // Already a relative path like /uploads/file.jpg
  if (url.startsWith("/uploads/")) {
    return `${API_URL}${url}`;
  }

  // Absolute URL saved with any host (localhost, 192.168.x.x, etc.)
  // Strip everything up to and including /uploads/ then rebuild with current API_URL
  const uploadsIndex = url.indexOf("/uploads/");
  if (uploadsIndex !== -1) {
    return `${API_URL}${url.substring(uploadsIndex)}`;
  }

  // Not an uploads URL (external image etc.) — return as-is
  return url;
}