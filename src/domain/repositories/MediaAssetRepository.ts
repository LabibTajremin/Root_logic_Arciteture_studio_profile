import type { MediaAsset } from '@/domain/entities/MediaAsset';

export type NewMediaAsset = Omit<MediaAsset, 'createdAt' | 'updatedAt'>;

export interface MediaAssetRepository {
  findById(tenantId: string, id: string): Promise<MediaAsset | null>;
  listByProject(tenantId: string, projectId: string): Promise<readonly MediaAsset[]>;
  create(asset: NewMediaAsset): Promise<MediaAsset>;
  update(
    tenantId: string,
    id: string,
    patch: Partial<
      Pick<MediaAsset, 'altText' | 'isDecorative' | 'sortOrder' | 'projectId' | 'status'>
    >,
  ): Promise<MediaAsset>;
  delete(tenantId: string, id: string): Promise<void>;
}
