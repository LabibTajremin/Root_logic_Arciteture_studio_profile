'use server';

import { headers } from 'next/headers';
import { createContainer } from '@/infrastructure/container';
import { resolveActiveTenantId } from '@/infrastructure/auth/tenant';
import { RateLimiter } from '@/infrastructure/auth/RateLimiter';

// 5 submissions per 10 minutes per IP.
const contactLimiter = new RateLimiter(5, 10 * 60 * 1000);

export interface ContactState {
  status: 'idle' | 'ok' | 'error';
  message?: string;
}

export async function submitContactAction(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const hdrs = await headers();
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!contactLimiter.check(ip).allowed) {
    return { status: 'error', message: 'Too many messages — please try again later.' };
  }

  const tenantId = await resolveActiveTenantId();
  if (!tenantId) return { status: 'error', message: 'Unable to accept messages right now.' };

  const { useCases } = createContainer();
  const result = await useCases.submitInquiry.execute(tenantId, {
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    phone: (formData.get('phone') as string) || null,
    message: String(formData.get('message') ?? ''),
    source: 'contact-page',
  });

  if (!result.ok) return { status: 'error', message: result.error.message };
  return { status: 'ok', message: 'Thanks — we’ll be in touch shortly.' };
}
