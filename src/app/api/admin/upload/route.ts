import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getConfig } from '@config/app.config';
import { getActor } from '@/infrastructure/auth/actor';
import { isReadOnly } from '@/infrastructure/licence/licenceStatus';
import { StorageFactory } from '@/infrastructure/storage/StorageFactory';
import { getDb } from '@/infrastructure/db/client';
import { mediaAssets } from '@/infrastructure/db/schema';

export const runtime = 'nodejs';

/** Detect image type by magic bytes (never trust the extension or client content-type). */
function sniff(bytes: Uint8Array): { type: string; ext: string } | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return { type: 'image/jpeg', ext: 'jpg' };
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47)
    return { type: 'image/png', ext: 'png' };
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  )
    return { type: 'image/webp', ext: 'webp' };
  return null;
}

export async function POST(request: Request) {
  const actor = await getActor();
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (isReadOnly()) {
    return NextResponse.json({ error: 'This deployment is read-only (licence).' }, { status: 403 });
  }

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  const projectId = (form.get('projectId') as string) || null;
  const altText = (form.get('altText') as string) || null;

  const buffer = Buffer.from(await file.arrayBuffer());
  const kind = sniff(buffer);
  if (!kind) {
    return NextResponse.json(
      { error: 'Only JPEG, PNG or WebP images are allowed' },
      { status: 415 },
    );
  }

  const config = getConfig();
  const storage = StorageFactory.create(config);
  const key = `${actor.tenantId}/${randomUUID()}.${kind.ext}`;
  const stored = await storage.put({
    key,
    body: buffer,
    contentType: kind.type,
    visibility: 'public',
  });

  const [row] = await getDb()
    .insert(mediaAssets)
    .values({
      tenantId: actor.tenantId,
      projectId,
      type: 'image',
      storageDriver: stored.driver,
      storageKey: stored.key,
      url: stored.url,
      altText,
      status: 'ready',
    })
    .returning();

  return NextResponse.json({ media: row });
}
