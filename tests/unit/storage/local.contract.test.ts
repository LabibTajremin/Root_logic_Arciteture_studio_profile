import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LocalStorageAdapter } from '@/infrastructure/storage/adapters/LocalStorageAdapter';
import { storageContract } from '../../support/storageContract';

storageContract('LocalStorageAdapter', async () => {
  const rootDir = await mkdtemp(join(tmpdir(), 'mk-storage-'));
  const adapter = new LocalStorageAdapter({
    rootDir,
    publicBaseUrl: 'http://localhost:3000/uploads',
  });
  return {
    adapter,
    expectedDriverCode: 3,
    async readBack(key: string) {
      try {
        return await readFile(join(rootDir, key));
      } catch {
        return null;
      }
    },
  };
});
