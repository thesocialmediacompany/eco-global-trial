import Image from "next/image";

/**
 * The Eco Global Foods emblem. Renders the brand mark at
 * `public/brand/logo-mark.svg` - replace that file with the official logo to
 * update it everywhere (header, footer, admin). `className` controls the box.
 */
export function BrandMark({
  className = "h-10 w-10",
  rounded = true,
}: {
  className?: string;
  rounded?: boolean;
}) {
  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden bg-white ${
        rounded ? "rounded-xl" : ""
      } ${className}`}
    >
      <Image
        src="/brand/logo-mark.svg"
        alt="Eco Global Foods"
        fill
        sizes="48px"
        className="object-contain p-1"
        priority
      />
    </span>
  );
}
