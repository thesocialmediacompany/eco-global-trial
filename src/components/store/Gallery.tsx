import Image from "next/image";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
  emoji: string;
  gradient: string;
}

/**
 * Photo gallery grid. Each tile shows the uploaded photo, or a styled
 * gradient + emoji placeholder while real photos are still being added.
 */
export function Gallery({ items }: { items: GalleryItem[] }) {
  if (items.length === 0) return null;

  return (
    <RevealGroup
      stagger={0.05}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
    >
      {items.map((g, i) => (
        <RevealItem
          key={g.id}
          className={`group relative overflow-hidden rounded-2xl border border-purple-100 shadow-sm ${
            // vary the aspect ratio a little for a lively, editorial layout
            i % 5 === 0 ? "row-span-2 aspect-[3/4] sm:aspect-[3/5]" : "aspect-square"
          }`}
        >
          {g.url ? (
            <Image
              src={g.url}
              alt={g.caption || "Eco Global Foods"}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className={`flex h-full w-full items-center justify-center ${g.gradient}`}>
              <span className="text-5xl drop-shadow-md sm:text-6xl">{g.emoji}</span>
            </div>
          )}
          {g.caption && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-purple-950/70 to-transparent p-3">
              <p className="text-xs font-medium text-cream sm:text-sm">{g.caption}</p>
            </div>
          )}
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
