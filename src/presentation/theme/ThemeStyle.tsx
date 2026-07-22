import { buildThemeVars, varsToCss } from '@/presentation/theme/buildThemeVars';
import type { ThemeSettings } from '@/domain/entities/Settings';

/**
 * SSR-injects theme CSS variables for both modes plus the background-pattern layer.
 * Rendered in <head> so the first paint already has the right theme — no flash.
 */
export function ThemeStyle({ theme }: { theme: ThemeSettings }) {
  const light = buildThemeVars(theme, 'light');
  const dark = buildThemeVars(theme, 'dark');

  const css = [
    `:root { ${varsToCss(light)} }`,
    `:root[data-theme='dark'] { ${varsToCss(dark)} }`,
    `@media (prefers-color-scheme: dark) { :root:not([data-theme='light']) { ${varsToCss(dark)} } }`,
    `.pattern-layer::before { content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: var(--pattern-opacity, 0.06); ${light['--pattern-css'] ?? ''} }`,
  ].join('\n');

  return <style id="mk-theme" dangerouslySetInnerHTML={{ __html: css }} />;
}
