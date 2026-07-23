export interface Tenant {
  readonly id: string;
  readonly slug: string;
  readonly customDomain: string | null;
  readonly plan: string;
  readonly status: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
