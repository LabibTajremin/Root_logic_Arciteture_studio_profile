import { and, desc, eq } from 'drizzle-orm';
import { inquiries } from '@/infrastructure/db/schema';
import type { Db } from '@/infrastructure/db/repositories/types';
import type {
  Inquiry,
  InquiryRepository,
  NewInquiry,
} from '@/domain/repositories/InquiryRepository';

export class DrizzleInquiryRepository implements InquiryRepository {
  constructor(private readonly db: Db) {}

  async create(inquiry: NewInquiry): Promise<Inquiry> {
    const [row] = await this.db.insert(inquiries).values(inquiry).returning();
    return toInquiry(row!);
  }

  async listUnread(tenantId: string): Promise<readonly Inquiry[]> {
    const rows = await this.db
      .select()
      .from(inquiries)
      .where(and(eq(inquiries.tenantId, tenantId), eq(inquiries.isRead, false)))
      .orderBy(desc(inquiries.createdAt));
    return rows.map(toInquiry);
  }

  async markRead(tenantId: string, id: string): Promise<void> {
    await this.db
      .update(inquiries)
      .set({ isRead: true, updatedAt: new Date() })
      .where(and(eq(inquiries.tenantId, tenantId), eq(inquiries.id, id)));
  }
}

function toInquiry(row: typeof inquiries.$inferSelect): Inquiry {
  return {
    id: row.id,
    tenantId: row.tenantId,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    source: row.source,
    isRead: row.isRead,
    createdAt: row.createdAt,
  };
}
