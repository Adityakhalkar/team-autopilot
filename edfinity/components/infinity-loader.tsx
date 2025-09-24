import Image from 'next/image';

interface InfinityLoaderProps {
  size?: number;
  className?: string;
}

export default function InfinityLoader({ size = 32, className = "" }: InfinityLoaderProps) {
  return (
    <Image
      src="/infinity-loader.svg"
      alt="Loading..."
      width={size}
      height={size}
      className={`${className}`}
      priority
    />
  );
}