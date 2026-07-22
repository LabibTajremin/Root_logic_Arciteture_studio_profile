import type { PutObjectInput, StoragePort, StoredObject } from '@/application/ports/StoragePort';

export interface BunnyStorageConfig {
  zone: string;
  apiKey: string;
  /** Pull-zone hostname that serves the files over the CDN, e.g. cdn.example.b-cdn.net. */
  hostname: string;
  /** Storage region endpoint; defaults to the primary storage endpoint. */
  storageEndpoint?: string;
}

/** Bunny.net Storage — cheap CDN-attached object storage. */
export class BunnyStorageAdapter implements StoragePort {
  readonly driverCode = 6;

  constructor(private readonly config: BunnyStorageConfig) {}

  private endpoint(): string {
    return this.config.storageEndpoint ?? 'storage.bunnycdn.com';
  }

  async put(input: PutObjectInput): Promise<StoredObject> {
    const res = await fetch(`https://${this.endpoint()}/${this.config.zone}/${input.key}`, {
      method: 'PUT',
      headers: {
        AccessKey: this.config.apiKey,
        'Content-Type': input.contentType,
      },
      body: input.body,
    });
    if (!res.ok) {
      throw new Error(`Bunny upload failed (${res.status}): ${await res.text()}`);
    }
    return { key: input.key, url: await this.getUrl(input.key), driver: this.driverCode };
  }

  async delete(key: string): Promise<void> {
    const res = await fetch(`https://${this.endpoint()}/${this.config.zone}/${key}`, {
      method: 'DELETE',
      headers: { AccessKey: this.config.apiKey },
    });
    if (!res.ok && res.status !== 404) {
      throw new Error(`Bunny delete failed (${res.status})`);
    }
  }

  async getUrl(key: string): Promise<string> {
    return `https://${this.config.hostname.replace(/\/$/, '')}/${key}`;
  }
}
