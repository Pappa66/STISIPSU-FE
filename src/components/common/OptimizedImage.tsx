import Image from "next/image";
import { buildImageUrl } from "@/utils/image";

type OptimizedImageProps = {
  src: string | null | undefined;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
};

export default function OptimizedImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = "",
  priority = false,
  sizes,
  objectFit = "cover",
}: OptimizedImageProps) {
  const resolvedSrc = buildImageUrl(src);

  if (!resolvedSrc) return null;

  if (fill) {
    return (
      <Image
        src={resolvedSrc}
        alt={alt}
        fill
        sizes={sizes || "(max-width: 768px) 100vw, 50vw"}
        className={`object-${objectFit} ${className}`}
        priority={priority}
        loading={priority ? undefined : "lazy"}
      />
    );
  }

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      width={width || 800}
      height={height || 600}
      className={className}
      priority={priority}
      loading={priority ? undefined : "lazy"}
    />
  );
}

export function Img(props: {
  src: string | null | undefined;
  alt: string;
  className?: string;
}) {
  const resolvedSrc = buildImageUrl(props.src);
  if (!resolvedSrc) return null;
  return <img src={resolvedSrc} alt={props.alt} className={props.className} loading="lazy" />;
}
