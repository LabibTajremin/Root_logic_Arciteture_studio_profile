import {
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type {
  MultipartTicket,
  PutObjectInput,
  StoragePort,
  StoredObject,
} from '@/application/ports/StoragePort';

export interface S3StorageConfig {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  /** Custom endpoint for S3-compatible stores (MinIO, Wasabi, B2, Cloudflare R2). */
  endpoint?: string;
  forcePathStyle?: boolean;
  /** Optional CDN/public base URL for public objects. */
  publicBaseUrl?: string;
  driverCode?: number;
}

/**
 * Amazon S3 and any S3-compatible store. Public objects return a stable URL; private
 * objects return a presigned GET. Large uploads use multipart with presigned part URLs
 * so the browser can upload directly.
 */
export class S3StorageAdapter implements StoragePort {
  readonly driverCode: number;
  private readonly client: S3Client;

  constructor(private readonly config: S3StorageConfig) {
    this.driverCode = config.driverCode ?? 1;
    this.client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: config.forcePathStyle ?? Boolean(config.endpoint),
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async put(input: PutObjectInput): Promise<StoredObject> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
      }),
    );
    return { key: input.key, url: await this.getUrl(input.key), driver: this.driverCode };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.config.bucket, Key: key }));
  }

  async getUrl(key: string, opts?: { expiresInSeconds?: number }): Promise<string> {
    if (this.config.publicBaseUrl) {
      return `${this.config.publicBaseUrl.replace(/\/$/, '')}/${key}`;
    }
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.config.bucket, Key: key }),
      { expiresIn: opts?.expiresInSeconds ?? 3600 },
    );
  }

  async createMultipartUpload(input: {
    key: string;
    contentType: string;
    parts?: number;
  }): Promise<MultipartTicket> {
    const created = await this.client.send(
      new CreateMultipartUploadCommand({
        Bucket: this.config.bucket,
        Key: input.key,
        ContentType: input.contentType,
      }),
    );
    const partCount = input.parts ?? 1;
    const parts = await Promise.all(
      Array.from({ length: partCount }).map(async (_, i) => ({
        partNumber: i + 1,
        url: await getSignedUrl(
          this.client,
          new UploadPartCommand({
            Bucket: this.config.bucket,
            Key: input.key,
            UploadId: created.UploadId,
            PartNumber: i + 1,
          }),
          { expiresIn: 3600 },
        ),
      })),
    );
    return { key: input.key, uploadId: created.UploadId!, parts };
  }
}
