export interface Inquiry {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string | null;
  readonly message: string;
  readonly source: string | null;
  readonly isRead: boolean;
  readonly createdAt: Date;
}

export type NewInquiry = Omit<Inquiry, 'createdAt' | 'isRead'>;

export interface InquiryRepository {
  create(inquiry: NewInquiry): Promise<Inquiry>;
  listUnread(tenantId: string): Promise<readonly Inquiry[]>;
  markRead(tenantId: string, id: string): Promise<void>;
}
