'use client';

import { useActionState, useState } from 'react';
import {
  updateAppearanceAction,
  type AppearanceState,
} from '@/app/(admin)/admin/appearance/actions';
import { ACCENTS } from '@/presentation/theme/accents';
import { PATTERNS } from '@/presentation/theme/patterns';
import { FONT_PAIRS } from '@/presentation/theme/fonts';

const MOTION_PRESETS = ['off', 'subtle', 'refined', 'expressive'];
const MODES = ['system', 'light', 'dark'];

export interface AppearanceValues {
  mode: string;
  accentId: string;
  patternId: string;
  patternOpacity: number;
  motionPreset: string;
  fontPairId: string;
}

const select = 'min-h-11 rounded-md border border-current/15 bg-transparent px-3';

const swatchBase =
  'relative flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-all duration-200 ease-out hover:border-current/40';
const swatchSelected =
  'border-[var(--accent)] ring-2 ring-[var(--accent)] ring-offset-0 scale-[1.02]';
const swatchIdle = 'border-current/15';

export function AppearanceForm({ current }: { current: AppearanceValues }) {
  const [state, action, pending] = useActionState<AppearanceState, FormData>(
    updateAppearanceAction,
    {},
  );
  const [accentId, setAccentId] = useState(current.accentId);
  const [patternId, setPatternId] = useState(current.patternId);

  return (
    <form action={action} className="flex max-w-2xl flex-col gap-6">
      <label className="flex flex-col gap-1.5 text-sm">
        Colour mode
        <select name="mode" defaultValue={current.mode} className={select}>
          {MODES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-2 text-sm">
        <span>Accent</span>
        <input type="hidden" name="accentId" value={accentId} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {ACCENTS.map((a) => {
            const selected = a.id === accentId;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setAccentId(a.id)}
                aria-pressed={selected}
                className={`${swatchBase} ${selected ? swatchSelected : swatchIdle}`}
              >
                <span
                  aria-hidden
                  className="h-5 w-5 shrink-0 rounded-full border border-black/10"
                  style={{ backgroundColor: a.light }}
                />
                <span className="truncate">{a.name}</span>
                {selected && (
                  <span
                    aria-hidden
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--accent)] transition-opacity duration-200"
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <span>Background pattern</span>
        <input type="hidden" name="patternId" value={patternId} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {PATTERNS.map((p) => {
            const selected = p.id === patternId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPatternId(p.id)}
                aria-pressed={selected}
                className={`flex flex-col gap-1.5 rounded-md border p-2 text-left text-xs transition-all duration-200 ease-out hover:border-current/40 ${
                  selected ? swatchSelected : swatchIdle
                }`}
              >
                <span
                  aria-hidden
                  className="relative flex h-12 w-full items-center justify-center overflow-hidden rounded bg-current/5"
                  style={{ ...cssStringToObject(p.css), color: 'currentColor' }}
                >
                  {selected && (
                    <span className="absolute inset-0 flex items-center justify-center bg-[var(--accent)]/10 text-[var(--accent)]">
                      ✓
                    </span>
                  )}
                </span>
                <span className="truncate">{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        Pattern opacity: shown as %
        <input
          type="range"
          name="patternOpacity"
          min={0}
          max={100}
          defaultValue={current.patternOpacity}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        Font pairing
        <select name="fontPairId" defaultValue={current.fontPairId} className={select}>
          {FONT_PAIRS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        Motion
        <select name="motionPreset" defaultValue={current.motionPreset} className={select}>
          {MOTION_PRESETS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      {state.saved && <p className="text-sm text-green-700 dark:text-green-400">Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 self-start rounded-md bg-[var(--accent)] px-5 font-medium text-[var(--accent-foreground)] transition-transform duration-150 active:scale-95 disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Save appearance'}
      </button>
    </form>
  );
}

/** Turns a `"background-image: ...; background-size: ...;"` CSS string into a style object. */
function cssStringToObject(css: string): React.CSSProperties {
  const out: Record<string, string> = {};
  for (const decl of css.split(';')) {
    const [prop, ...rest] = decl.split(':');
    if (!prop || !rest.length) continue;
    const camel = prop.trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    out[camel] = rest.join(':').trim();
  }
  return out as React.CSSProperties;
}
