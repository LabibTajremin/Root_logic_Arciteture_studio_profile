import { randomUUID } from 'node:crypto';
import type { IdGeneratorPort } from '@/application/ports/IdGeneratorPort';
import type { ClockPort } from '@/application/ports/ClockPort';

export class CryptoIdGenerator implements IdGeneratorPort {
  generate(): string {
    return randomUUID();
  }
}

export class SystemClock implements ClockPort {
  now(): Date {
    return new Date();
  }
}
