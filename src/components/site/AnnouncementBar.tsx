import { getSettings, announcementList } from "@/lib/settings";

/** Thin top ribbon with an infinite marquee of perks (editable in admin Settings). */
export async function AnnouncementBar() {
  const settings = await getSettings();
  const messages = announcementList(settings);
  if (messages.length === 0) return null;

  // duplicate the list so the -50% translate loops seamlessly
  const loop = [...messages, ...messages];
  return (
    <div className="gradient-purple-green text-cream/95 text-xs sm:text-sm overflow-hidden">
      <div className="flex w-max animate-[marquee_28s_linear_infinite] py-2">
        {loop.map((msg, i) => (
          <span key={i} className="mx-8 whitespace-nowrap font-medium tracking-wide">
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
}
