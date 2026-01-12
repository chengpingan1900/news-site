'use client';

// @ts-nocheck
import { useState, useEffect } from 'react';

// Simplified interface without inheritance to avoid any conflicts
interface NewsImageProps {
  src?: string | null;
  alt: string;
  fallbackText?: string;
  category?: string;
  keyword?: string | null;
  className?: string;
  [key: string]: any; // Allow any other props
}

export default function NewsImage({ src, alt, className, fallbackText = 'News', category, keyword, ...props }: NewsImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || '');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    setImgSrc(src || '');
  }, [src]);

  const getPlaceholder = () => {
     // Generate Unsplash Source URL based on category or keyword
     // Using source.unsplash.com is deprecated/unreliable, so we use images.unsplash.com with specific IDs or keywords
     // Or a reliable placeholder service that supports images
     
     const term = keyword || category || 'news';
     
     // We can use a deterministic random image based on the title hash to keep it consistent
     // but for now let's just use a high quality placeholder service that supports categories
     // Lorem Picsum or similar
     
     // Using Unsplash direct search URL format (often works)
     // https://source.unsplash.com/featured/?{term}
     // Note: Unsplash Source is being sunset, so we might want to use a static set or another service.
     
     // Let's use a stable, high-quality placeholder service: "Picsum Photos" with a seed
     // Seed ensures the same article always gets the same random image
     const seed = alt.replace(/[^a-z0-9]/gi, '').substring(0, 10);
     
     return `https://picsum.photos/seed/${seed}/800/600`;
  };

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(getPlaceholder());
    }
  };

  if (!src) {
    return (
      <img
        src={getPlaceholder()}
        alt={alt}
        className={className}
        {...props}
      />
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}
