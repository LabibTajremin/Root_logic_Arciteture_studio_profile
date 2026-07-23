import { describe, expect, it } from 'vitest';
import { subdomainOf } from '@/infrastructure/tenancy/resolveTenant';

describe('subdomainOf', () => {
  it('extracts the subdomain slug', () => {
    expect(subdomainOf('studio.maapkathi.app')).toBe('studio');
    expect(subdomainOf('studio.maapkathi.app:3000')).toBe('studio');
  });

  it('returns null for an apex domain or missing host', () => {
    expect(subdomainOf('example.com')).toBe('example');
    expect(subdomainOf('localhost')).toBeNull();
    expect(subdomainOf(null)).toBeNull();
  });
});
