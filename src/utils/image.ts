const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');

export function buildImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return `${API_URL}${path}`;
  return `${API_URL}/${path}`;
}

export function getImageLoaderProps(
  src: string | null | undefined,
  width?: number,
  height?: number
): { src: string; width: number; height: number; className?: string } | null {
  const url = buildImageUrl(src);
  if (!url) return null;
  return { src: url, width: width || 800, height: height || 600 };
}
