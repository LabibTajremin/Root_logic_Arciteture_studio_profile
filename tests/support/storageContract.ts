import { describe, expect, it } from 'vitest';
import type { StoragePort } from '@/application/ports/StoragePort';

export interface StorageContractDeps {
  /** Fresh adapter under test. */
  adapter: StoragePort;
  /** Read an object's bytes back out-of-band, or null if it does not exist. */
  readBack(key: string): Promise<Buffer | null>;
  expectedDriverCode: number;
}

/**
 * The behavioural contract every StoragePort adapter must satisfy. Reused by the Local
 * (always-on) and S3/MinIO (flagged) suites so all drivers are held to the same bar.
 */
export function storageContract(name: string, makeDeps: () => Promise<StorageContractDeps>) {
  describe(`StoragePort contract: ${name}`, () => {
    it('reports its numeric driver code', async () => {
      const { adapter, expectedDriverCode } = await makeDeps();
      expect(adapter.driverCode).toBe(expectedDriverCode);
    });

    it('stores an object and reads the same bytes back', async () => {
      const { adapter, readBack } = await makeDeps();
      const key = `contract/${Date.now()}-hello.txt`;
      const body = Buffer.from('hello storage contract');

      const stored = await adapter.put({
        key,
        body,
        contentType: 'text/plain',
        visibility: 'public',
      });
      expect(stored.key).toBe(key);
      expect(stored.url).toContain(encodeURI(key).split('/').pop()!.split('.')[0]!);

      const round = await readBack(key);
      expect(round?.equals(body)).toBe(true);

      await adapter.delete(key);
    });

    it('returns a usable URL for a stored object', async () => {
      const { adapter } = await makeDeps();
      const key = `contract/${Date.now()}-url.txt`;
      await adapter.put({
        key,
        body: Buffer.from('x'),
        contentType: 'text/plain',
        visibility: 'public',
      });
      const url = await adapter.getUrl(key);
      expect(url).toMatch(/^https?:\/\//);
      await adapter.delete(key);
    });

    it('deletes an object so it can no longer be read', async () => {
      const { adapter, readBack } = await makeDeps();
      const key = `contract/${Date.now()}-del.txt`;
      await adapter.put({
        key,
        body: Buffer.from('bye'),
        contentType: 'text/plain',
        visibility: 'public',
      });
      await adapter.delete(key);
      expect(await readBack(key)).toBeNull();
    });

    it('treats delete of a missing object as a no-op', async () => {
      const { adapter } = await makeDeps();
      await expect(adapter.delete(`contract/does-not-exist-${Date.now()}`)).resolves.not.toThrow();
    });
  });
}
