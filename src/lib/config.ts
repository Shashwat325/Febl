export const API_URL = import.meta.env.VITE_API_BASE_URL || "https://febl.onrender.com";

export function fixImageUrl(url: string | undefined | null): string {
  if (!url) return "";

  if (url.startsWith("/uploads/")) {
    return `${API_URL}${url}`;
  }

  const uploadsIndex = url.indexOf("/uploads/");
  if (uploadsIndex !== -1) {
    return `${API_URL}${url.substring(uploadsIndex)}`;
  }

  return url;
}