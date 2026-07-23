'use client';

import { useActionState } from 'react';
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

export function AppearanceForm({ current }: { current: AppearanceValues }) {
  const [state, action, pending] = useActionState<AppearanceState, FormData>(
    updateAppearanceAction,
    {},
  );

  return (
    <form action={action} className="flex max-w-xl flex-col gap-5">
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

      <label className="flex flex-col gap-1.5 text-sm">
        Accent
        <select name="accentId" defaultValue={current.accentId} className={select}>
          {ACCENTS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        Background pattern
        <select name="patternId" defaultValue={current.patternId} className={select}>
          {PATTERNS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

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
        className="min-h-11 self-start rounded-md bg-[var(--accent)] px-5 font-medium text-[var(--accent-foreground)] disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Save appearance'}
      </button>
    </form>
  );
}
