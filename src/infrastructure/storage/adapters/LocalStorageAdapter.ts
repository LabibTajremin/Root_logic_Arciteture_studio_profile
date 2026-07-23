import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, normalize, resolve, sep } from 'node:path';
import type { PutObjectInput, StoragePort, StoredObject } from '@/application/ports/StoragePort';

export interface LocalStorageConfig {
  rootDir: string;
  /** Public base URL that serves files under `${publicBaseUrl}/<key>`. */
  publicBaseUrl: string;
}

/**
 * Filesystem adapter for self-hosted VPS deployments with a persistent disk.
 * Not for Vercel. Keys are sanitised to prevent path traversal outside rootDir.
 */
export class LocalStorageAdapter implements StoragePort {
  readonly driverCode = 3;

  constructor(private readonly config: LocalStorageConfig) {}

  private safePath(key: string): string {
    const cleaned = normalize(key).replace(/^([/\\]|\.\.)+/, '');
    const full = resolve(this.config.rootDir, cleaned);
    const root = resolve(this.config.rootDir);
    if (full !== root && !full.startsWith(root + sep)) {
      throw new Error(`Refusing to write outside storage root: ${key}`);
    }
    return full;
  }

  async put(input: PutObjectInput): Promise<StoredObject> {
    const path = this.safePath(input.key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, input.body);
    return { key: input.key, url: await this.getUrl(input.key), driver: this.driverCode };
  }

  async delete(key: string): Promise<void> {
    await rm(this.safePath(key), { force: true });
  }

  async getUrl(key: string): Promise<string> {
    const base = this.config.publicBaseUrl.replace(/\/$/, '');
    return `${base}/${key.split(sep).join('/')}`;
  }

  /** Exposed for a static file route to resolve a key to an on-disk path. */
  resolveKey(key: string): string {
    return join(this.config.rootDir, key);
  }
}
