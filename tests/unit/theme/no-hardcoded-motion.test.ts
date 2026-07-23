import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Guardrail (§7.4.3 / §9.7): no component may hardcode a timing, easing, or translate
 * distance — every animated element must read the shared motion CSS variables. The
 * motion engine itself (src/presentation/theme) is the one allowed home for literals.
 */

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const SCAN_DIRS = ['src/presentation/components', 'src/app'];

// Literals that indicate a component baked in its own motion instead of using vars.
const FORBIDDEN: { label: string; re: RegExp }[] = [
  { label: 'cubic-bezier() literal', re: /cubic-bezier\(/ },
  { label: 'hardcoded ms duration', re: /\b\d{2,}ms\b/ },
  { label: 'hardcoded s duration', re: /transition[^;]*\b\d+(\.\d+)?s\b/ },
  { label: 'tailwind duration-[..]', re: /duration-\[/ },
  { label: 'tailwind ease-[..]', re: /\bease-\[/ },
  { label: 'translate with px literal', re: /translate[XY]?\(-?\d+px/ },
];

function walk(dir: string): string[] {
  const abs = join(ROOT, dir);
  let entries: string[];
  try {
    entries = readdirSync(abs);
  } catch {
    return [];
  }
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(abs, entry);
    if (statSync(full).isDirectory()) {
      files.push(...walk(join(dir, entry)));
    } else if (/\.(tsx?|css)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

describe('no hardcoded motion in components', () => {
  it('components read motion from CSS variables, not literals', () => {
    const offenders: string[] = [];
    for (const dir of SCAN_DIRS) {
      for (const file of walk(dir)) {
        // globals.css defines the variables/keyframes themselves — allowed.
        if (file.endsWith('globals.css')) continue;
        const content = readFileSync(file, 'utf8');
        for (const { label, re } of FORBIDDEN) {
          if (re.test(content)) {
            offenders.push(`${file.replace(ROOT, '')}: ${label}`);
          }
        }
      }
    }
    expect(offenders, offenders.join('\n')).toEqual([]);
  });
});
