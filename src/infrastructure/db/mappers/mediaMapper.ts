import type { InferSelectModel } from 'drizzle-orm';
import type { mediaAssets } from '@/infrastructure/db/schema';
import type { MediaAsset } from '@/domain/entities/MediaAsset';
import type { MediaType } from '@/domain/entities/enums';

type MediaRow = InferSelectModel<typeof mediaAssets>;

export function toMediaAsset(row: MediaRow): MediaAsset {
  return {
    id: row.id,
    tenantId: row.tenantId,
    projectId: row.projectId,
    type: row.type as MediaType,
    storageDriver: row.storageDriver,
    storageKey: row.storageKey,
    url: row.url,
    width: row.width,
    height: row.height,
    durationS: row.durationS,
    blurhash: row.blurhash,
    altText: row.altText,
    isDecorative: row.isDecorative,
    sortOrder: row.sortOrder,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
