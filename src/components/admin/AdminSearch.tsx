import { Search } from "lucide-react";

/**
 * A self-contained admin search box. It is a plain GET <form>, so submitting
 * (Enter or the button) reloads the SAME page with `?q=...`, which the server
 * component reads from searchParams to filter its list. No client JS needed,
 * and it degrades gracefully. Clearing the box and submitting shows everything.
 */
export function AdminSearch({
  defaultValue = "",
  placeholder = "Search…",
  hidden,
  className = "max-w-xs",
}: {
  defaultValue?: string;
  placeholder?: string;
  /**
   * Other query params to carry through the submit. A GET form sends only its
   * own fields, so without these anything already in the URL (an active tab,
   * say) would be dropped the moment someone searches.
   */
  hidden?: Record<string, string>;
  className?: string;
}) {
  return (
    <form className={`relative w-full ${className}`} role="search">
      {Object.entries(hidden ?? {}).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-900/40" />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-lg border border-purple-100 bg-white py-2 pl-9 pr-3 text-sm text-purple-900 outline-none transition focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
      />
    </form>
  );
}
