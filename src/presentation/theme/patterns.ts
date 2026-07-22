/**
 * Background pattern registry (22). Each pattern is pure CSS/SVG (no raster images),
 * tinted from `--pattern-color` and faded by `--pattern-opacity`. `css` returns the
 * declarations for the fixed, pointer-events:none layer behind content.
 */
export interface Pattern {
  id: string;
  name: string;
  /** CSS `background` declarations (image + size), tinted via var(--pattern-color). */
  css: string;
}

const c = 'var(--pattern-color, currentColor)';

export const PATTERNS: readonly Pattern[] = [
  { id: 'none', name: 'None', css: 'background: none;' },
  {
    id: 'fine-grid',
    name: 'Fine Grid',
    css: `background-image: linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px); background-size: 24px 24px;`,
  },
  {
    id: 'blueprint-grid',
    name: 'Blueprint Grid',
    css: `background-image: linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px), linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px); background-size: 96px 96px, 96px 96px, 24px 24px, 24px 24px;`,
  },
  {
    id: 'dot-matrix',
    name: 'Dot Matrix',
    css: `background-image: radial-gradient(${c} 1.2px, transparent 1.2px); background-size: 20px 20px;`,
  },
  {
    id: 'diagonal-hatch',
    name: 'Diagonal Hatch',
    css: `background-image: repeating-linear-gradient(45deg, ${c} 0, ${c} 1px, transparent 1px, transparent 12px);`,
  },
  {
    id: 'cross-hatch',
    name: 'Cross Hatch',
    css: `background-image: repeating-linear-gradient(45deg, ${c} 0, ${c} 1px, transparent 1px, transparent 12px), repeating-linear-gradient(-45deg, ${c} 0, ${c} 1px, transparent 1px, transparent 12px);`,
  },
  {
    id: 'isometric',
    name: 'Isometric',
    css: `background-image: repeating-linear-gradient(30deg, ${c} 0, ${c} 1px, transparent 1px, transparent 20px), repeating-linear-gradient(150deg, ${c} 0, ${c} 1px, transparent 1px, transparent 20px), repeating-linear-gradient(270deg, ${c} 0, ${c} 1px, transparent 1px, transparent 20px);`,
  },
  {
    id: 'subtle-noise',
    name: 'Subtle Noise/Grain',
    css: `background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");`,
  },
  {
    id: 'topographic',
    name: 'Topographic Lines',
    css: `background-image: repeating-radial-gradient(circle at 30% 40%, transparent 0, transparent 18px, ${c} 18px, ${c} 19px);`,
  },
  {
    id: 'concentric-arcs',
    name: 'Concentric Arcs',
    css: `background-image: repeating-radial-gradient(circle at 100% 0, transparent 0, transparent 28px, ${c} 28px, ${c} 29px);`,
  },
  {
    id: 'herringbone',
    name: 'Herringbone',
    css: `background-image: repeating-linear-gradient(45deg, ${c} 0 1px, transparent 1px 10px), repeating-linear-gradient(135deg, ${c} 0 1px, transparent 1px 10px); background-size: 20px 20px;`,
  },
  {
    id: 'terrazzo',
    name: 'Terrazzo',
    css: `background-image: radial-gradient(${c} 2px, transparent 2.5px), radial-gradient(${c} 1.5px, transparent 2px), radial-gradient(${c} 1px, transparent 1.5px); background-size: 60px 60px, 42px 42px, 28px 28px; background-position: 0 0, 12px 18px, 30px 8px;`,
  },
  {
    id: 'linen-weave',
    name: 'Linen Weave',
    css: `background-image: repeating-linear-gradient(0deg, ${c} 0 1px, transparent 1px 4px), repeating-linear-gradient(90deg, ${c} 0 1px, transparent 1px 4px);`,
  },
  {
    id: 'marble-veins',
    name: 'Marble Veins',
    css: `background-image: repeating-linear-gradient(115deg, transparent 0 40px, ${c} 40px 41px, transparent 41px 44px, ${c} 44px 45px, transparent 45px 90px);`,
  },
  {
    id: 'art-deco-fan',
    name: 'Art Deco Fan',
    css: `background-image: repeating-conic-gradient(from 0deg at 0 100%, ${c} 0deg 1deg, transparent 1deg 12deg); background-size: 80px 80px;`,
  },
  {
    id: 'moroccan-trellis',
    name: 'Moroccan Trellis',
    css: `background-image: radial-gradient(circle at 50% 0, transparent 12px, ${c} 12px 13px, transparent 13px), radial-gradient(circle at 50% 100%, transparent 12px, ${c} 12px 13px, transparent 13px); background-size: 26px 26px;`,
  },
  {
    id: 'hexagon-mesh',
    name: 'Hexagon Mesh',
    css: `background-image: repeating-linear-gradient(60deg, ${c} 0 1px, transparent 1px 18px), repeating-linear-gradient(-60deg, ${c} 0 1px, transparent 1px 18px), repeating-linear-gradient(0deg, ${c} 0 1px, transparent 1px 18px);`,
  },
  {
    id: 'vertical-pinstripe',
    name: 'Vertical Pinstripe',
    css: `background-image: repeating-linear-gradient(90deg, ${c} 0 1px, transparent 1px 8px);`,
  },
  {
    id: 'wave-contour',
    name: 'Wave Contour',
    css: `background-image: repeating-radial-gradient(circle at 50% 120%, transparent 0 20px, ${c} 20px 21px);`,
  },
  {
    id: 'blueprint-corner-rules',
    name: 'Blueprint Corner Rules',
    css: `background-image: linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px); background-size: 120px 120px; background-position: 0 0;`,
  },
  {
    id: 'soft-radial-glow',
    name: 'Soft Radial Glow',
    css: `background-image: radial-gradient(circle at 50% 0, ${c} 0, transparent 60%);`,
  },
  {
    id: 'mesh-gradient',
    name: 'Mesh Gradient',
    css: `background-image: radial-gradient(at 20% 20%, ${c} 0, transparent 40%), radial-gradient(at 80% 30%, ${c} 0, transparent 35%), radial-gradient(at 50% 80%, ${c} 0, transparent 45%);`,
  },
];

export const PATTERNS_BY_ID: ReadonlyMap<string, Pattern> = new Map(PATTERNS.map((p) => [p.id, p]));
