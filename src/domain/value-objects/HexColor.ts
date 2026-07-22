import { type Result, err, ok } from '@/domain/shared/Result';
import { ValidationError } from '@/domain/errors/DomainError';

const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/** A validated CSS hex colour, normalised to lowercase 6-digit form. */
export class HexColor {
  private constructor(public readonly value: string) {}

  static create(raw: string): Result<HexColor, ValidationError> {
    const trimmed = raw.trim().toLowerCase();
    if (!HEX_RE.test(trimmed)) {
      return err(
        new ValidationError(`"${raw}" is not a valid hex colour (expected #rgb or #rrggbb)`),
      );
    }
    return ok(new HexColor(HexColor.expand(trimmed)));
  }

  private static expand(hex: string): string {
    if (hex.length === 4) {
      const [, r, g, b] = hex;
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    return hex;
  }

  get rgb(): { r: number; g: number; b: number } {
    const r = parseInt(this.value.slice(1, 3), 16);
    const g = parseInt(this.value.slice(3, 5), 16);
    const b = parseInt(this.value.slice(5, 7), 16);
    return { r, g, b };
  }

  /** Relative luminance per WCAG 2.1, used by the contrast checker. */
  get relativeLuminance(): number {
    const channel = (c: number) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    const { r, g, b } = this.rgb;
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  }

  /** WCAG contrast ratio (1–21) against another colour. */
  contrastRatio(other: HexColor): number {
    const l1 = this.relativeLuminance;
    const l2 = other.relativeLuminance;
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  toString(): string {
    return this.value;
  }
}
