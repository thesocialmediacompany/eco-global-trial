import { FileText, Download } from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

export interface CatalogItem {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  sizeLabel: string;
}

/** Grid of downloadable catalog / brochure PDF cards. */
export function CatalogDownloads({ items }: { items: CatalogItem[] }) {
  if (items.length === 0) return null;

  return (
    <RevealGroup stagger={0.06} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((c) => {
        const disabled = !c.fileUrl;
        const Tag = disabled ? "div" : "a";
        return (
          <RevealItem key={c.id}>
            <Tag
              {...(disabled
                ? {}
                : { href: c.fileUrl, target: "_blank", rel: "noopener noreferrer", download: true })}
              className={`flex h-full items-start gap-4 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm transition ${
                disabled ? "opacity-70" : "hover:-translate-y-1 hover:border-purple-200 hover:shadow-md"
              }`}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600">
                <FileText className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-base font-semibold text-purple-900">
                  {c.title}
                </h3>
                {c.description && (
                  <p className="mt-1 text-sm text-purple-900/60">{c.description}</p>
                )}
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-green-700">
                  {disabled ? (
                    "Coming soon"
                  ) : (
                    <>
                      <Download className="h-4 w-4" /> Download PDF
                      {c.sizeLabel && (
                        <span className="font-normal text-purple-900/40">· {c.sizeLabel}</span>
                      )}
                    </>
                  )}
                </span>
              </div>
            </Tag>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}
