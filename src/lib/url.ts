/** The value as an absolute http(s) URL string, or null (rejects javascript:, data:, relative…). */
export function toHttpUrl(value: string | null | undefined, base?: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim(), base);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}
