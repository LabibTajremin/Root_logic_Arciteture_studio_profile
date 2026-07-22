import type { PutObjectInput, StoragePort, StoredObject } from '@/application/ports/StoragePort';

export interface SupabaseStorageConfig {
  url: string;
  serviceRoleKey: string;
  bucket: string;
}

/** Supabase Storage via its REST API — easiest when the DB is already Supabase. */
export class SupabaseStorageAdapter implements StoragePort {
  readonly driverCode = 5;

  constructor(private readonly config: SupabaseStorageConfig) {}

  private base(): string {
    return `${this.config.url.replace(/\/$/, '')}/storage/v1`;
  }

  private headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.config.serviceRoleKey}`,
      apikey: this.config.serviceRoleKey,
    };
  }

  async put(input: PutObjectInput): Promise<StoredObject> {
    const res = await fetch(`${this.base()}/object/${this.config.bucket}/${input.key}`, {
      method: 'POST',
      headers: {
        ...this.headers(),
        'Content-Type': input.contentType,
        'x-upsert': 'true',
      },
      body: input.body,
    });
    if (!res.ok) {
      throw new Error(`Supabase upload failed (${res.status}): ${await res.text()}`);
    }
    return { key: input.key, url: await this.getUrl(input.key), driver: this.driverCode };
  }

  async delete(key: string): Promise<void> {
    const res = await fetch(`${this.base()}/object/${this.config.bucket}/${key}`, {
      method: 'DELETE',
      headers: this.headers(),
    });
    if (!res.ok && res.status !== 404) {
      throw new Error(`Supabase delete failed (${res.status})`);
    }
  }

  async getUrl(key: string, opts?: { expiresInSeconds?: number }): Promise<string> {
    if (opts?.expiresInSeconds) {
      const res = await fetch(`${this.base()}/object/sign/${this.config.bucket}/${key}`, {
        method: 'POST',
        headers: { ...this.headers(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresIn: opts.expiresInSeconds }),
      });
      if (!res.ok) throw new Error(`Supabase sign failed (${res.status})`);
      const { signedURL } = (await res.json()) as { signedURL: string };
      return `${this.config.url.replace(/\/$/, '')}/storage/v1${signedURL}`;
    }
    return `${this.base()}/object/public/${this.config.bucket}/${key}`;
  }
}
