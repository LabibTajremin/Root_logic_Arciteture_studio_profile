import { z } from 'zod';
import { type Result, err, ok } from '@/domain/shared/Result';
import { ValidationError, type DomainError } from '@/domain/errors/DomainError';
import type { Inquiry, InquiryRepository } from '@/domain/repositories/InquiryRepository';
import type { IdGeneratorPort } from '@/application/ports/IdGeneratorPort';

export const submitInquirySchema = z.object({
  name: z.string().min(1, 'Please enter your name').max(120),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().max(40).nullable().optional(),
  message: z.string().min(1, 'Please enter a message').max(4000),
  source: z.string().max(120).nullable().optional(),
});
export type SubmitInquiryInput = z.infer<typeof submitInquirySchema>;

export interface SubmitInquiryDeps {
  inquiries: InquiryRepository;
  ids: IdGeneratorPort;
}

/**
 * Public contact-form submission. Validation lives here; rate limiting is applied at
 * the delivery boundary (the server action) before this runs.
 */
export class SubmitInquiry {
  constructor(private readonly deps: SubmitInquiryDeps) {}

  async execute(
    tenantId: string,
    input: SubmitInquiryInput,
  ): Promise<Result<Inquiry, DomainError>> {
    const parsed = submitInquirySchema.safeParse(input);
    if (!parsed.success) {
      return err(new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid submission'));
    }
    const data = parsed.data;
    const inquiry = await this.deps.inquiries.create({
      id: this.deps.ids.generate(),
      tenantId,
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      message: data.message,
      source: data.source ?? null,
    });
    return ok(inquiry);
  }
}
