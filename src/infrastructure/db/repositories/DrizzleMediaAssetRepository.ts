import { and, asc, eq } from 'drizzle-orm';
import { mediaAssets } from '@/infrastructure/db/schema';
import { toMediaAsset } from '@/infrastructure/db/mappers/mediaMapper';
import type { Db } from '@/infrastructure/db/repositories/types';
import type { MediaAsset } from '@/domain/entities/MediaAsset';
import type {
  MediaAssetRepository,
  NewMediaAsset,
} from '@/domain/repositories/MediaAssetRepository';

export class DrizzleMediaAssetRepository implements MediaAssetRepository {
  constructor(private readonly db: Db) {}

  async findById(tenantId: string, id: string): Promise<MediaAsset | null> {
    const [row] = await this.db
      .select()
      .from(mediaAssets)
      .where(and(eq(mediaAssets.tenantId, tenantId), eq(mediaAssets.id, id)))
      .limit(1);
    return row ? toMediaAsset(row) : null;
  }

  async listByProject(tenantId: string, projectId: string): Promise<readonly MediaAsset[]> {
    const rows = await this.db
      .select()
      .from(mediaAssets)
      .where(and(eq(mediaAssets.tenantId, tenantId), eq(mediaAssets.projectId, projectId)))
      .orderBy(asc(mediaAssets.sortOrder));
    return rows.map(toMediaAsset);
  }

  async create(asset: NewMediaAsset): Promise<MediaAsset> {
    const [row] = await this.db.insert(mediaAssets).values(asset).returning();
    return toMediaAsset(row!);
  }

  async update(
    tenantId: string,
    id: string,
    patch: Partial<
      Pick<MediaAsset, 'altText' | 'isDecorative' | 'sortOrder' | 'projectId' | 'status'>
    >,
  ): Promise<MediaAsset> {
    const [row] = await this.db
      .update(mediaAssets)
      .set({ ...patch, updatedAt: new Date() })
      .where(and(eq(mediaAssets.tenantId, tenantId), eq(mediaAssets.id, id)))
      .returning();
    if (!row) throw new Error(`Media ${id} not found for tenant ${tenantId}`);
    return toMediaAsset(row);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.db
      .delete(mediaAssets)
      .where(and(eq(mediaAssets.tenantId, tenantId), eq(mediaAssets.id, id)));
  }
}
