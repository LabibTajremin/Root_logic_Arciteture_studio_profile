import type { MediaType } from '@/domain/entities/enums';

export interface MediaAsset {
  readonly id: string;
  readonly tenantId: string;
  readonly projectId: string | null;
  readonly type: MediaType;
  /** Numeric storage-driver code (see config STORAGE_DRIVERS) recorded per asset. */
  readonly storageDriver: number;
  readonly storageKey: string;
  readonly url: string;
  readonly width: number | null;
  readonly height: number | null;
  readonly durationS: number | null;
  readonly blurhash: string | null;
  readonly altText: string | null;
  readonly isDecorative: boolean;
  readonly sortOrder: number;
  readonly status: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
