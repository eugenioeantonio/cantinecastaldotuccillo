import Image from "next/image";
import type { PhotoSlot } from "@/lib/photo-slots";

/**
 * A photograph, or — until the real one exists — a quiet plate of volcanic
 * material with its caption. In development the plate also states exactly
 * which photograph it is waiting for.
 */
export function PhotoPlate({
  slot,
  className = "",
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
}: {
  slot: PhotoSlot;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <figure className={`relative ${className}`}>
      <div
        className="plate relative w-full overflow-hidden"
        style={{ aspectRatio: String(slot.ratio) }}
        data-photo-slot={slot.src ? undefined : slot.id}
      >
        {slot.src ? (
          <Image src={slot.src} alt={slot.alt} fill sizes={sizes} priority={priority} className="object-cover" />
        ) : (
          <>
            <span aria-hidden className="plate-material absolute inset-0" />
            {process.env.NODE_ENV !== "production" && (
              <span className="absolute inset-3 flex items-end border border-dashed border-gold/30 p-3 text-[11px] leading-snug text-gold/80">
                Foto da inserire — {slot.brief}
              </span>
            )}
          </>
        )}
      </div>
      <figcaption className="mt-3 text-[11px] uppercase tracking-[0.24em] text-stone/60">
        {slot.caption}
      </figcaption>
    </figure>
  );
}
