export type Visibility = 'public' | 'private';

export interface PutObjectInput {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
  visibility: Visibility;
}

export interface StoredObject {
  key: string;
  url: string;
  /** Numeric storage-driver code (see config STORAGE_DRIVERS) that produced this object. */
  driver: number;
}

export interface MultipartTicket {
  key: string;
  uploadId: string;
  /** Presigned part URLs (S3-family) or a resumable-session URL (Drive). */
  parts?: { partNumber: number; url: string }[];
  sessionUrl?: string;
}

/**
 * Storage boundary. Adapters implement this; StorageFactory picks one from the numeric
 * STORAGE_DRIVER code. Large uploads use presigned/multipart direct-to-storage where
 * the driver supports it, so the Node process never buffers a large video.
 */
export interface StoragePort {
  readonly driverCode: number;
  put(input: PutObjectInput): Promise<StoredObject>;
  delete(key: string): Promise<void>;
  getUrl(key: string, opts?: { expiresInSeconds?: number }): Promise<string>;
  createMultipartUpload?(input: { key: string; contentType: string }): Promise<MultipartTicket>;
}
