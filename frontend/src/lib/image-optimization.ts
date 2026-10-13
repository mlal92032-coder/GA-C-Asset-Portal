/**
 * Image optimization utilities
 * Provides helpers for lazy loading, responsive images, and format selection
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number; // 0-100, default 80
  format?: 'webp' | 'jpeg' | 'png';
  lazy?: boolean;
  blur?: boolean;
}

/**
 * Generate optimized image URL with quality and size parameters
 * Can be used with Next.js Image component or standard img tag
 */
export function getOptimizedImageUrl(
  src: string | null | undefined,
  options: ImageOptimizationOptions = {}
): string {
  if (!src) return '/placeholder.png'; // Fallback

  // If already an optimized URL, return as-is
  if (src.includes('_next/image') || src.includes('optimization')) {
    return src;
  }

  const {
    width = 800,
    height,
    quality = 80,
    format = 'webp',
  } = options;

  // URL encoding for query parameters
  const params = new URLSearchParams({
    w: width.toString(),
    q: quality.toString(),
    f: format,
  });

  if (height) {
    params.set('h', height.toString());
  }

  // If it's already a full URL with protocol, try to parse it
  if (src.startsWith('http')) {
    // For external URLs or absolute paths, return as-is
    // (optimization would require a proxy)
    return src;
  }

  // Return with optimization parameters
  return `${src}?${params.toString()}`;
}

/**
 * Generate srcSet for responsive images
 * Usage: <img srcSet={generateSrcSet(imageUrl)} sizes="(max-width: 768px) 100vw, 50vw" />
 */
export function generateSrcSet(
  src: string | null | undefined,
  widths: number[] = [320, 640, 960, 1280],
  format: 'webp' | 'jpeg' = 'webp'
): string {
  if (!src) return '';

  return widths
    .map(width => {
      const url = getOptimizedImageUrl(src, { width, format });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Calculate image aspect ratio for layout shift prevention
 */
export function getImageAspectRatio(width?: number, height?: number): string {
  if (!width || !height) return 'auto';
  return `${width / height}`;
}

/**
 * Blur placeholder generator
 * Returns a tiny blurred version for LQIP (Low Quality Image Placeholder)
 */
export function generateBlurPlaceholder(
  src: string | null | undefined,
  width: number = 10,
  height: number = 10
): string {
  if (!src) return '';
  return getOptimizedImageUrl(src, {
    width,
    height,
    quality: 20,
    format: 'jpeg',
  });
}

/**
 * Container for storing common image sizes used in the app
 */
export const IMAGE_SIZES = {
  // Thumbnails
  thumb: { width: 200, height: 200 },
  thumbSmall: { width: 100, height: 100 },

  // Cards
  cardSmall: { width: 300, height: 300 },
  cardMedium: { width: 500, height: 500 },
  cardLarge: { width: 800, height: 600 },

  // Details pages
  detailSmall: { width: 400, height: 400 },
  detailMedium: { width: 600, height: 600 },
  detailLarge: { width: 1000, height: 800 },

  // Full width
  fullWidth: { width: 1920, height: 1080 },

  // Logo/Icon
  logo: { width: 200, height: 100 },
  icon: { width: 64, height: 64 },
};

/**
 * CSS for aspect ratio padding trick
 * Prevents layout shift while image loads
 */
export function getAspectRatioPaddingBottom(width: number, height: number): string {
  return `${(height / width) * 100}%`;
}

/**
 * Check if browser supports WebP
 * Returns true if WebP is supported, false otherwise
 */
export let supportsWebP = true;

if (typeof window !== 'undefined') {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  supportsWebP = canvas.toDataURL('image/webp').indexOf('image/webp') === 0;
}

/**
 * Get preferred image format based on browser support
 */
export function getPreferredFormat(): 'webp' | 'jpeg' {
  return supportsWebP ? 'webp' : 'jpeg';
}
