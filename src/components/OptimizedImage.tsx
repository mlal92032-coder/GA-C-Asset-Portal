'use client';

import { useState, useEffect, CSSProperties } from 'react';
import Image from 'next/image';
import {
  generateSrcSet,
  generateBlurPlaceholder,
  getImageAspectRatio,
  getPreferredFormat,
  IMAGE_SIZES,
} from '@/lib/image-optimization';

interface OptimizedImageProps {
  src: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  lazy?: boolean;
  blur?: boolean;
  priority?: boolean;
  onClick?: () => void;
  quality?: number;
  sizes?: string;
  placeholder?: 'blur' | 'empty';
}

/**
 * Optimized image component with lazy loading, responsive sizing, and blur placeholders
 *
 * Usage:
 * <OptimizedImage
 *   src={imageUrl}
 *   alt="Asset thumbnail"
 *   width={300}
 *   height={300}
 *   lazy
 *   blur
 *   sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
 * />
 */
export default function OptimizedImage({
  src,
  alt,
  width = 400,
  height = 400,
  className = '',
  objectFit = 'cover',
  lazy = true,
  blur = false,
  priority = false,
  onClick,
  quality = 80,
  sizes,
  placeholder = 'blur',
}: OptimizedImageProps): JSX.Element {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Validate image URL
  if (!src) {
    return (
      <div
        className={`bg-slate-200 flex items-center justify-center ${className}`}
        style={{ width, height, aspectRatio: getImageAspectRatio(width, height) }}
      >
        <span className="text-slate-400 text-sm">No image</span>
      </div>
    );
  }

  // Show error placeholder
  if (imageError) {
    return (
      <div
        className={`bg-red-100 border-2 border-red-300 flex items-center justify-center ${className}`}
        style={{ width, height, aspectRatio: getImageAspectRatio(width, height) }}
      >
        <span className="text-red-600 text-sm">Failed to load</span>
      </div>
    );
  }

  const blurDataURL = blur ? generateBlurPlaceholder(src, 10, 10) : undefined;
  const format = getPreferredFormat();
  const srcSet = generateSrcSet(src, [320, 640, 960, 1280], format);

  // Container style to prevent layout shift
  const containerStyle: CSSProperties = {
    width,
    height,
    aspectRatio: getImageAspectRatio(width, height),
    overflow: 'hidden',
    position: 'relative',
  };

  const imageStyle: CSSProperties = {
    objectFit,
    width: '100%',
    height: '100%',
    transition: 'opacity 0.3s ease-in-out',
    opacity: imageLoaded ? 1 : 0.8,
  };

  return (
    <div
      className={`relative bg-slate-100 ${onClick ? 'cursor-pointer hover:opacity-90' : ''} ${className}`}
      style={containerStyle}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {/* Native img tag with srcSet for best performance */}
      {/* Using native img tag instead of Next.js Image for better control over lazy loading */}
      <img
        src={src}
        alt={alt}
        srcSet={lazy && srcSet ? srcSet : undefined}
        sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
        style={imageStyle}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        className="w-full h-full"
      />

      {/* Blur placeholder overlay while loading */}
      {!imageLoaded && blurDataURL && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url('${blurDataURL}')`,
            backgroundSize: 'cover',
            filter: 'blur(10px)',
            opacity: 0.6,
          }}
        />
      )}

      {/* Loading skeleton */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 animate-pulse" />
      )}
    </div>
  );
}

/**
 * Asset thumbnail component - pre-configured for asset cards
 */
export function AssetThumbnail({
  src,
  alt,
  className = '',
  onClick,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={IMAGE_SIZES.thumb.width}
      height={IMAGE_SIZES.thumb.height}
      className={`rounded-lg ${className}`}
      lazy
      blur
      onClick={onClick}
      sizes="(max-width: 640px) 100px, 150px"
    />
  );
}

/**
 * Card image component - pre-configured for asset overview cards
 */
export function CardImage({
  src,
  alt,
  className = '',
  onClick,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={IMAGE_SIZES.cardMedium.width}
      height={IMAGE_SIZES.cardMedium.height}
      className={`rounded-lg ${className}`}
      lazy
      blur
      onClick={onClick}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    />
  );
}

/**
 * Detail image component - pre-configured for asset detail pages
 */
export function DetailImage({
  src,
  alt,
  className = '',
  onClick,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={IMAGE_SIZES.detailLarge.width}
      height={IMAGE_SIZES.detailLarge.height}
      className={`rounded-lg w-full ${className}`}
      lazy
      blur
      onClick={onClick}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
    />
  );
}
