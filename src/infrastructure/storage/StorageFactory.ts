import { LocalStorageAdapter } from '@/infrastructure/storage/adapters/LocalStorageAdapter';
import { S3StorageAdapter } from '@/infrastructure/storage/adapters/S3StorageAdapter';
import { R2StorageAdapter } from '@/infrastructure/storage/adapters/R2StorageAdapter';
import { SupabaseStorageAdapter } from '@/infrastructure/storage/adapters/SupabaseStorageAdapter';
import { GoogleDriveStorageAdapter } from '@/infrastructure/storage/adapters/GoogleDriveStorageAdapter';
import { BunnyStorageAdapter } from '@/infrastructure/storage/adapters/BunnyStorageAdapter';
import type { StoragePort } from '@/application/ports/StoragePort';
import type { AppConfig } from '@config/app.config';

/**
 * Picks a storage adapter from the numeric STORAGE_DRIVER code.
 *
 * Adding a driver = one adapter file + one case here + one comment block in the config
 * legend. Nothing else in the app changes.
 */
export class StorageFactory {
  static create(config: AppConfig): StoragePort {
    const raw = config.raw;
    switch (config.storage.driver) {
      case 'local':
        return new LocalStorageAdapter({
          rootDir: raw.LOCAL_STORAGE_DIR!,
          publicBaseUrl: `${config.appUrl.replace(/\/$/, '')}/uploads`,
        });
      case 's3':
        return new S3StorageAdapter({
          bucket: raw.S3_BUCKET!,
          region: raw.S3_REGION!,
          accessKeyId: raw.S3_ACCESS_KEY_ID!,
          secretAccessKey: raw.S3_SECRET_ACCESS_KEY!,
          endpoint: raw.S3_ENDPOINT,
        });
      case 'r2':
        return new R2StorageAdapter({
          bucket: raw.R2_BUCKET!,
          accountId: raw.R2_ACCOUNT_ID!,
          accessKeyId: raw.R2_ACCESS_KEY_ID!,
          secretAccessKey: raw.R2_SECRET_ACCESS_KEY!,
        });
      case 'supabase':
        return new SupabaseStorageAdapter({
          url: raw.SUPABASE_URL!,
          serviceRoleKey: raw.SUPABASE_SERVICE_ROLE_KEY!,
          bucket: raw.SUPABASE_STORAGE_BUCKET!,
        });
      case 'google-drive':
        return new GoogleDriveStorageAdapter({
          folderId: raw.GOOGLE_DRIVE_FOLDER_ID!,
          serviceAccountJsonBase64: raw.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64!,
        });
      case 'bunny-storage':
        return new BunnyStorageAdapter({
          zone: raw.BUNNY_STORAGE_ZONE!,
          apiKey: raw.BUNNY_STORAGE_API_KEY!,
          hostname: raw.BUNNY_STORAGE_HOSTNAME!,
        });
      default: {
        // Exhaustiveness guard: a new driver must add a case above.
        const _never: never = config.storage.driver;
        throw new Error(`Unsupported storage driver: ${String(_never)}`);
      }
    }
  }
}
