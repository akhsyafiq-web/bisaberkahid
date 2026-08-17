import Image from "next/image";

/** BisaBerkah logo mark (square) — defaults to 56px. */
export function LogoMark({ size = 56, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/brand/logo-mark.svg"
      alt="BisaBerkah"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}

/** Full wordmark (mark + "BisaBerkah"). */
export function LogoWordmark({ width = 180, className }: { width?: number; className?: string }) {
  return (
    <Image
      src="/brand/logo-wordmark.svg"
      alt="BisaBerkah"
      width={width}
      height={Math.round((width * 72) / 320)}
      className={className}
      priority
    />
  );
}
