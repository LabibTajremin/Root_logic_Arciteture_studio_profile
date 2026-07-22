import { S3StorageAdapter } from '@/infrastructure/storage/adapters/S3StorageAdapter';

export interface R2StorageConfig {
  bucket: string;
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl?: string;
}

/**
 * Cloudflare R2 speaks the S3 API with zero egress fees. It is the S3 adapter pointed
 * at the account's R2 endpoint with driver code 4.
 */
export class R2StorageAdapter extends S3StorageAdapter {
  constructor(config: R2StorageConfig) {
    super({
      bucket: config.bucket,
      region: 'auto',
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      forcePathStyle: true,
      publicBaseUrl: config.publicBaseUrl,
      driverCode: 4,
    });
  }
}
