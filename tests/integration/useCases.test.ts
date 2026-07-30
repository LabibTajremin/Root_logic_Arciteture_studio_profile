import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { DrizzleProjectRepository } from '@/infrastructure/db/repositories/DrizzleProjectRepository';
import { DrizzleSiteSettingsRepository } from '@/infrastructure/db/repositories/DrizzleSiteSettingsRepository';
import { DrizzleInquiryRepository } from '@/infrastructure/db/repositories/DrizzleInquiryRepository';
import { CryptoIdGenerator, SystemClock } from '@/infrastructure/system/adapters';
import { CreateProject } from '@/application/use-cases/projects/CreateProject';
import { PublishProject } from '@/application/use-cases/projects/PublishProject';
import { UpdateProject } from '@/application/use-cases/projects/UpdateProject';
import { SubmitInquiry } from '@/application/use-cases/inquiries/SubmitInquiry';
import type { ActorContext } from '@/domain/entities/User';
import type { SiteSettings } from '@/domain/entities/Settings';
import { closeTestDb, cleanupTenant, createTenant, getTestDb } from './helpers/testDb';

const db = getTestDb();
const projects = new DrizzleProjectRepository(db);
const site = new DrizzleSiteSettingsRepository(db);
const inquiries = new DrizzleInquiryRepository(db);
const ids = new CryptoIdGenerator();
const clock = new SystemClock();

const createProject = new CreateProject({ projects, site, ids, clock });
const publishProject = new PublishProject({ projects, site, clock });
const updateProject = new UpdateProject({ projects, site });
const submitInquiry = new SubmitInquiry({ inquiries, ids });

let tenantId: string;
let adminId: string;
let admin: ActorContext;
let editor: ActorContext;

function siteSettings(tenant: string, verification: boolean): SiteSettings {
  return {
    tenantId: tenant,
    studioName: 'Test',
    tagline: null,
    logoLightMediaId: null,
    logoDarkMediaId: null,
    faviconMediaId: null,
    contactEmail: null,
    contactPhone: null,
    whatsapp: null,
    address: null,
    socials: {},
    navConfig: null,
    footer: null,
    editorVerificationRequired: verification,
    blogEnabled: false,
    visionMissionEnabled: false,
    visionText: null,
    missionText: null,
    logoShowTitle: true,
    showAdminShield: true,
  };
}

let slugN = 0;
const uniqueSlug = () => `p-${Date.now()}-${slugN++}`;

beforeAll(async () => {
  const t = await createTenant(db);
  tenantId = t.tenantId;
  adminId = t.userId;
  admin = { userId: adminId, tenantId, role: 'admin' };
  editor = { userId: adminId, tenantId, role: 'editor' };
});

afterAll(async () => {
  await cleanupTenant(db, tenantId);
  await closeTestDb();
});

describe('CreateProject + ContentVisibilityPolicy', () => {
  it('publishes admin content immediately when verification is on', async () => {
    await site.upsert(siteSettings(tenantId, true));
    const result = await createProject.execute(admin, { title: 'Admin One', slug: uniqueSlug() });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.status).toBe('published');
  });

  it('queues editor content for review when verification is on', async () => {
    await site.upsert(siteSettings(tenantId, true));
    const result = await createProject.execute(editor, { title: 'Editor One', slug: uniqueSlug() });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.status).toBe('pending_review');
  });

  it('publishes editor content immediately when verification is off', async () => {
    await site.upsert(siteSettings(tenantId, false));
    const result = await createProject.execute(editor, { title: 'Editor Two', slug: uniqueSlug() });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.status).toBe('published');
  });

  it('rejects a duplicate slug', async () => {
    const slug = uniqueSlug();
    await createProject.execute(admin, { title: 'Dupe', slug });
    const again = await createProject.execute(admin, { title: 'Dupe 2', slug });
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.error.code).toBe('CONFLICT');
  });
});

describe('PublishProject authorisation', () => {
  it('forbids an editor from publishing directly when verification is on', async () => {
    await site.upsert(siteSettings(tenantId, true));
    const created = await createProject.execute(editor, { title: 'Pending', slug: uniqueSlug() });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const result = await publishProject.execute(editor, created.value.id);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('FORBIDDEN');
  });

  it('lets an admin publish a pending project', async () => {
    await site.upsert(siteSettings(tenantId, true));
    const created = await createProject.execute(editor, { title: 'ToPublish', slug: uniqueSlug() });
    if (!created.ok) throw new Error('setup failed');
    const result = await publishProject.execute(admin, created.value.id);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.status).toBe('published');
  });
});

describe('UpdateProject on a published item', () => {
  it('forbids an editor from live-editing a published item when verification is on', async () => {
    await site.upsert(siteSettings(tenantId, true));
    const created = await createProject.execute(admin, { title: 'Live', slug: uniqueSlug() });
    if (!created.ok) throw new Error('setup failed');
    const result = await updateProject.execute(editor, {
      id: created.value.id,
      title: 'Hacked live',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('FORBIDDEN');
  });
});

describe('SubmitInquiry', () => {
  it('accepts a valid inquiry', async () => {
    const result = await submitInquiry.execute(tenantId, {
      name: 'Jane',
      email: 'jane@example.com',
      message: 'Hello',
    });
    expect(result.ok).toBe(true);
  });

  it('rejects an invalid email', async () => {
    const result = await submitInquiry.execute(tenantId, {
      name: 'Jane',
      email: 'not-an-email',
      message: 'Hello',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('VALIDATION');
  });
});
