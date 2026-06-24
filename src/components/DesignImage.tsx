import Image from 'next/image'

interface DesignImageProps {
  src?: string | null
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  priority?: boolean
  style?: React.CSSProperties
  sizes?: string
}

export default function DesignImage({
  src,
  alt,
  fill = true,
  width,
  height,
  className = "object-cover object-center w-full h-full pointer-events-none select-none",
  priority = false,
  style,
  sizes
}: DesignImageProps) {
  const isPlaceholder = !src || src.includes('placehold.co') || src === '';

  if (isPlaceholder) {
    return (
      <div className="w-full h-full min-h-[inherit] absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 transition-colors select-none">
        <div className="relative w-16 h-16 opacity-30 dark:opacity-20 animate-pulse">
          <Image
            src="/logo.svg"
            alt="Octoplans Logo Placeholder"
            fill
            className="dark:invert dark:brightness-[3] dark:hue-rotate-[160deg] object-contain"
          />
        </div>
      </div>
    );
  }

  // Next.js Image requires width/height if fill is false
  if (!fill && (!width || !height)) {
    fill = true;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={className}
      priority={priority}
      unoptimized
      draggable={false}
      style={style}
      sizes={sizes}
    />
  );
}
