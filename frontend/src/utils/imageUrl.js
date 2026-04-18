export function sanitizeImageUrl(url) {
  const value = typeof url === "string" ? url.trim() : "";
  if (!value) return "";

  // Avoid external placeholder host to prevent console/network errors.
  if (/^https?:\/\/via\.placeholder\.com\//i.test(value)) {
    return "";
  }

  return value;
}
