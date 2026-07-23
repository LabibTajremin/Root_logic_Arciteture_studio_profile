import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { describe, it } from 'vitest';
import { S3StorageAdapter } from '@/infrastructure/storage/adapters/S3StorageAdapter';
import { storageContract } from '../../support/storageContract';

/**
 * Runs the storage contract against a real S3-compatible store (MinIO in CI). Guarded
 * by RUN_S3_CONTRACT so it stays out of local runs that have no MinIO; remote drivers
 * (R2/Supabase/Bunny/Drive) share this adapter or REST shape and are exercised the same
 * way behind their own flags.
 */
const enabled = process.env.RUN_S3_CONTRACT === '1';

const endpoint = process.env.S3_ENDPOINT ?? 'http://localhost:9000';
const region = process.env.S3_REGION ?? 'us-east-1';
const bucket = process.env.S3_BUCKET ?? 'mapkathi-test';
const accessKeyId = process.env.S3_ACCESS_KEY_ID ?? 'minioadmin';
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY ?? 'minioadmin';

async function streamToBuffer(stream: unknown): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream as AsyncIterable<Buffer>) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

if (enabled) {
  const client = new S3Client({
    region,
    endpoint,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });

  storageContract('S3StorageAdapter (MinIO)', async () => {
    const adapter = new S3StorageAdapter({
      bucket,
      region,
      accessKeyId,
      secretAccessKey,
      endpoint,
    });
    return {
      adapter,
      expectedDriverCode: 1,
      async readBack(key: string) {
        try {
          const res = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
          return await streamToBuffer(res.Body);
        } catch {
          return null;
        }
      },
    };
  });
} else {
  describe('S3StorageAdapter (MinIO)', () => {
    it.skip('skipped — set RUN_S3_CONTRACT=1 with a MinIO service to run', () => {});
  });
}
