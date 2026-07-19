"use client";

import { Children, useState, useTransition } from "react";

/**
 * Drag-to-reorder wrapper.
 *
 * Children are rendered in `ids` order; dragging a tile reorders locally for
 * instant feedback and then persists the whole sequence in one call. Saving the
 * full order (rather than swapping pairs) means a tile dragged across several
 * positions lands correctly in one action.
 *
 * The parent should pass key={ids.join(",")} so this remounts — and its local
 * order resets — once the server revalidates with the new sequence.
 */
export function SortableGrid({
  ids,
  reorder,
  className,
  disabled = false,
  children,
}: {
  ids: string[];
  reorder: (ids: string[]) => Promise<void>;
  className?: string;
  /** Render as a plain grid (e.g. lists where order carries no meaning). */
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const items = Children.toArray(children);
  const [order, setOrder] = useState<number[]>(() => ids.map((_, i) => i));
  const [dragPos, setDragPos] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  // Hooks run first so this early return stays legal.
  if (disabled) return <div className={className}>{children}</div>;

  function drop(targetPos: number) {
    if (dragPos === null || dragPos === targetPos) {
      setDragPos(null);
      return;
    }
    const next = [...order];
    const [moved] = next.splice(dragPos, 1);
    next.splice(targetPos, 0, moved);
    setOrder(next);
    setDragPos(null);
    startTransition(() => {
      reorder(next.map((i) => ids[i]));
    });
  }

  return (
    <div className={`${className ?? ""} ${pending ? "opacity-70 transition-opacity" : ""}`}>
      {order.map((originalIndex, pos) => (
        <div
          key={ids[originalIndex]}
          draggable
          onDragStart={() => setDragPos(pos)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => drop(pos)}
          onDragEnd={() => setDragPos(null)}
          className={`cursor-move ${dragPos === pos ? "opacity-40" : ""}`}
        >
          {items[originalIndex]}
        </div>
      ))}
    </div>
  );
}
