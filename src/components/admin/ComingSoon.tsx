import { Construction } from "lucide-react";

export function ComingSoon({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-2xl font-semibold text-purple-900">{title}</h1>
      <div className="mt-6 grid place-items-center rounded-xl border border-dashed border-purple-200 bg-white/60 py-20 text-center">
        <Construction className="h-10 w-10 text-purple-300" />
        <p className="mt-4 font-medium text-purple-900">Coming in a later milestone</p>
        <p className="mt-1 max-w-sm text-sm text-purple-900/55">
          {note ?? "This section is scaffolded and ready to build out next."}
        </p>
      </div>
    </div>
  );
}
