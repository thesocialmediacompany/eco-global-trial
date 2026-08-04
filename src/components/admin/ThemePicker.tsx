"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { THEME_PRESETS } from "@/lib/theme";

const DEFAULT_P = "#5e3052";
const DEFAULT_S = "#3c6326";

/**
 * Admin control for the storefront brand colour. Writes the two anchor colours
 * into hidden `brandPurple` / `brandGreen` fields that the Settings form saves;
 * `brandThemeCss` then rebuilds the whole site palette from them. Empty = the
 * built-in Purple & Green theme.
 */
export function ThemePicker({ primary, secondary }: { primary: string; secondary: string }) {
  const [custom, setCustom] = useState(Boolean(primary || secondary));
  const [p, setP] = useState(primary || DEFAULT_P);
  const [s, setS] = useState(secondary || DEFAULT_S);

  const active = !custom
    ? "default"
    : THEME_PRESETS.find(
        (t) =>
          t.key !== "default" &&
          t.primary.toLowerCase() === p.toLowerCase() &&
          t.secondary.toLowerCase() === s.toLowerCase(),
      )?.key ?? "custom";

  return (
    <div>
      {/* Submitted by the surrounding Settings form. Empty = default theme. */}
      <input type="hidden" name="brandPurple" value={custom ? p : ""} />
      <input type="hidden" name="brandGreen" value={custom ? s : ""} />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setCustom(false)}
          className={`flex items-center gap-2 rounded-lg border-2 p-2 text-left text-sm transition ${
            active === "default" ? "border-purple-500" : "border-purple-100 hover:border-purple-300"
          }`}
        >
          <span
            className="h-8 w-8 shrink-0 rounded-md"
            style={{ backgroundImage: `linear-gradient(135deg, ${DEFAULT_P}, ${DEFAULT_S})` }}
          />
          <span className="text-purple-900">Default</span>
          {active === "default" && <Check className="ml-auto h-4 w-4 text-purple-600" />}
        </button>

        {THEME_PRESETS.filter((t) => t.key !== "default").map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setCustom(true);
              setP(t.primary);
              setS(t.secondary);
            }}
            className={`flex items-center gap-2 rounded-lg border-2 p-2 text-left text-sm transition ${
              active === t.key ? "border-purple-500" : "border-purple-100 hover:border-purple-300"
            }`}
          >
            <span
              className="h-8 w-8 shrink-0 rounded-md"
              style={{ backgroundImage: `linear-gradient(135deg, ${t.primary}, ${t.secondary})` }}
            />
            <span className="text-purple-900">{t.label}</span>
            {active === t.key && <Check className="ml-auto h-4 w-4 text-purple-600" />}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-purple-100 bg-cream/40 p-3">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-xs font-medium text-purple-900/70">Primary</span>
            <input
              type="color"
              value={p}
              onChange={(e) => { setP(e.target.value); setCustom(true); }}
              className="h-8 w-12 cursor-pointer rounded border border-purple-200 bg-white"
            />
            <code className="text-xs text-purple-900/60">{custom ? p : DEFAULT_P}</code>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-xs font-medium text-purple-900/70">Secondary</span>
            <input
              type="color"
              value={s}
              onChange={(e) => { setS(e.target.value); setCustom(true); }}
              className="h-8 w-12 cursor-pointer rounded border border-purple-200 bg-white"
            />
            <code className="text-xs text-purple-900/60">{custom ? s : DEFAULT_S}</code>
          </label>
          {custom && (
            <button
              type="button"
              onClick={() => setCustom(false)}
              className="text-xs font-semibold text-purple-600 underline hover:text-purple-800"
            >
              Reset to default
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-purple-900/50">
          Pick a mid-tone colour — the site builds the full range of shades (buttons, text,
          borders, gradients) from it. Changes go live on the store after you press <strong>Save changes</strong>.
        </p>
      </div>
    </div>
  );
}
