import { JWT } from 'google-auth-library';
import type { PutObjectInput, StoragePort, StoredObject } from '@/application/ports/StoragePort';

export interface GoogleDriveStorageConfig {
  folderId: string;
  /** base64 of the service-account JSON. */
  serviceAccountJsonBase64: string;
}

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

/**
 * Google Drive via a service account. Good for archival/small-scale delivery, weak for
 * streaming (see DEC-2). The returned `key` is the Drive fileId; the DB caches the
 * file→URL mapping so we never hit the Drive API on every page render.
 */
export class GoogleDriveStorageAdapter implements StoragePort {
  readonly driverCode = 2;
  private client: JWT | null = null;

  constructor(private readonly config: GoogleDriveStorageConfig) {}

  private auth(): JWT {
    if (!this.client) {
      const json = JSON.parse(
        Buffer.from(this.config.serviceAccountJsonBase64, 'base64').toString('utf8'),
      ) as ServiceAccount;
      this.client = new JWT({
        email: json.client_email,
        key: json.private_key,
        scopes: ['https://www.googleapis.com/auth/drive'],
      });
    }
    return this.client;
  }

  private async token(): Promise<string> {
    const { token } = await this.auth().getAccessToken();
    if (!token) throw new Error('Failed to obtain Google Drive access token');
    return token;
  }

  async put(input: PutObjectInput): Promise<StoredObject> {
    const token = await this.token();
    const boundary = `mk-${Date.now()}`;
    const metadata = JSON.stringify({ name: input.key, parents: [this.config.folderId] });
    const preamble =
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n` +
      `--${boundary}\r\nContent-Type: ${input.contentType}\r\n\r\n`;
    const closing = `\r\n--${boundary}--`;
    const body = Buffer.concat([
      Buffer.from(preamble, 'utf8'),
      Buffer.from(input.body),
      Buffer.from(closing, 'utf8'),
    ]);

    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body,
      },
    );
    if (!res.ok) throw new Error(`Drive upload failed (${res.status}): ${await res.text()}`);
    const { id } = (await res.json()) as { id: string };

    if (input.visibility === 'public') {
      await fetch(`https://www.googleapis.com/drive/v3/files/${id}/permissions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'reader', type: 'anyone' }),
      });
    }
    return { key: id, url: await this.getUrl(id), driver: this.driverCode };
  }

  async delete(fileId: string): Promise<void> {
    const token = await this.token();
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok && res.status !== 404) throw new Error(`Drive delete failed (${res.status})`);
  }

  async getUrl(fileId: string): Promise<string> {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
}
